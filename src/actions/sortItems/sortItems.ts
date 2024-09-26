import type { BaseTransformation, MaybeReadonly } from "../../types";
import type { ArrayInput } from "../types";

/**
 * Array action type.
 */
type ArrayAction<TInput extends ArrayInput> = (itemA: TInput[number], itemB: TInput[number]) => number;

/**
 * Sort items action type.
 */
export interface SortItemsAction<TInput extends ArrayInput> extends BaseTransformation<TInput, TInput, never> {
	/**
	 * The action type.
	 */
	readonly type: "sort_items";
	/**
	 * The action reference.
	 */
	readonly reference: typeof sortItems;
	/**
	 * The sort items operation.
	 */
	readonly operation: ArrayAction<TInput> | undefined;
}

/**
 * Creates a sort items transformation action.
 *
 * @param operation The sort items operation.
 *
 * @returns A sort items action.
 */
export function sortItems<TInput extends ArrayInput>(operation?: ArrayAction<TInput>): SortItemsAction<TInput>;

export function sortItems(operation?: ArrayAction<unknown[]>): SortItemsAction<unknown[]> {
	return {
		kind: "transformation",
		type: "sort_items",
		reference: sortItems,
		async: false,
		operation,
		_run(dataset) {
			dataset.value = (dataset.value as defined[]).sort((this as SortItemsAction<unknown[]>).operation as any);

			return dataset;
		},
	};
}
