import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	Dataset,
	ErrorMessage,
	InferObjectInput,
	InferObjectIssue,
	InferObjectOutput,
	ObjectEntriesAsync,
} from "../../types";
import { _addIssue } from "../../utils";
import type { StrictObjectIssue } from "./types";

/**
 * Strict object schema async type.
 */
export interface StrictObjectSchemaAsync<
	TEntries extends ObjectEntriesAsync,
	TMessage extends ErrorMessage<StrictObjectIssue> | undefined,
> extends BaseSchemaAsync<
		InferObjectInput<TEntries>,
		InferObjectOutput<TEntries>,
		StrictObjectIssue | InferObjectIssue<TEntries>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "strict_object";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof strictObjectAsync;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The entries schema.
	 */
	readonly entries: TEntries;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a strict object schema.
 *
 * @param entries The entries schema.
 *
 * @returns A strict object schema.
 */
export function strictObjectAsync<const TEntries extends ObjectEntriesAsync>(
	entries: TEntries,
): StrictObjectSchemaAsync<TEntries, undefined>;

/**
 * Creates a strict object schema.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns A strict object schema.
 */
export function strictObjectAsync<
	const TEntries extends ObjectEntriesAsync,
	const TMessage extends ErrorMessage<StrictObjectIssue> | undefined,
>(entries: TEntries, message: TMessage): StrictObjectSchemaAsync<TEntries, TMessage>;

export function strictObjectAsync(
	entries: ObjectEntriesAsync,
	message?: ErrorMessage<StrictObjectIssue>,
): StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined> {
	return {
		kind: "schema",
		type: "strict_object",
		reference: strictObjectAsync,
		expects: "Object",
		async: true,
		entries,
		message,
		async _run(dataset, config) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (typeIs(input, "table")) {
				// Set typed to `true` and value to blank object
				dataset.typed = true;
				dataset.value = {};

				const promises = new Array<Promise<unknown>>();

				for (const [key, schema] of (
					this as StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>
				).entries as unknown as Map<string, BaseSchema<unknown, unknown, BaseIssue<unknown>>>) {
					promises.push(
						(async () => {
							const value = input[key as keyof typeof input];
							return [key, value, await schema._run({ typed: false, value }, config)] as const;
						})(),
					);
				}

				// Parse schema of each entry
				// Hint: We do not distinguish between missing and `undefined` entries.
				// The reason for this decision is that it reduces the bundle size, and
				// we also expect that most users will expect this behavior.
				const valueDatasets = await Promise.all(promises);

				// Process each value dataset
				for (const [key, value, valueDataset] of valueDatasets as [
					key: string,
					value: unknown,
					valueDataset: Dataset<unknown, BaseIssue<unknown>>,
				][]) {
					// If there are issues, capture them
					if (valueDataset.issues) {
						// Add modified entry dataset issues to issues
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
					if (!valueDataset.typed) {
						dataset.typed = false;
					}

					// Add entry to dataset if necessary
					if (valueDataset.value !== undefined || key in input) {
						(dataset.value as Record<string, unknown>)[key] = valueDataset.value;
					}
				}

				// Check input for unknown keys if necessary
				if (!dataset.issues || !config.abortEarly) {
					for (const key in input) {
						if (
							!(
								key in
								(this as StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>)
									.entries
							)
						) {
							const value: unknown = input[key as keyof typeof input];
							_addIssue(this, "type", dataset, config, {
								input: value,
								expected: "never",
							});

							// Hint: We intentionally break the loop after the first unknown
							// entries. Otherwise, attackers could send large objects to
							// exhaust device resources. If you want an issue for every
							// unknown key, use the `objectWithRest` schema with `never` for
							// the `rest` argument.
							break;
						}
					}
				}

				// Otherwise, add object issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<
				InferObjectOutput<ObjectEntriesAsync>,
				StrictObjectIssue | InferObjectIssue<ObjectEntriesAsync>
			>;
		},
	};
}
