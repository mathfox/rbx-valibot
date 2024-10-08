import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseValidation, ErrorMessage, InferIssue, OutputDataset } from "../../types";
import { _addIssue } from "../../utils";
import type { CheckIssue } from "./types";

/**
 * Check action type.
 */
export interface CheckAction<TInput, TMessage extends ErrorMessage<CheckIssue<TInput>> | undefined>
	extends BaseValidation<TInput, TInput, CheckIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "check";
	/**
	 * The action reference.
	 */
	readonly reference: typeof check;
	/**
	 * The expected property.
	 */
	readonly expects: undefined;
	/**
	 * The validation function.
	 */
	readonly requirement: (input: TInput) => boolean;
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
export function check<TInput>(requirement: (input: TInput) => boolean): CheckAction<TInput, undefined>;

/**
 * Creates a check validation action.
 *
 * @param requirement The validation function.
 * @param message The error message.
 *
 * @returns A check action.
 */
export function check<TInput, const TMessage extends ErrorMessage<CheckIssue<TInput>> | undefined>(
	requirement: (input: TInput) => boolean,
	message: TMessage,
): CheckAction<TInput, TMessage>;

export function check(
	requirement: (input: unknown) => boolean,
	message?: ErrorMessage<CheckIssue<unknown>>,
): CheckAction<unknown, ErrorMessage<CheckIssue<unknown>> | undefined> {
	return {
		kind: "validation",
		type: "check",
		reference: check,
		async: false,
		expects: undefined,
		requirement,
		message,
		_run(dataset, config = getGlobalConfig()) {
			if (
				dataset.typed &&
				!(this as CheckAction<unknown, ErrorMessage<CheckIssue<unknown>> | undefined>).requirement(dataset.value)
			) {
				_addIssue(this, "input", dataset, config);
			}

			return dataset as OutputDataset<unknown, InferIssue<ReturnType<typeof check>>>;
		},
	};
}
