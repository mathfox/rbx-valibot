import type { BaseIssue, BaseSchema, Dataset, ErrorMessage, InferIssue, SetPathItem } from "../../types";
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
			if (input instanceof Set) {
				// Set typed to `true` and value to empty set
				dataset.typed = true;
				dataset.value = new Set();

				// Parse schema of each set value
				for (const inputValue of input) {
					const valueDataset = this.value._run({ typed: false, value: inputValue }, config);

					// If there are issues, capture them
					if (valueDataset.issues) {
						// Create set path item
						const pathItem: SetPathItem = {
							type: "set",
							origin: "value",
							input,
							key: undefined,
							value: inputValue,
						};

						// Add modified item dataset issues to issues
						for (const issue of valueDataset.issues) {
							if (issue.path) {
								issue.path.unshift(pathItem);
							} else {
								(issue as { path: unknown }).path = [pathItem];
							}
							dataset.issues?.push(issue as never);
						}
						if (!dataset.issues) {
							// @ts-expect-error
							dataset.issues = valueDataset.issues;
						}

						// If necessary, abort early
						if (config.abortEarly) {
							dataset.typed = false;
							break;
						}
					}

					// If not typed, set typed to `false`
					if (!valueDataset.typed) {
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
