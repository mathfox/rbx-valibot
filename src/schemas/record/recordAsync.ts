import type { BaseIssue, BaseSchema, BaseSchemaAsync, Dataset, ErrorMessage, InferIssue } from "../../types";
import { _addIssue } from "../../utils";
import type { InferRecordInput, InferRecordOutput, RecordIssue } from "./types";

/**
 * Record schema async type.
 */
export interface RecordSchemaAsync<
	TKey extends
		| BaseSchema<string, string | number | symbol, BaseIssue<unknown>>
		| BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>,
	TValue extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<RecordIssue> | undefined,
> extends BaseSchemaAsync<
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
	readonly reference: typeof recordAsync;
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
export function recordAsync<
	const TKey extends
		| BaseSchema<string, string | number | symbol, BaseIssue<unknown>>
		| BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>,
	const TValue extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(key: TKey, value: TValue): RecordSchemaAsync<TKey, TValue, undefined>;

/**
 * Creates a record schema.
 *
 * @param key The key schema.
 * @param value The value schema.
 * @param message The error message.
 *
 * @returns A record schema.
 */
export function recordAsync<
	const TKey extends
		| BaseSchema<string, string | number | symbol, BaseIssue<unknown>>
		| BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>,
	const TValue extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<RecordIssue> | undefined,
>(key: TKey, value: TValue, message: TMessage): RecordSchemaAsync<TKey, TValue, TMessage>;

export function recordAsync(
	key:
		| BaseSchema<string, string | number | symbol, BaseIssue<unknown>>
		| BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>,
	value: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<RecordIssue>,
): RecordSchemaAsync<
	| BaseSchema<string, string | number | symbol, BaseIssue<unknown>>
	| BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>,
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	ErrorMessage<RecordIssue> | undefined
> {
	return {
		kind: "schema",
		type: "record",
		reference: recordAsync,
		expects: "Object",
		async: true,
		key,
		value,
		message,
		async _run(dataset, config) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (typeIs(input, "table")) {
				// Set typed to `true` and value to empty object
				dataset.typed = true;
				dataset.value = {};

				const datasetsPromises = new Array<Promise<unknown>>();

				// Parse schema of each record entry
				for (const [entryKey, entryValue] of input as Map<unknown, unknown>) {
					datasetsPromises.push(
						(async () => {
							return [
								entryKey,
								entryValue,
								(
									this as RecordSchemaAsync<
										BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>,
										BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
										ErrorMessage<RecordIssue> | undefined
									>
								).key._run({ typed: false, value: entryKey }, config),
								(
									this as RecordSchemaAsync<
										BaseSchemaAsync<string, string | number | symbol, BaseIssue<unknown>>,
										BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
										ErrorMessage<RecordIssue> | undefined
									>
								).value._run({ typed: false, value: entryValue }, config),
							];
						})(),
					);
				}

				// Hint: `Object.entries(…)` always returns keys as strings
				// Hint: We exclude specific keys for security reasons
				const datasets = await Promise.all(datasetsPromises);

				// Process datasets of each record entry
				for (const [entryKey, entryValue, keyDataset, valueDataset] of datasets as [
					entryKey: unknown,
					entryValue: unknown,
					keyDataset: Dataset<unknown, BaseIssue<unknown>>,
					valueDataset: Dataset<unknown, BaseIssue<unknown>>,
				][]) {
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
						(dataset.value as Record<string, unknown>)[keyDataset.value as string] = valueDataset.value;
					}
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
