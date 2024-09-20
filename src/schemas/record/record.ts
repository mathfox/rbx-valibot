import type { BaseIssue, BaseSchema, Dataset, ErrorMessage, InferIssue } from "../../types";
import { _addIssue } from "../../utils";
import type { InferRecordInput, InferRecordOutput, RecordIssue } from "./types";

/**
 * Record schema type.
 */
export interface RecordSchema<
	TKey extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>>,
	TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<RecordIssue> | undefined,
> extends BaseSchema<
		InferRecordInput<TKey, TValue>,
		InferRecordOutput<TKey, TValue>,
		RecordIssue | InferIssue<TKey> | InferIssue<TValue>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "record";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof record;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The record key schema.
	 */
	readonly key: TKey;
	/**
	 * The record value schema.
	 */
	readonly value: TValue;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a record schema.
 *
 * @param key The key schema.
 * @param value The value schema.
 *
 * @returns A record schema.
 */
export function record<
	const TKey extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>>,
	const TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(key: TKey, value: TValue): RecordSchema<TKey, TValue, undefined>;

/**
 * Creates a record schema.
 *
 * @param key The key schema.
 * @param value The value schema.
 * @param message The error message.
 *
 * @returns A record schema.
 */
export function record<
	const TKey extends BaseSchema<string, string | number | symbol, BaseIssue<unknown>>,
	const TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<RecordIssue> | undefined,
>(key: TKey, value: TValue, message: TMessage): RecordSchema<TKey, TValue, TMessage>;

export function record(
	key: BaseSchema<string, string | number | symbol, BaseIssue<unknown>>,
	value: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<RecordIssue>,
): RecordSchema<
	BaseSchema<string, string | number | symbol, BaseIssue<unknown>>,
	BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	ErrorMessage<RecordIssue> | undefined
> {
	return {
		kind: "schema",
		type: "record",
		reference: record,
		expects: "Object",
		async: false,
		key,
		value,
		message,
		_run(dataset, config) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (typeIs(input, "table")) {
				// Set typed to `true` and value to empty object
				dataset.typed = true;
				dataset.value = {};

				// Parse schema of each record entry
				// Hint: for...in loop always returns keys as strings
				// Hint: We exclude specific keys for security reasons
				for (const entryKey in input) {
					//if (_isValidObjectKey(input, entryKey)) {
					// Get value of record entry
					const entryValue: unknown = input[entryKey as keyof typeof input];

					// Get dataset of key schema
					const keyDataset = (
						this as RecordSchema<
							BaseSchema<string, string | number | symbol, BaseIssue<unknown>>,
							BaseSchema<unknown, unknown, BaseIssue<unknown>>,
							ErrorMessage<RecordIssue> | undefined
						>
					).key._run({ typed: false, value: entryKey }, config);

					// If there are issues, capture them
					if (keyDataset.issues) {
						// Add modified item dataset issues to issues
						for (const issue of keyDataset.issues) {
							(dataset.issues as defined[] | undefined)?.push(issue);
						}
						if (!dataset.issues) {
							(dataset as { issues: defined[] }).issues = keyDataset.issues;
						}

						// If necessary, abort early
						if (config.abortEarly) {
							dataset.typed = false;
							break;
						}
					}

					// Get dataset of value schema
					const valueDataset = (
						this as RecordSchema<
							BaseSchema<string, string | number | symbol, BaseIssue<unknown>>,
							BaseSchema<unknown, unknown, BaseIssue<unknown>>,
							ErrorMessage<RecordIssue> | undefined
						>
					).value._run({ typed: false, value: entryValue }, config);

					// If there are issues, capture them
					if (valueDataset.issues) {
						// Add modified item dataset issues to issues
						for (const issue of valueDataset.issues) {
							(dataset.issues as defined[] | undefined)?.push(issue);
						}
						if (!dataset.issues) {
							(dataset as { issues: defined[] }).issues = valueDataset.issues;
						}

						// If necessary, abort early
						if (config.abortEarly) {
							dataset.typed = false;
							break;
						}
					}

					// If not typed, set typed to `false`
					if (!keyDataset.typed || !valueDataset.typed) {
						dataset.typed = false;
					}

					// If key is typed, add entry to dataset
					if (keyDataset.typed) {
						(dataset.value as Record<string | number | symbol, unknown>)[keyDataset.value] = valueDataset.value;
					}
					//}
				}

				// Otherwise, add record issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<Record<string | number | symbol, unknown>, RecordIssue | BaseIssue<unknown>>;
		},
	};
}
