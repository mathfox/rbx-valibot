import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import type { LengthInput } from "../types";

/**
 * Min length issue type.
 */
export interface MinLengthIssue<TInput extends LengthInput, TRequirement extends number> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "min_length";
	/**
	 * The expected property.
	 */
	readonly expected: `>=${TRequirement}`;
	/**
	 * The received property.
	 */
	readonly received: `${number}`;
	/**
	 * The minimum length.
	 */
	readonly requirement: TRequirement;
}

/**
 * Min length action type.
 */
export interface MinLengthAction<
	TInput extends LengthInput,
	TRequirement extends number,
	TMessage extends ErrorMessage<MinLengthIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MinLengthIssue<TInput, TRequirement>> {
	/**
	 * The action type.
	 */
	readonly type: "min_length";
	/**
	 * The action reference.
	 */
	readonly reference: typeof minLength;
	/**
	 * The expected property.
	 */
	readonly expects: `>=${TRequirement}`;
	/**
	 * The minimum length.
	 */
	readonly requirement: TRequirement;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a min length validation action.
 *
 * @param requirement The minimum length.
 *
 * @returns A min length action.
 */
export function minLength<TInput extends LengthInput, const TRequirement extends number>(
	requirement: TRequirement,
): MinLengthAction<TInput, TRequirement, undefined>;

/**
 * Creates a min length validation action.
 *
 * @param requirement The minimum length.
 * @param message The error message.
 *
 * @returns A min length action.
 */
export function minLength<
	TInput extends LengthInput,
	const TRequirement extends number,
	const TMessage extends ErrorMessage<MinLengthIssue<TInput, TRequirement>> | undefined,
>(requirement: TRequirement, message: TMessage): MinLengthAction<TInput, TRequirement, TMessage>;

export function minLength(
	requirement: number,
	message?: ErrorMessage<MinLengthIssue<LengthInput, number>>,
): MinLengthAction<LengthInput, number, ErrorMessage<MinLengthIssue<LengthInput, number>> | undefined> {
	return {
		kind: "validation",
		type: "min_length",
		reference: minLength,
		async: false,
		expects: `>=${requirement}`,
		requirement,
		message,
		_run(dataset, config) {
			if (dataset.typed && dataset.value.length < this.requirement) {
				_addIssue(this, "length", dataset, config, {
					received: `${dataset.value.length}`,
				});
			}
			return dataset;
		},
	};
}
