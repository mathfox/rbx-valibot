import isSet from "@rbxts/phantom/src/Set/isSet";
import type { BaseIssue, BaseSchema, Dataset, ErrorMessage, InferIssue } from "../../types";
import { _addIssue } from "../../utils";
import type { InferSetInput, InferSetOutput, SetIssue } from "./types";

/**
 * Set schema type.
 */
export interface SetSchema<
	TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<SetIssue> | undefined,
> extends BaseSchema<InferSetInput<TValue>, InferSetOutput<TValue>, SetIssue | InferIssue<TValue>> {
	/**
	 * The schema type.
	 */
	readonly type: "set";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof set;
	/**
	 * The expected property.
	 */
	readonly expects: "Set";
	/**
	 * The set value schema.
	 */
	readonly value: TValue;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a set schema.
 *
 * @param value The value schema.
 *
 * @returns A set schema.
 */
export function set<const TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	value: TValue,
): SetSchema<TValue, undefined>;

/**
 * Creates a set schema.
 *
 * @param value The value schema.
 * @param message The error message.
 *
 * @returns A set schema.
 */
export function set<
	const TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<SetIssue> | undefined,
>(value: TValue, message: TMessage): SetSchema<TValue, TMessage>;

export function set(
	value: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<SetIssue>,
): SetSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<SetIssue> | undefined> {
	return {
		kind: "schema",
		type: "set",
		reference: set,
		expects: "Set",
		async: false,
		value,
		message,
		_run(dataset, config) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (isSet(input)) {
				// Set typed to `true` and value to empty set
				dataset.typed = true;
				dataset.value = new Set();

				// Parse schema of each set value
				for (const inputValue of input) {
					const valueDataset = (
						this as SetSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<SetIssue> | undefined>
					).value._run({ typed: false, value: inputValue }, config);

					// If there are issues, capture them
					if (valueDataset.issues !== undefined) {
						if (dataset.issues === undefined) {
							(dataset as { issues: defined[] }).issues = valueDataset.issues;
						} else {
							// Add modified item dataset issues to issues
							for (const issue of valueDataset.issues) {
								(dataset.issues as defined[]).push(issue);
							}
						}

						// If necessary, abort early
						if (config.abortEarly === true) {
							dataset.typed = false;
							break;
						}
					}

					// If not typed, set typed to `false`
					if (valueDataset.typed === false) {
						dataset.typed = false;
					}

					// Add value to dataset
					(dataset.value as Set<defined>).add(valueDataset.value as defined);
				}

				// Otherwise, add set issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<Set<unknown>, SetIssue | BaseIssue<unknown>>;
		},
	};
}
