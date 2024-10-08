import isSet from "@rbxts/phantom/src/Set/isSet";
import type { BaseIssue, BaseSchema, BaseSchemaAsync, ErrorMessage, InferIssue, OutputDataset } from "../../types";
import { _addIssue } from "../../utils";
import type { InferSetInput, InferSetOutput, SetIssue } from "./types";
import { getGlobalConfig } from "../../storages";

/**
 * Set schema async type.
 */
export interface SetSchemaAsync<
	TValue extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<SetIssue> | undefined,
> extends BaseSchemaAsync<InferSetInput<TValue>, InferSetOutput<TValue>, SetIssue | InferIssue<TValue>> {
	/**
	 * The schema type.
	 */
	readonly type: "set";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof setAsync;
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
export function setAsync<
	const TValue extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(value: TValue): SetSchemaAsync<TValue, undefined>;

/**
 * Creates a set schema.
 *
 * @param value The value schema.
 * @param message The error message.
 *
 * @returns A set schema.
 */
export function setAsync<
	const TValue extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<SetIssue> | undefined,
>(value: TValue, message: TMessage): SetSchemaAsync<TValue, TMessage>;

export function setAsync(
	value: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<SetIssue>,
): SetSchemaAsync<
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	ErrorMessage<SetIssue> | undefined
> {
	return {
		kind: "schema",
		type: "set",
		reference: setAsync,
		expects: "Set",
		async: true,
		value,
		message,
		async _run(dataset, config = getGlobalConfig()) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (isSet(input)) {
				// Set typed to `true` and value to empty set
				dataset.typed = true;
				dataset.value = new Set();

				const valueDatasetsPromises = new Array<Promise<unknown>>();

				for (const inputValue of input) {
					valueDatasetsPromises.push(
						(async () => {
							return [
								inputValue,
								await (
									this as SetSchemaAsync<
										BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
										ErrorMessage<SetIssue> | undefined
									>
								).value._run({ typed: false, value: inputValue }, config),
							];
						})(),
					);
				}

				// Parse schema of each set value
				const valueDatasets = await Promise.all(valueDatasetsPromises);

				// Process dataset of each set value
				for (const [inputValue, valueDataset] of valueDatasets as [
					inputValue: unknown,
					valueDataset: OutputDataset<unknown, BaseIssue<unknown>>,
				][]) {
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

					// If not typed, set typed to `false`
					if (valueDataset.typed === false) {
						dataset.typed = false;
					}

					// Add value to dataset
					(dataset.value as Set<unknown>).add(valueDataset.value);
				}

				// Otherwise, add set issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as OutputDataset<Set<unknown>, SetIssue | BaseIssue<unknown>>;
		},
	};
}
