import { getGlobalConfig } from "../../storages";
import type { BaseValidationAsync, ErrorMessage, InferIssue, MaybePromise, OutputDataset } from "../../types";
import { _addIssue } from "../../utils";
import type { CheckIssue } from "./types";

/**
 * Check action async type.
 */
export interface CheckActionAsync<TInput, TMessage extends ErrorMessage<CheckIssue<TInput>> | undefined>
	extends BaseValidationAsync<TInput, TInput, CheckIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "check";
	/**
	 * The action reference.
	 */
	readonly reference: typeof checkAsync;
	/**
	 * The expected property.
	 */
	readonly expects: undefined;
	/**
	 * The validation function.
	 */
	readonly requirement: (input: TInput) => MaybePromise<boolean>;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a check validation action.
 *
 * @param requirement The validation function.
 *
 * @returns A check action.
 */
export function checkAsync<TInput>(
	requirement: (input: TInput) => MaybePromise<boolean>,
): CheckActionAsync<TInput, undefined>;

/**
 * Creates a check validation action.
 *
 * @param requirement The validation function.
 * @param message The error message.
 *
 * @returns A check action.
 */
export function checkAsync<TInput, const TMessage extends ErrorMessage<CheckIssue<TInput>> | undefined>(
	requirement: (input: TInput) => MaybePromise<boolean>,
	message: TMessage,
): CheckActionAsync<TInput, TMessage>;

export function checkAsync(
	requirement: (input: unknown) => MaybePromise<boolean>,
	message?: ErrorMessage<CheckIssue<unknown>>,
): CheckActionAsync<unknown, ErrorMessage<CheckIssue<unknown>> | undefined> {
	return {
		kind: "validation",
		type: "check",
		reference: checkAsync,
		async: true,
		expects: undefined,
		requirement,
		message,
		async _run(dataset, config = getGlobalConfig()) {
			if (
				dataset.typed &&
				!(await (this as CheckActionAsync<unknown, ErrorMessage<CheckIssue<unknown>> | undefined>).requirement(
					dataset.value,
				))
			) {
				_addIssue(this, "input", dataset, config);
			}

			return dataset as OutputDataset<unknown, InferIssue<ReturnType<typeof checkAsync>>>;
		},
	};
}
