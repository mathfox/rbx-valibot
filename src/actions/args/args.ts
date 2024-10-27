import type {
	LooseTupleIssue,
	LooseTupleSchema,
	StrictTupleIssue,
	StrictTupleSchema,
	TupleIssue,
	TupleSchema,
	TupleWithRestIssue,
	TupleWithRestSchema,
} from "../../schemas";
import type {
	BaseIssue,
	BaseSchema,
	BaseTransformation,
	ErrorMessage,
	InferInput,
	TupleItems,
	UnknownDataset,
} from "../../types";
import { ValiError } from "../../utils";

/**
 * Schema type.
 */
type Schema =
	| LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined>
	| StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined>
	| TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined>
	| TupleWithRestSchema<
			TupleItems,
			BaseSchema<unknown, unknown, BaseIssue<unknown>>,
			ErrorMessage<TupleWithRestIssue> | undefined
	  >;

/**
 * Args action type.
 *
 * @beta
 */
export interface ArgsAction<TInput extends (...args: any[]) => unknown, TSchema extends Schema>
	extends BaseTransformation<TInput, (...args: InferInput<TSchema>) => ReturnType<TInput>, never> {
	/**
	 * The action type.
	 */
	readonly type: "args";
	/**
	 * The action reference.
	 */
	readonly reference: typeof args;
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
export function args<TInput extends (...args: any[]) => unknown, TSchema extends Schema>(
	schema: TSchema,
): ArgsAction<TInput, TSchema>;

export function args(schema: Schema): ArgsAction<(...args: unknown[]) => unknown, Schema> {
	return {
		kind: "transformation",
		type: "args",
		reference: args,
		async: false,
		schema,
		_run(dataset, config) {
			const func = dataset.value;
			dataset.value = (...args_) => {
				const argsDataset = (this as ArgsAction<(...args: unknown[]) => unknown, Schema>).schema._run(
					{ value: args_ } as UnknownDataset,
					config,
				);
				if (argsDataset.issues) {
					throw new ValiError(argsDataset.issues);
				}

				return func(...(argsDataset.value as [unknown, ...unknown[]]));
			};
			return dataset;
		},
	};
}
