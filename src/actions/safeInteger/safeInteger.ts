import { isSafeInteger } from "@rbxts/phantom/src/Number";
import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import { getGlobalConfig } from "../../storages";

/**
 * Safe integer issue type.
 */
export interface SafeIntegerIssue<TInput extends number> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "safe_integer";
	/**
	 * The expected property.
	 */
	readonly expected: undefined;
	/**
	 * The received property.
	 */
	readonly received: `${number}`;
	/**
	 * The validation function.
	 */
	readonly requirement: (input: number) => boolean;
}

/**
 * Safe integer action type.
 */
export interface SafeIntegerAction<
	TInput extends number,
	TMessage extends ErrorMessage<SafeIntegerIssue<TInput>> | undefined,
> extends BaseValidation<TInput, TInput, SafeIntegerIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "safe_integer";
	/**
	 * The action reference.
	 */
	readonly reference: typeof safeInteger;
	/**
	 * The expected property.
	 */
	readonly expects: undefined;
	/**
	 * The validation function.
	 */
	readonly requirement: (input: number) => boolean;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a safe integer validation action.
 *
 * @returns A safe integer action.
 */
export function safeInteger<TInput extends number>(): SafeIntegerAction<TInput, undefined>;

/**
 * Creates a safe integer validation action.
 *
 * @param message The error message.
 *
 * @returns A safe integer action.
 */
export function safeInteger<
	TInput extends number,
	const TMessage extends ErrorMessage<SafeIntegerIssue<TInput>> | undefined,
>(message: TMessage): SafeIntegerAction<TInput, TMessage>;

export function safeInteger(
	message?: ErrorMessage<SafeIntegerIssue<number>>,
): SafeIntegerAction<number, ErrorMessage<SafeIntegerIssue<number>> | undefined> {
	return {
		kind: "validation",
		type: "safe_integer",
		reference: safeInteger,
		async: false,
		expects: undefined,
		requirement: isSafeInteger,
		message,
		_run(dataset, config = getGlobalConfig()) {
			if (
				dataset.typed &&
				!(this as SafeIntegerAction<number, ErrorMessage<SafeIntegerIssue<number>> | undefined>).requirement(
					dataset.value,
				)
			) {
				_addIssue(this, "safe integer", dataset, config);
			}

			return dataset;
		},
	};
}
