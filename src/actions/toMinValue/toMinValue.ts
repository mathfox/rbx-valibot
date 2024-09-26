import type { BaseTransformation } from "../../types";
import type { ValueInput } from "../types";

/**
 * To min value action type.
 */
export interface ToMinValueAction<TInput extends ValueInput, TRequirement extends TInput>
	extends BaseTransformation<TInput, TInput, never> {
	/**
	 * The action type.
	 */
	readonly type: "to_min_value";
	/**
	 * The action reference.
	 */
	readonly reference: typeof toMinValue;
	/**
	 * The minimum value.
	 */
	readonly requirement: TRequirement;
}

/**
 * Creates a to min value transformation action.
 *
 * @param requirement The minimum value.
 *
 * @returns A to min value action.
 */
export function toMinValue<TInput extends ValueInput, const TRequirement extends TInput>(
	requirement: TRequirement,
): ToMinValueAction<TInput, TRequirement> {
	return {
		kind: "transformation",
		type: "to_min_value",
		reference: toMinValue,
		async: false,
		requirement,
		_run(dataset) {
			const requirement = (this as ToMinValueAction<TInput, TRequirement>).requirement;

			dataset.value = dataset.value < requirement ? requirement : dataset.value;

			return dataset;
		},
	};
}
