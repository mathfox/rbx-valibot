import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";
import type { ValueInput } from "../types";

/**
 * Max value issue type.
 */
export interface MaxValueIssue<TInput extends ValueInput, TRequirement extends ValueInput> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "max_value";
	/**
	 * The expected property.
	 */
	readonly expected: `<=${string}`;
	/**
	 * The maximum value.
	 */
	readonly requirement: TRequirement;
}

/**
 * Max value action type.
 */
export interface MaxValueAction<
	TInput extends ValueInput,
	TRequirement extends TInput,
	TMessage extends ErrorMessage<MaxValueIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MaxValueIssue<TInput, TRequirement>> {
	/**
	 * The action type.
	 */
	readonly type: "max_value";
	/**
	 * The action reference.
	 */
	readonly reference: typeof maxValue;
	/**
	 * The expected property.
	 */
	readonly expects: `<=${string}`;
	/**
	 * The maximum value.
	 */
	readonly requirement: TRequirement;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a max value validation action.
 *
 * @param requirement The maximum value.
 *
 * @returns A max value action.
 */
export function maxValue<TInput extends ValueInput, const TRequirement extends TInput>(
	requirement: TRequirement,
): MaxValueAction<TInput, TRequirement, undefined>;

/**
 * Creates a max value validation action.
 *
 * @param requirement The maximum value.
 * @param message The error message.
 *
 * @returns A max value action.
 */
export function maxValue<
	TInput extends ValueInput,
	const TRequirement extends TInput,
	const TMessage extends ErrorMessage<MaxValueIssue<TInput, TRequirement>> | undefined,
>(requirement: TRequirement, message: TMessage): MaxValueAction<TInput, TRequirement, TMessage>;

export function maxValue(
	requirement: ValueInput,
	message?: ErrorMessage<MaxValueIssue<ValueInput, ValueInput>>,
): MaxValueAction<ValueInput, ValueInput, ErrorMessage<MaxValueIssue<ValueInput, ValueInput>> | undefined> {
	return {
		kind: "validation",
		type: "max_value",
		reference: maxValue,
		async: false,
		expects: `<=${tostring(requirement)}`,
		requirement,
		message,
		_run(dataset, config) {
			if (dataset.typed && dataset.value > this.requirement) {
				_addIssue(this, "value", dataset, config, {
					received: tostring(dataset.value),
				});
			}
			return dataset;
		},
	};
}
