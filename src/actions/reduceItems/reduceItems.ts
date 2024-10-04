import type { BaseTransformation, MaybeReadonly, OutputDataset } from "../../types";
import type { ArrayInput } from "../types";

/**
 * Array action type.
 */
type ArrayAction<TInput extends ArrayInput, TOutput> = (
	output: TOutput,
	item: TInput[number],
	index: number,
	array: TInput,
) => TOutput;

/**
 * Reduce items action type.
 */
export interface ReduceItemsAction<TInput extends ArrayInput, TOutput>
	extends BaseTransformation<TInput, TOutput, never> {
	/**
	 * The action type.
	 */
	readonly type: "reduce_items";
	/**
	 * The action reference.
	 */
	readonly reference: typeof reduceItems;
	/**
	 * The reduce items operation.
	 */
	readonly operation: ArrayAction<TInput, TOutput>;
	/**
	 * The initial value.
	 */
	readonly initial: TOutput;
}

/**
 * Creates a reduce items transformation action.
 *
 * @param operation The reduce items operation.
 * @param initial The initial value.
 *
 * @returns A reduce items action.
 */
export function reduceItems<TInput extends ArrayInput, TOutput>(
	operation: ArrayAction<TInput, TOutput>,
	initial: TOutput,
): ReduceItemsAction<TInput, TOutput>;

export function reduceItems(
	operation: ArrayAction<unknown[], unknown>,
	initial: unknown,
): ReduceItemsAction<unknown[], unknown> {
	return {
		kind: "transformation",
		type: "reduce_items",
		reference: reduceItems,
		async: false,
		operation,
		initial,
		_run(dataset) {
			dataset.value = (dataset.value as Array<defined>).reduce(
				(this as ReduceItemsAction<unknown[], unknown>).operation as ArrayAction<MaybeReadonly<defined[]>, defined>,
				(this as ReduceItemsAction<unknown[], unknown>).initial as defined,
			) as defined[];

			return dataset as OutputDataset<unknown, never>;
		},
	};
}
