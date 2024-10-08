import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseSchema, ErrorMessage, InferIssue, OutputDataset } from "../../types";
import { _addIssue } from "../../utils";
import type { InferMapInput, InferMapOutput, MapIssue } from "./types";

/**
 * Map schema type.
 */
export interface MapSchema<
	TKey extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<MapIssue> | undefined,
> extends BaseSchema<
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
	readonly reference: typeof map;
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
export function map<
	const TKey extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	const TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(key: TKey, value: TValue): MapSchema<TKey, TValue, undefined>;

/**
 * Creates a map schema.
 *
 * @param key The key schema.
 * @param value The value schema.
 * @param message The error message.
 *
 * @returns A map schema.
 */
export function map<
	const TKey extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	const TValue extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<MapIssue> | undefined,
>(key: TKey, value: TValue, message: TMessage): MapSchema<TKey, TValue, TMessage>;

export function map(
	key: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	value: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<MapIssue>,
): MapSchema<
	BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	ErrorMessage<MapIssue> | undefined
> {
	return {
		kind: "schema",
		type: "map",
		reference: map,
		expects: "Map",
		async: false,
		key,
		value,
		message,
		_run(dataset, config = getGlobalConfig()) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (typeIs(input, "table")) {
				// Set typed to `true` and value to empty map
				dataset.typed = true;
				dataset.value = new Map();

				// Parse schema of each map entry
				for (const [inputKey, inputValue] of input as Map<unknown, unknown>) {
					// Get dataset of key schema
					const keyDataset = (
						this as MapSchema<
							BaseSchema<unknown, unknown, BaseIssue<unknown>>,
							BaseSchema<unknown, unknown, BaseIssue<unknown>>,
							ErrorMessage<MapIssue> | undefined
						>
					).key._run({ typed: false, value: inputKey }, config);

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

					// Get dataset of value schema
					const valueDataset = (
						this as MapSchema<
							BaseSchema<unknown, unknown, BaseIssue<unknown>>,
							BaseSchema<unknown, unknown, BaseIssue<unknown>>,
							ErrorMessage<MapIssue> | undefined
						>
					).value._run({ typed: false, value: inputValue }, config);

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
