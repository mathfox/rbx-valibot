import { getGlobalConfig } from "../../storages";
import type {
	BaseSchema,
	ErrorMessage,
	InferObjectInput,
	InferObjectIssue,
	InferObjectOutput,
	ObjectEntries,
	OutputDataset,
} from "../../types";
import { _addIssue } from "../../utils";
import type { LooseObjectIssue } from "./types";

/**
 * Loose object schema type.
 */
export interface LooseObjectSchema<
	TEntries extends ObjectEntries,
	TMessage extends ErrorMessage<LooseObjectIssue> | undefined,
> extends BaseSchema<
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
	readonly reference: typeof looseObject;
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
export function looseObject<const TEntries extends ObjectEntries>(
	entries: TEntries,
): LooseObjectSchema<TEntries, undefined>;

/**
 * Creates a loose object schema.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns A loose object schema.
 */
export function looseObject<
	const TEntries extends ObjectEntries,
	const TMessage extends ErrorMessage<LooseObjectIssue> | undefined,
>(entries: TEntries, message: TMessage): LooseObjectSchema<TEntries, TMessage>;

export function looseObject(
	entries: ObjectEntries,
	message?: ErrorMessage<LooseObjectIssue>,
): LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined> {
	return {
		kind: "schema",
		type: "loose_object",
		reference: looseObject,
		expects: "Object",
		async: false,
		entries,
		message,
		_run(dataset, config = getGlobalConfig()) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (typeIs(input, "table")) {
				// Set typed to `true` and value to blank object
				dataset.typed = true;
				dataset.value = {};

				// Parse schema of each entry
				// Hint: We do not distinguish between missing and `undefined` entries.
				// The reason for this decision is that it reduces the bundle size, and
				// we also expect that most users will expect this behavior.
				for (const [key] of (this as LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined>)
					.entries as unknown as Map<string, unknown>) {
					// Get and parse value of key
					const value = input[key as keyof typeof input];
					const valueDataset = (
						this as LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined>
					).entries[key]._run({ typed: false, value }, config);

					// If there are issues, capture them
					if (valueDataset.issues) {
						if (!dataset.issues) {
							(dataset as unknown as { issues: defined[] }).issues = valueDataset.issues;
						} else {
							// Add modified entry dataset issues to issues
							for (const issue of valueDataset.issues) {
								dataset.issues.push(issue);
							}
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
					for (const [key] of input as unknown as Map<string, unknown>) {
						if (
							!(key in (this as LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined>).entries)
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
			return dataset as OutputDataset<
				InferObjectOutput<ObjectEntries> & { [key: string]: unknown },
				LooseObjectIssue | InferObjectIssue<ObjectEntries>
			>;
		},
	};
}
