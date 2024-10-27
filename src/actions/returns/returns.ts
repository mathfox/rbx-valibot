import type { BaseIssue, BaseSchema, BaseTransformation, InferOutput, UnknownDataset } from "../../types";
import { ValiError } from "../../utils";

/**
 * Returns action type.
 *
 * @beta
 */
export interface ReturnsAction<
	TInput extends (...args: any[]) => unknown,
	TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
> extends BaseTransformation<TInput, (...args: Parameters<TInput>) => InferOutput<TSchema>, never> {
	/**
	 * The action type.
	 */
	readonly type: "returns";
	/**
	 * The action reference.
	 */
	readonly reference: typeof returns;
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
export function returns<
	TInput extends (...args: any[]) => unknown,
	TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): ReturnsAction<TInput, TSchema>;

export function returns(
	schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
): ReturnsAction<(...args: unknown[]) => unknown, BaseSchema<unknown, unknown, BaseIssue<unknown>>> {
	return {
		kind: "transformation",
		type: "returns",
		reference: returns,
		async: false,
		schema,
		_run(dataset, config) {
			const func = dataset.value;
			dataset.value = (...args_) => {
				const returnsDataset = (
					this as ReturnsAction<(...args: unknown[]) => unknown, BaseSchema<unknown, unknown, BaseIssue<unknown>>>
				).schema._run({ value: func(...args_) } as UnknownDataset, config);
				if (returnsDataset.issues) {
					throw new ValiError(returnsDataset.issues);
				}
				return returnsDataset.value;
			};
			return dataset;
		},
	};
}
