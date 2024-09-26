import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue, _stringify } from "../../utils";
import type { ValueInput } from "../types";

/**
 * Not value issue type.
 */
export interface NotValueIssue<TInput extends ValueInput, TRequirement extends TInput> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "not_value";
	/**
	 * The expected property.
	 */
	readonly expected: `!${string}`;
	/**
	 * The not required value.
	 */
	readonly requirement: TRequirement;
}

/**
 * Not value action type.
 */
export interface NotValueAction<
	TInput extends ValueInput,
	TRequirement extends TInput,
	TMessage extends ErrorMessage<NotValueIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, NotValueIssue<TInput, TRequirement>> {
	/**
	 * The action type.
	 */
	readonly type: "not_value";
	/**
	 * The action reference.
	 */
	readonly reference: typeof notValue;
	/**
	 * The expected property.
	 */
	readonly expects: `!${string}`;
	/**
	 * The not required value.
	 */
	readonly requirement: TRequirement;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a not value validation action.
 *
 * @param requirement The not required value.
 *
 * @returns A not value action.
 */
export function notValue<TInput extends ValueInput, const TRequirement extends TInput>(
	requirement: TRequirement,
): NotValueAction<TInput, TRequirement, undefined>;

/**
 * Creates a not value validation action.
 *
 * @param requirement The not required value.
 * @param message The error message.
 *
 * @returns A not value action.
 */
export function notValue<
	TInput extends ValueInput,
	const TRequirement extends TInput,
	const TMessage extends ErrorMessage<NotValueIssue<TInput, TRequirement>> | undefined,
>(requirement: TRequirement, message: TMessage): NotValueAction<TInput, TRequirement, TMessage>;

export function notValue(
	requirement: ValueInput,
	message?: ErrorMessage<NotValueIssue<ValueInput, ValueInput>>,
): NotValueAction<ValueInput, ValueInput, ErrorMessage<NotValueIssue<ValueInput, ValueInput>> | undefined> {
	return {
		kind: "validation",
		type: "not_value",
		reference: notValue,
		async: false,
		expects: `!${_stringify(requirement)}`,
		requirement,
		message,
		_run(dataset, config) {
			if (
				dataset.typed &&
				(
					this as NotValueAction<
						ValueInput,
						ValueInput,
						ErrorMessage<NotValueIssue<ValueInput, ValueInput>> | undefined
					>
				).requirement <= dataset.value &&
				(
					this as NotValueAction<
						ValueInput,
						ValueInput,
						ErrorMessage<NotValueIssue<ValueInput, ValueInput>> | undefined
					>
				).requirement >= dataset.value
			) {
				_addIssue(this, "value", dataset, config, {
					received: _stringify(dataset.value),
				});
			}

			return dataset;
		},
	};
}
