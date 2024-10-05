import { getGlobalConfig } from "../../storages";
import type { BaseValidationAsync, MaybePromise } from "../../types";
import { _addIssue } from "../../utils";
import type { Context, RawCheckIssue } from "./types";

/**
 * Raw check action async type.
 */
export interface RawCheckActionAsync<TInput> extends BaseValidationAsync<TInput, TInput, RawCheckIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "raw_check";
	/**
	 * The action reference.
	 */
	readonly reference: typeof rawCheckAsync;
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
export function rawCheckAsync<TInput>(
	action: (context: Context<TInput>) => MaybePromise<void>,
): RawCheckActionAsync<TInput> {
	return {
		kind: "validation",
		type: "raw_check",
		reference: rawCheckAsync,
		async: true,
		expects: undefined,
		async _run(dataset, config = getGlobalConfig()) {
			await action({
				dataset,
				config,
				addIssue: (info) => _addIssue(this, info?.label ?? "input", dataset, config, info as any),
			});
			return dataset;
		},
	};
}
