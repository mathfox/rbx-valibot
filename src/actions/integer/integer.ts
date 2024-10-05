import isInteger from "@rbxts/phantom/src/Number/isInteger";
import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import { getGlobalConfig } from "../../storages";

/**
 * Integer issue type.
 */
export interface IntegerIssue<TInput extends number> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "integer";
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
 * Integer action type.
 */
export interface IntegerAction<TInput extends number, TMessage extends ErrorMessage<IntegerIssue<TInput>> | undefined>
	extends BaseValidation<TInput, TInput, IntegerIssue<TInput>> {
	/**
	 * The action type.
	 */
	readonly type: "integer";
	/**
	 * The action reference.
	 */
	readonly reference: typeof integer;
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
 * Creates an [integer](https://en.wikipedia.org/wiki/Integer) validation action.
 *
 * @returns An integer action.
 */
export function integer<TInput extends number>(): IntegerAction<TInput, undefined>;

/**
 * Creates an [integer](https://en.wikipedia.org/wiki/Integer) validation action.
 *
 * @param message The error message.
 *
 * @returns An integer action.
 */
export function integer<TInput extends number, const TMessage extends ErrorMessage<IntegerIssue<TInput>> | undefined>(
	message: TMessage,
): IntegerAction<TInput, TMessage>;

export function integer(
	message?: ErrorMessage<IntegerIssue<number>>,
): IntegerAction<number, ErrorMessage<IntegerIssue<number>> | undefined> {
	return {
		kind: "validation",
		type: "integer",
		reference: integer,
		async: false,
		expects: undefined,
		requirement: isInteger,
		message,
		_run(dataset, config = getGlobalConfig()) {
			if (
				dataset.typed &&
				!(this as IntegerAction<number, ErrorMessage<IntegerIssue<number>> | undefined>).requirement(dataset.value)
			) {
				_addIssue(this, "integer", dataset, config);
			}

			return dataset;
		},
	};
}
