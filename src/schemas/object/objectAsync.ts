import type {
	BaseIssue,
	BaseSchemaAsync,
	Dataset,
	ErrorMessage,
	InferObjectInput,
	InferObjectIssue,
	InferObjectOutput,
	ObjectEntriesAsync,
} from "../../types";
import { _addIssue } from "../../utils";
import type { ObjectIssue } from "./types";

/**
 * Object schema async type.
 */
export interface ObjectSchemaAsync<
	TEntries extends ObjectEntriesAsync,
	TMessage extends ErrorMessage<ObjectIssue> | undefined,
> extends BaseSchemaAsync<
		InferObjectInput<TEntries>,
		InferObjectOutput<TEntries>,
		ObjectIssue | InferObjectIssue<TEntries>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "object";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof objectAsync;
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
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. The output will only include the
 * entries you specify. To include unknown entries, use `looseObjectAsync`. To
 * return an issue for unknown entries, use `strictObjectAsync`. To include and
 * validate unknown entries, use `objectWithRestAsync`.
 *
 * @param entries The entries schema.
 *
 * @returns An object schema.
 */
export function objectAsync<const TEntries extends ObjectEntriesAsync>(
	entries: TEntries,
): ObjectSchemaAsync<TEntries, undefined>;

/**
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. The output will only include the
 * entries you specify. To include unknown entries, use `looseObjectAsync`. To
 * return an issue for unknown entries, use `strictObjectAsync`. To include and
 * validate unknown entries, use `objectWithRestAsync`.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns An object schema.
 */
export function objectAsync<
	const TEntries extends ObjectEntriesAsync,
	const TMessage extends ErrorMessage<ObjectIssue> | undefined,
>(entries: TEntries, message: TMessage): ObjectSchemaAsync<TEntries, TMessage>;

export function objectAsync(
	entries: ObjectEntriesAsync,
	message?: ErrorMessage<ObjectIssue>,
): ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined> {
	return {
		kind: "schema",
		type: "object",
		reference: objectAsync,
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

				// roblox-ts requires manual cast
				for (const [key, schema] of (
					this as ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined>
				).entries as unknown as ReadonlyMap<unknown, unknown>) {
					promises.push(
						(async () => {
							const value = input[key as keyof typeof input];

							return [
								key,
								value,
								await (schema as BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>)._run(
									{ typed: false, value },
									config,
								),
							] as const;
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
							(dataset.issues as [defined, defined[]] | undefined)?.push(issue);
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

				// Otherwise, add object issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<
				InferObjectOutput<ObjectEntriesAsync>,
				ObjectIssue | InferObjectIssue<ObjectEntriesAsync>
			>;
		},
	};
}
