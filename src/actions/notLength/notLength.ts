import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import type { LengthInput } from "../types";

/**
 * Not length issue type.
 */
export interface NotLengthIssue<TInput extends LengthInput, TRequirement extends number> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "not_length";
	/**
	 * The expected property.
	 */
	readonly expected: `!${TRequirement}`;
	/**
	 * The received property.
	 */
	readonly received: `${TRequirement}`;
	/**
	 * The not required length.
	 */
	readonly requirement: TRequirement;
}

/**
 * Not length action type.
 */
export interface NotLengthAction<
	TInput extends LengthInput,
	TRequirement extends number,
	TMessage extends ErrorMessage<NotLengthIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, NotLengthIssue<TInput, TRequirement>> {
	/**
	 * The action type.
	 */
	readonly type: "not_length";
	/**
	 * The action reference.
	 */
	readonly reference: typeof notLength;
	/**
	 * The expected property.
	 */
	readonly expects: `!${TRequirement}`;
	/**
	 * The not required length.
	 */
	readonly requirement: TRequirement;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a not length validation action.
 *
 * @param requirement The not required length.
 *
 * @returns A not length action.
 */
export function notLength<TInput extends LengthInput, const TRequirement extends number>(
	requirement: TRequirement,
): NotLengthAction<TInput, TRequirement, undefined>;

/**
 * Creates a not length validation action.
 *
 * @param requirement The not required length.
 * @param message The error message.
 *
 * @returns A not length action.
 */
export function notLength<
	TInput extends LengthInput,
	const TRequirement extends number,
	const TMessage extends ErrorMessage<NotLengthIssue<TInput, TRequirement>> | undefined,
>(requirement: TRequirement, message: TMessage): NotLengthAction<TInput, TRequirement, TMessage>;

export function notLength(
	requirement: number,
	message?: ErrorMessage<NotLengthIssue<LengthInput, number>>,
): NotLengthAction<LengthInput, number, ErrorMessage<NotLengthIssue<LengthInput, number>> | undefined> {
	return {
		kind: "validation",
		type: "not_length",
		reference: notLength,
		async: false,
		expects: `!${requirement}`,
		requirement,
		message,
		_run(dataset, config = getGlobalConfig()) {
			if (
				dataset.typed &&
				(dataset.value as ArrayLike<unknown>).size() ===
					(this as NotLengthAction<LengthInput, number, ErrorMessage<NotLengthIssue<LengthInput, number>> | undefined>)
						.requirement
			) {
				_addIssue(this, "length", dataset, config, {
					received: `${(dataset.value as ArrayLike<unknown>).size()}`,
				});
			}

			return dataset;
		},
	};
}
