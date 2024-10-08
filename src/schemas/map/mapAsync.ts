import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseSchema, BaseSchemaAsync, ErrorMessage, InferIssue, OutputDataset } from "../../types";
import { _addIssue } from "../../utils";
import type { InferMapInput, InferMapOutput, MapIssue } from "./types";

/**
 * Map schema async type.
 */
export interface MapSchemaAsync<
	TKey extends BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TValue extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<MapIssue> | undefined,
> extends BaseSchemaAsync<
		InferMapInput<TKey, TValue>,
		InferMapOutput<TKey, TValue>,
		MapIssue | InferIssue<TKey> | InferIssue<TValue>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "map";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof mapAsync;
	/**
	 * The expected property.
	 */
	readonly expects: "Map";
	/**
	 * The map key schema.
	 */
	readonly key: TKey;
	/**
	 * The map value schema.
	 */
	readonly value: TValue;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a map schema.
 *
 * @param key The key schema.
 * @param value The value schema.
 *
 * @returns A map schema.
 */
export function mapAsync<
	const TKey extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TValue extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(key: TKey, value: TValue): MapSchemaAsync<TKey, TValue, undefined>;

/**
 * Creates a map schema.
 *
 * @param key The key schema.
 * @param value The value schema.
 * @param message The error message.
 *
 * @returns A map schema.
 */
export function mapAsync<
	const TKey extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TValue extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<MapIssue> | undefined,
>(key: TKey, value: TValue, message: TMessage): MapSchemaAsync<TKey, TValue, TMessage>;

export function mapAsync(
	key: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	value: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<MapIssue>,
): MapSchemaAsync<
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	ErrorMessage<MapIssue> | undefined
> {
	return {
		kind: "schema",
		type: "map",
		reference: mapAsync,
		expects: "Map",
		async: true,
		key,
		value,
		message,
		async _run(dataset, config = getGlobalConfig()) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (typeIs(input, "table")) {
				// Set typed to `true` and value to empty map
				dataset.typed = true;
				dataset.value = new Map();

				const datasetsPromises = new Array<Promise<unknown>>();

				for (const [inputKey, inputValue] of input as Map<unknown, unknown>) {
					datasetsPromises.push(
						(async () => {
							return [
								inputKey,
								inputValue,
								await (
									this as MapSchemaAsync<
										BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
										BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
										ErrorMessage<MapIssue> | undefined
									>
								).key._run({ typed: false, value: inputKey }, config),
								await (
									this as MapSchemaAsync<
										BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
										BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
										ErrorMessage<MapIssue> | undefined
									>
								).value._run({ typed: false, value: inputValue }, config),
							];
						})(),
					);
				}

				// Parse schema of each map entry
				const datasets = await Promise.all(datasetsPromises);

				// Process datasets of each map entry
				for (const [inputKey, inputValue, keyDataset, valueDataset] of datasets as [
					inputKey: unknown,
					inputValue: unknown,
					keyDataset: OutputDataset<unknown, BaseIssue<unknown>>,
					valueDataset: OutputDataset<unknown, BaseIssue<unknown>>,
				][]) {
					// If there are issues, capture them
					if (keyDataset.issues !== undefined) {
						if (dataset.issues === undefined) {
							(dataset as unknown as { issues: defined[] }).issues = keyDataset.issues;
						} else {
							// Add modified item dataset issues to issues
							for (const issue of keyDataset.issues) {
								(dataset.issues as defined[]).push(issue);
							}
						}

						// If necessary, abort early
						if (config.abortEarly === true) {
							dataset.typed = false;
							break;
						}
					}

					// If there are issues, capture them
					if (valueDataset.issues !== undefined) {
						if (dataset.issues === undefined) {
							(dataset as unknown as { issues: defined[] }).issues = valueDataset.issues;
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

					// If not typed, map typed to `false`
					if (keyDataset.typed === false || valueDataset.typed === false) {
						dataset.typed = false;
					}

					// Add value to dataset
					(dataset.value as Map<unknown, unknown>).set(keyDataset.value, valueDataset.value);
				}

				// Otherwise, add map issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as OutputDataset<Map<unknown, unknown>, MapIssue | BaseIssue<unknown>>;
		},
	};
}
