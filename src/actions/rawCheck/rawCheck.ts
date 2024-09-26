import type { BaseValidation } from "../../types";
import { _addIssue } from "../../utils";
import type { Context, RawCheckIssue } from "./types";

/**
 * Raw check action type.
 */
export interface RawCheckAction<TInput> extends BaseValidation<TInput, TInput, RawCheckIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "raw_check";
	/**
	 * The action reference.
	 */
	readonly reference: typeof rawCheck;
	/**
	 * The expected property.
	 */
	readonly expects: undefined;
}

/**
 * Creates a raw check validation action.
 *
 * @param action The validation action.
 *
 * @returns A raw check action.
 */
export function rawCheck<TInput>(action: (context: Context<TInput>) => void): RawCheckAction<TInput> {
	return {
		kind: "validation",
		type: "raw_check",
		reference: rawCheck,
		async: false,
		expects: undefined,
		_run(dataset, config) {
			action({
				dataset,
				config,
				addIssue: (info) => _addIssue(this, info?.label ?? "input", dataset, config, info as any),
			});

			return dataset;
		},
	};
}
