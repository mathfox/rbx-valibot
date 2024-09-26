import type {
	BaseIssue,
	BaseSchema,
	Dataset,
	ErrorMessage,
	InferInput,
	InferIssue,
	InferObjectInput,
	InferObjectIssue,
	InferObjectOutput,
	InferOutput,
	ObjectEntries,
} from "../../types";
import { _addIssue } from "../../utils";
import type { ObjectWithRestIssue } from "./types";

/**
 * Object with rest schema type.
 */
export interface ObjectWithRestSchema<
	TEntries extends ObjectEntries,
	TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined,
> extends BaseSchema<
		InferObjectInput<TEntries> & { [key: string]: InferInput<TRest> },
		InferObjectOutput<TEntries> & { [key: string]: InferOutput<TRest> },
		ObjectWithRestIssue | InferObjectIssue<TEntries> | InferIssue<TRest>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "object_with_rest";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof objectWithRest;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The entries schema.
	 */
	readonly entries: TEntries;
	/**
	 * The rest schema.
	 */
	readonly rest: TRest;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates an object with rest schema.
 *
 * @param entries The entries schema.
 * @param rest The rest schema.
 *
 * @returns An object with rest schema.
 */
export function objectWithRest<
	const TEntries extends ObjectEntries,
	const TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(entries: TEntries, rest: TRest): ObjectWithRestSchema<TEntries, TRest, undefined>;

/**
 * Creates an object with rest schema.
 *
 * @param entries The entries schema.
 * @param rest The rest schema.
 * @param message The error message.
 *
 * @returns An object with rest schema.
 */
export function objectWithRest<
	const TEntries extends ObjectEntries,
	const TRest extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined,
>(entries: TEntries, rest: TRest, message: TMessage): ObjectWithRestSchema<TEntries, TRest, TMessage>;

export function objectWithRest(
	entries: ObjectEntries,
	rest: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<ObjectWithRestIssue>,
): ObjectWithRestSchema<
	ObjectEntries,
	BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	ErrorMessage<ObjectWithRestIssue> | undefined
> {
	return {
		kind: "schema",
		type: "object_with_rest",
		reference: objectWithRest,
		expects: "Object",
		async: false,
		entries,
		rest,
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
				for (const [key] of (
					this as ObjectWithRestSchema<
						ObjectEntries,
						BaseSchema<unknown, unknown, BaseIssue<unknown>>,
						ErrorMessage<ObjectWithRestIssue> | undefined
					>
				).entries as unknown as Map<string, unknown>) {
					// Get and parse value of key
					const value = input[key as keyof typeof input];
					const valueDataset = (
						this as ObjectWithRestSchema<
							ObjectEntries,
							BaseSchema<unknown, unknown, BaseIssue<unknown>>,
							ErrorMessage<ObjectWithRestIssue> | undefined
						>
					).entries[key]._run({ typed: false, value }, config);

					// If there are issues, capture them
					if (valueDataset.issues !== undefined) {
						if (dataset.issues === undefined) {
							(dataset as { issues: defined[] }).issues = valueDataset.issues;
						} else {
							// Add modified entry dataset issues to issues
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

					// Add entry to dataset if necessary
					if (valueDataset.value !== undefined || key in input) {
						(dataset.value as Record<string, unknown>)[key] = valueDataset.value;
					}
				}

				// Parse schema of each rest entry if necessary
				// Hint: We exclude specific keys for security reasons
				if (dataset.issues === undefined || config.abortEarly === false) {
					for (const [key] of input as unknown as Map<string, unknown>) {
						if (
							!(
								key in
								(
									this as ObjectWithRestSchema<
										ObjectEntries,
										BaseSchema<unknown, unknown, BaseIssue<unknown>>,
										ErrorMessage<ObjectWithRestIssue> | undefined
									>
								).entries
							)
						) {
							const value: unknown = input[key as keyof typeof input];
							const valueDataset = (
								this as ObjectWithRestSchema<
									ObjectEntries,
									BaseSchema<unknown, unknown, BaseIssue<unknown>>,
									ErrorMessage<ObjectWithRestIssue> | undefined
								>
							).rest._run({ typed: false, value }, config);

							// If there are issues, capture them
							if (valueDataset.issues !== undefined) {
								if (dataset.issues === undefined) {
									(dataset as { issues: defined[] }).issues = valueDataset.issues;
								} else {
									// Add modified entry dataset issues to issues
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

							// Add entry to dataset
							(dataset.value as Record<string, unknown>)[key] = valueDataset.value;
						}
					}
				}

				// Otherwise, add object issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<
				InferObjectOutput<ObjectEntries> & { [key: string]: unknown },
				ObjectWithRestIssue | InferObjectIssue<ObjectEntries> | BaseIssue<unknown>
			>;
		},
	};
}
