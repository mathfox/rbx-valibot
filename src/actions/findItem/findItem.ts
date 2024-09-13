import type { BaseTransformation, MaybeReadonly, TypedDataset } from "../../types";
import type { ArrayInput, ArrayRequirement } from "../types";

/**
 * Find item action type.
 */
export interface FindItemAction<TInput extends ArrayInput>
	extends BaseTransformation<TInput, TInput[number] | undefined, never> {
	/**
	 * The action type.
	 */
	readonly type: "find_item";
	/**
	 * The action reference.
	 */
	readonly reference: typeof findItem;
	/**
	 * The find item operation.
	 */
	readonly operation: ArrayRequirement<TInput>;
}

/**
 * Creates a find item transformation action.
 *
 * @param operation The find item operation.
 *
 * @returns A find item action.
 */
export function findItem<TInput extends ArrayInput>(operation: ArrayRequirement<TInput>): FindItemAction<TInput>;

export function findItem(operation: ArrayRequirement<unknown[]>): FindItemAction<unknown[]> {
	return {
		kind: "transformation",
		type: "find_item",
		reference: findItem,
		async: false,
		operation,
		_run(dataset) {
			dataset.value = (dataset.value as defined[]).find(
				this.operation as ArrayRequirement<MaybeReadonly<defined[]>>,
			) as defined[];
			return dataset as TypedDataset<unknown, never>;
		},
	};
}
