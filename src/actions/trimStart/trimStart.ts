import type { BaseTransformation } from "../../types";

/**
 * Trim start action type.
 */
export interface TrimStartAction extends BaseTransformation<string, string, never> {
	/**
	 * The action type.
	 */
	readonly type: "trim_start";
	/**
	 * The action reference.
	 */
	readonly reference: typeof trimStart;
}

/**
 * Creates a trim start transformation action.
 *
 * @returns A trim start action.
 */
export function trimStart(): TrimStartAction {
	return {
		kind: "transformation",
		type: "trim_start",
		reference: trimStart,
		async: false,
		_run(dataset) {
			dataset.value = dataset.value.trimStart();
			return dataset;
		},
	};
}
