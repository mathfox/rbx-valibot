import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue, _stringify } from "../../utils";
import type { ValueInput } from "../types";

/**
 * Value issue type.
 */
export interface ValueIssue<TInput extends ValueInput, TRequirement extends TInput> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "value";
	/**
	 * The expected property.
	 */
	readonly expected: string;
	/**
	 * The required value.
	 */
	readonly requirement: TRequirement;
}

/**
 * Value action type.
 */
export interface ValueAction<
	TInput extends ValueInput,
	TRequirement extends TInput,
	TMessage extends ErrorMessage<ValueIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, ValueIssue<TInput, TRequirement>> {
	/**
	 * The action type.
	 */
	readonly type: "value";
	/**
	 * The action reference.
	 */
	readonly reference: typeof value;
	/**
	 * The expected property.
	 */
	readonly expects: string;
	/**
	 * The required value.
	 */
	readonly requirement: TRequirement;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a value validation action.
 *
 * @param requirement The required value.
 *
 * @returns A value action.
 */
export function value<TInput extends ValueInput, const TRequirement extends TInput>(
	requirement: TRequirement,
): ValueAction<TInput, TRequirement, undefined>;

/**
 * Creates a value validation action.
 *
 * @param requirement The required value.
 * @param message The error message.
 *
 * @returns A value action.
 */
export function value<
	TInput extends ValueInput,
	const TRequirement extends TInput,
	const TMessage extends ErrorMessage<ValueIssue<TInput, TRequirement>> | undefined,
>(requirement: TRequirement, message: TMessage): ValueAction<TInput, TRequirement, TMessage>;

export function value(
	requirement: ValueInput,
	message?: ErrorMessage<ValueIssue<ValueInput, ValueInput>>,
): ValueAction<ValueInput, ValueInput, ErrorMessage<ValueIssue<ValueInput, ValueInput>> | undefined> {
	return {
		kind: "validation",
		type: "value",
		reference: value,
		async: false,
		expects: _stringify(requirement),
		requirement,
		message,
		_run(dataset, config) {
			const requirement = (
				this as ValueAction<ValueInput, ValueInput, ErrorMessage<ValueIssue<ValueInput, ValueInput>> | undefined>
			).requirement;

			if (dataset.typed && !(requirement <= dataset.value && requirement >= dataset.value)) {
				_addIssue(this, "value", dataset, config, {
					received: _stringify(dataset.value),
				});
			}

			return dataset;
		},
	};
}
