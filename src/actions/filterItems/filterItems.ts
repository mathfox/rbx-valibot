import type { BaseTransformation, MaybeReadonly } from "../../types";
import type { ArrayInput, ArrayRequirement } from "../types";

/**
 * Filter items action type.
 */
export interface FilterItemsAction<TInput extends ArrayInput> extends BaseTransformation<TInput, TInput, never> {
	/**
	 * The action type.
	 */
	readonly type: "filter_items";
	/**
	 * The action reference.
	 */
	readonly reference: typeof filterItems;
	/**
	 * The filter items operation.
	 */
	readonly operation: ArrayRequirement<TInput>;
}

/**
 * Creates a filter items transformation action.
 *
 * @param operation The filter items operation.
 *
 * @returns A filter items action.
 */
export function filterItems<TInput extends ArrayInput>(operation: ArrayRequirement<TInput>): FilterItemsAction<TInput>;

export function filterItems(operation: ArrayRequirement<unknown[]>): FilterItemsAction<unknown[]> {
	return {
		kind: "transformation",
		type: "filter_items",
		reference: filterItems,
		async: false,
		operation,
		_run(dataset) {
			dataset.value = (dataset.value as defined[]).filter(
				(this as FilterItemsAction<unknown[]>).operation as ArrayRequirement<MaybeReadonly<defined[]>>,
			);

			return dataset;
		},
	};
}
