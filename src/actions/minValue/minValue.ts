import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseValidation, ErrorMessage } from "../../types";
import { _addIssue, _stringify } from "../../utils";

type ValueInput = number;

/**
 * Min value issue type.
 */
export interface MinValueIssue<TInput extends ValueInput, TRequirement extends ValueInput> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "min_value";
	/**
	 * The expected property.
	 */
	readonly expected: `>=${string}`;
	/**
	 * The minimum value.
	 */
	readonly requirement: TRequirement;
}

/**
 * Min value action type.
 */
export interface MinValueAction<
	TInput extends ValueInput,
	TRequirement extends TInput,
	TMessage extends ErrorMessage<MinValueIssue<TInput, TRequirement>> | undefined,
> extends BaseValidation<TInput, TInput, MinValueIssue<TInput, TRequirement>> {
	/**
	 * The action type.
	 */
	readonly type: "min_value";
	/**
	 * The action reference.
	 */
	readonly reference: typeof minValue;
	/**
	 * The expected property.
	 */
	readonly expects: `>=${string}`;
	/**
	 * The minimum value.
	 */
	readonly requirement: TRequirement;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a min value validation action.
 *
 * @param requirement The minimum value.
 *
 * @returns A min value action.
 */
export function minValue<TInput extends ValueInput, const TRequirement extends TInput>(
	requirement: TRequirement,
): MinValueAction<TInput, TRequirement, undefined>;

/**
 * Creates a min value validation action.
 *
 * @param requirement The minimum value.
 * @param message The error message.
 *
 * @returns A min value action.
 */
export function minValue<
	TInput extends ValueInput,
	const TRequirement extends TInput,
	const TMessage extends ErrorMessage<MinValueIssue<TInput, TRequirement>> | undefined,
>(requirement: TRequirement, message: TMessage): MinValueAction<TInput, TRequirement, TMessage>;

export function minValue(
	requirement: ValueInput,
	message?: ErrorMessage<MinValueIssue<ValueInput, ValueInput>>,
): MinValueAction<ValueInput, ValueInput, ErrorMessage<MinValueIssue<ValueInput, ValueInput>> | undefined> {
	return {
		kind: "validation",
		type: "min_value",
		reference: minValue,
		async: false,
		expects: `>=${_stringify(requirement)}`,
		requirement,
		message,
		_run(dataset, config = getGlobalConfig()) {
			const typedThis = this as MinValueAction<
				ValueInput,
				ValueInput,
				ErrorMessage<MinValueIssue<ValueInput, ValueInput>> | undefined
			>;

			if (dataset.typed && dataset.value < typedThis.requirement) {
				_addIssue(this, "value", dataset, config, {
					received: _stringify(dataset.value),
				});
			}

			return dataset;
		},
	};
}
