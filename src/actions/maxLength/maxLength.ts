import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import type { LengthInput } from "../types";

/**
 * Max length issue type.
 */
export interface MaxLengthIssue<TInput extends LengthInput, TRequirement extends number> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "max_length";
	/**
	 * The expected property.
	 */
	readonly expected: `<=${TRequirement}`;
	/**
	 * The received property.
	 */
	readonly received: `${number}`;
	/**
	 * The maximum length.
	 */
	readonly requirement: TRequirement;
}

/**
 * Max length action type.
 */
export interface MaxLengthAction<
	TInput extends LengthInput,
	TRequirement extends number,
	TMessage extends ErrorMessage<MaxLengthIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MaxLengthIssue<TInput, TRequirement>> {
	/**
	 * The action type.
	 */
	readonly type: "max_length";
	/**
	 * The action reference.
	 */
	readonly reference: typeof maxLength;
	/**
	 * The expected property.
	 */
	readonly expects: `<=${TRequirement}`;
	/**
	 * The maximum length.
	 */
	readonly requirement: TRequirement;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a max length validation action.
 *
 * @param requirement The maximum length.
 *
 * @returns A max length action.
 */
export function maxLength<TInput extends LengthInput, const TRequirement extends number>(
	requirement: TRequirement,
): MaxLengthAction<TInput, TRequirement, undefined>;

/**
 * Creates a max length validation action.
 *
 * @param requirement The maximum length.
 * @param message The error message.
 *
 * @returns A max length action.
 */
export function maxLength<
	TInput extends LengthInput,
	const TRequirement extends number,
	const TMessage extends ErrorMessage<MaxLengthIssue<TInput, TRequirement>> | undefined,
>(requirement: TRequirement, message: TMessage): MaxLengthAction<TInput, TRequirement, TMessage>;

export function maxLength(
	requirement: number,
	message?: ErrorMessage<MaxLengthIssue<LengthInput, number>>,
): MaxLengthAction<LengthInput, number, ErrorMessage<MaxLengthIssue<LengthInput, number>> | undefined> {
	return {
		kind: "validation",
		type: "max_length",
		reference: maxLength,
		async: false,
		expects: `<=${requirement}`,
		requirement,
		message,
		_run(dataset, config) {
			if (
				dataset.typed &&
				(dataset.value as ArrayLike<defined>).size() >
					(this as MaxLengthAction<LengthInput, number, ErrorMessage<MaxLengthIssue<LengthInput, number>> | undefined>)
						.requirement
			) {
				_addIssue(this, "length", dataset, config, {
					received: `${(dataset.value as ArrayLike<defined>).size()}`,
				});
			}

			return dataset;
		},
	};
}
