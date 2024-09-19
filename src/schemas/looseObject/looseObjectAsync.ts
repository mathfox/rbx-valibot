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
import type { LooseObjectIssue } from "./types";

/**
 * Object schema async type.
 */
export interface LooseObjectSchemaAsync<
	TEntries extends ObjectEntriesAsync,
	TMessage extends ErrorMessage<LooseObjectIssue> | undefined,
> extends BaseSchemaAsync<
		InferObjectInput<TEntries> & { [key: string]: unknown },
		InferObjectOutput<TEntries> & { [key: string]: unknown },
		LooseObjectIssue | InferObjectIssue<TEntries>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "loose_object";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof looseObjectAsync;
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
 * Creates a loose object schema.
 *
 * @param entries The entries schema.
 *
 * @returns A loose object schema.
 */
export function looseObjectAsync<const TEntries extends ObjectEntriesAsync>(
	entries: TEntries,
): LooseObjectSchemaAsync<TEntries, undefined>;

/**
 * Creates a loose object schema.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns A loose object schema.
 */
export function looseObjectAsync<
	const TEntries extends ObjectEntriesAsync,
	const TMessage extends ErrorMessage<LooseObjectIssue> | undefined,
>(entries: TEntries, message: TMessage): LooseObjectSchemaAsync<TEntries, TMessage>;

export function looseObjectAsync(
	entries: ObjectEntriesAsync,
	message?: ErrorMessage<LooseObjectIssue>,
): LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined> {
	return {
		kind: "schema",
		type: "loose_object",
		reference: looseObjectAsync,
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

				// Parse schema of each entry
				// Hint: We do not distinguish between missing and `undefined` entries.
				// The reason for this decision is that it reduces the bundle size, and
				// we also expect that most users will expect this behavior.
				for (const [key, schema] of (
					this as LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined>
				).entries as unknown as Map<string, BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>) {
					promises.push(
						(async () => {
							const value = input[key as keyof typeof input];
							return [key, value, await schema._run({ typed: false, value }, config)] as const;
						})(),
					);
				}

				const valueDatasets = await Promise.all(promises);

				// Process each value dataset
				for (const [key, value, valueDataset] of valueDatasets as [
					key: string,
					value: unknown,
					valueDataSet: Dataset<unknown, BaseIssue<unknown>>,
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

				// Add rest to dataset if necessary
				// Hint: We exclude specific keys for security reasons
				if (!dataset.issues || !config.abortEarly) {
					for (const key in input) {
						if (
							!(
								key in
								(this as LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined>).entries
							)
						) {
							(dataset.value as Record<string, unknown>)[key] = (input as Record<string, unknown>)[key];
						}
					}
				}

				// Otherwise, add object issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<
				InferObjectOutput<ObjectEntriesAsync> & { [key: string]: unknown },
				LooseObjectIssue | InferObjectIssue<ObjectEntriesAsync>
			>;
		},
	};
}
