import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	BaseTransformation,
	InferOutput,
	SuccessDataset,
	UnknownDataset,
} from "../../types";
import { ValiError } from "../../utils";

/**
 * Returns action async type.
 *
 * @beta
 */
export interface ReturnsActionAsync<
	TInput extends (...args: any[]) => unknown,
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> extends BaseTransformation<TInput, (...args: Parameters<TInput>) => Promise<Awaited<InferOutput<TSchema>>>, never> {
	/**
	 * The action type.
	 */
	readonly type: "returns";
	/**
	 * The action reference.
	 */
	readonly reference: typeof returnsAsync;
	/**
	 * The arguments schema.
	 */
	readonly schema: TSchema;
}

/**
 * Creates a funtion arguments transformation action.
 *
 * @param schema The arguments schema.
 *
 * @returns An returns action.
 *
 * @beta
 */
export function returnsAsync<
	TInput extends (...args: any[]) => unknown,
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): ReturnsActionAsync<TInput, TSchema>;

export function returnsAsync(
	schema: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
): ReturnsActionAsync<
	(...args: unknown[]) => unknown,
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
> {
	return {
		kind: "transformation",
		type: "returns",
		reference: returnsAsync,
		async: false,
		schema,
		_run(dataset, config) {
			const func = dataset.value;
			dataset.value = async (...args_) => {
				const returnsDataset = await (
					this as ReturnsActionAsync<
						(...args: unknown[]) => unknown,
						BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
					>
				).schema._run({ value: await func(...args_) } as UnknownDataset, config);
				if (returnsDataset.issues) {
					throw new ValiError(returnsDataset.issues);
				}
				return returnsDataset.value;
			};
			return dataset as SuccessDataset<(...args: unknown[]) => Promise<unknown>>;
		},
	};
}
