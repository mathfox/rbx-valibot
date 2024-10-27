import type {
	LooseTupleIssue,
	LooseTupleSchema,
	LooseTupleSchemaAsync,
	StrictTupleIssue,
	StrictTupleSchema,
	StrictTupleSchemaAsync,
	TupleIssue,
	TupleSchema,
	TupleSchemaAsync,
	TupleWithRestIssue,
	TupleWithRestSchema,
	TupleWithRestSchemaAsync,
} from "../../schemas";
import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	BaseTransformation,
	ErrorMessage,
	InferInput,
	SuccessDataset,
	TupleItems,
	TupleItemsAsync,
	UnknownDataset,
} from "../../types";
import { ValiError } from "../../utils";

/**
 * Schema type.
 */
type Schema =
	| LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined>
	| LooseTupleSchemaAsync<TupleItemsAsync, ErrorMessage<LooseTupleIssue> | undefined>
	| StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined>
	| StrictTupleSchemaAsync<TupleItemsAsync, ErrorMessage<StrictTupleIssue> | undefined>
	| TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined>
	| TupleSchemaAsync<TupleItemsAsync, ErrorMessage<TupleIssue> | undefined>
	| TupleWithRestSchema<
			TupleItems,
			BaseSchema<unknown, unknown, BaseIssue<unknown>>,
			ErrorMessage<TupleWithRestIssue> | undefined
	  >
	| TupleWithRestSchemaAsync<
			TupleItemsAsync,
			BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
			ErrorMessage<TupleWithRestIssue> | undefined
	  >;

/**
 * Args action async type.
 *
 * @beta
 */
export interface ArgsActionAsync<TInput extends (...args: any[]) => unknown, TSchema extends Schema>
	extends BaseTransformation<TInput, (...args: InferInput<TSchema>) => Promise<Awaited<ReturnType<TInput>>>, never> {
	/**
	 * The action type.
	 */
	readonly type: "args";
	/**
	 * The action reference.
	 */
	readonly reference: typeof argsAsync;
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
 * @returns An args action.
 *
 * @beta
 */
export function argsAsync<TInput extends (...args: any[]) => unknown, TSchema extends Schema>(
	schema: TSchema,
): ArgsActionAsync<TInput, TSchema>;

export function argsAsync(schema: Schema): ArgsActionAsync<(...args: unknown[]) => unknown, Schema> {
	return {
		kind: "transformation",
		type: "args",
		reference: argsAsync,
		async: false,
		schema,
		_run(dataset, config) {
			const func = dataset.value;
			dataset.value = async (...args) => {
				const argsDataset = await (
					this as ArgsActionAsync<Callback, TupleSchemaAsync<TupleItemsAsync, ErrorMessage<TupleIssue> | undefined>>
				).schema._run({ value: args } as UnknownDataset, config);
				if (argsDataset.issues) {
					throw new ValiError(argsDataset.issues);
				}
				return func(...(argsDataset.value as [unknown, ...unknown[]]));
			};
			return dataset as SuccessDataset<(...args: unknown[]) => Promise<unknown>>;
		},
	};
}
