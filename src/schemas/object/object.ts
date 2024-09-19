import type {
	BaseSchema,
	Dataset,
	ErrorMessage,
	InferObjectInput,
	InferObjectIssue,
	InferObjectOutput,
	ObjectEntries,
} from "../../types";
import { _addIssue } from "../../utils";
import type { ObjectIssue } from "./types";

/**
 * Object schema type.
 */
export interface ObjectSchema<TEntries extends ObjectEntries, TMessage extends ErrorMessage<ObjectIssue> | undefined>
	extends BaseSchema<
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
	readonly reference: typeof object;
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
 * entries you specify. To include unknown entries, use `looseObject`. To
 * return an issue for unknown entries, use `strictObject`. To include and
 * validate unknown entries, use `objectWithRest`.
 *
 * @param entries The entries schema.
 *
 * @returns An object schema.
 */
export function object<const TEntries extends ObjectEntries>(entries: TEntries): ObjectSchema<TEntries, undefined>;

/**
 * Creates an object schema.
 *
 * Hint: This schema removes unknown entries. The output will only include the
 * entries you specify. To include unknown entries, use `looseObject`. To
 * return an issue for unknown entries, use `strictObject`. To include and
 * validate unknown entries, use `objectWithRest`.
 *
 * @param entries The entries schema.
 * @param message The error message.
 *
 * @returns An object schema.
 */
export function object<
	const TEntries extends ObjectEntries,
	const TMessage extends ErrorMessage<ObjectIssue> | undefined,
>(entries: TEntries, message: TMessage): ObjectSchema<TEntries, TMessage>;

export function object(
	entries: ObjectEntries,
	message?: ErrorMessage<ObjectIssue>,
): ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined> {
	return {
		kind: "schema",
		type: "object",
		reference: object,
		expects: "Object",
		async: false,
		entries,
		message,
		_run(dataset, config) {
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
				// ! roblox-ts requires manual cast.
				for (const [key] of (this as ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>)
					.entries as unknown as Map<string, unknown>) {
					// Get and parse value of key
					const value: unknown = input[key as keyof typeof input];
					// roblox-ts requires manual cast.
					const valueDataset = (this as ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>).entries[
						key
					]._run({ typed: false, value }, config);

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
			return dataset as Dataset<InferObjectOutput<ObjectEntries>, ObjectIssue | InferObjectIssue<ObjectEntries>>;
		},
	};
}
