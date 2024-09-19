import type { BaseTransformation } from "../../types";

/**
 * Trim action type.
 */
export interface TrimAction extends BaseTransformation<string, string, never> {
	/**
	 * The action type.
	 */
	readonly type: "trim";
	/**
	 * The action reference.
	 */
	readonly reference: typeof trim;
}

/**
 * Creates a trim transformation action.
 *
 * @returns A trim action.
 */
export function trim(): TrimAction {
	return {
		kind: "transformation",
		type: "trim",
		reference: trim,
		async: false,
		_run(dataset) {
			dataset.value = dataset.value.gsub("^%s+", "")[0].gsub("%s+$", "")[0];
			return dataset;
		},
	};
}
