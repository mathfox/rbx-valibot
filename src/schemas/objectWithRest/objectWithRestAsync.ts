import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	Dataset,
	ErrorMessage,
	InferInput,
	InferIssue,
	InferObjectInput,
	InferObjectIssue,
	InferObjectOutput,
	InferOutput,
	ObjectEntriesAsync,
} from "../../types";
import { _addIssue } from "../../utils";
import type { ObjectWithRestIssue } from "./types";

/**
 * Object schema async type.
 */
export interface ObjectWithRestSchemaAsync<
	TEntries extends ObjectEntriesAsync,
	TRest extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined,
> extends BaseSchemaAsync<
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
	readonly reference: typeof objectWithRestAsync;
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
export function objectWithRestAsync<
	const TEntries extends ObjectEntriesAsync,
	const TRest extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(entries: TEntries, rest: TRest): ObjectWithRestSchemaAsync<TEntries, TRest, undefined>;

/**
 * Creates an object with rest schema.
 *
 * @param entries The entries schema.
 * @param rest The rest schema.
 * @param message The error message.
 *
 * @returns An object with rest schema.
 */
export function objectWithRestAsync<
	const TEntries extends ObjectEntriesAsync,
	const TRest extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<ObjectWithRestIssue> | undefined,
>(entries: TEntries, rest: TRest, message: TMessage): ObjectWithRestSchemaAsync<TEntries, TRest, TMessage>;

export function objectWithRestAsync(
	entries: ObjectEntriesAsync,
	rest: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<ObjectWithRestIssue>,
): ObjectWithRestSchemaAsync<
	ObjectEntriesAsync,
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	ErrorMessage<ObjectWithRestIssue> | undefined
> {
	return {
		kind: "schema",
		type: "object_with_rest",
		reference: objectWithRestAsync,
		expects: "Object",
		async: true,
		entries,
		rest,
		message,
		async _run(dataset, config) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (typeIs(input, "table")) {
				// Set typed to `true` and value to blank object
				dataset.typed = true;
				dataset.value = {};

				const normalDatasetsPromises = new Array<Promise<unknown>>();

				// Parse schema of each normal entry
				// Hint: We do not distinguish between missing and `undefined` entries.
				// The reason for this decision is that it reduces the bundle size, and
				// we also expect that most users will expect this behavior.
				for (const [key, schema] of (
					this as ObjectWithRestSchemaAsync<
						ObjectEntriesAsync,
						BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
						ErrorMessage<ObjectWithRestIssue> | undefined
					>
				).entries as unknown as Map<string, BaseSchema<unknown, unknown, BaseIssue<unknown>>>) {
					normalDatasetsPromises.push(
						(async () => {
							const value = input[key as keyof typeof input];

							return [key, value, await schema._run({ typed: false, value }, config)];
						})(),
					);
				}

				const restDatasetsPromises = new Array<Promise<unknown>>();

				// Parse other entries with rest schema
				// Hint: We exclude specific keys for security reasons
				for (const [key, value] of input as unknown as Map<string, BaseSchema<unknown, unknown, BaseIssue<unknown>>>) {
					if (
						!(
							key in
							(
								this as ObjectWithRestSchemaAsync<
									ObjectEntriesAsync,
									| BaseSchema<unknown, unknown, BaseIssue<unknown>>
									| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
									ErrorMessage<ObjectWithRestIssue> | undefined
								>
							).entries
						)
					) {
						restDatasetsPromises.push(
							(async () => {
								return [
									key,
									value,
									await (
										this as ObjectWithRestSchemaAsync<
											ObjectEntriesAsync,
											BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
											ErrorMessage<ObjectWithRestIssue> | undefined
										>
									).rest._run({ typed: false, value }, config),
								];
							})(),
						);
					}
				}

				// Parse each normal and rest entry
				const [normalDatasets, restDatasets] = await Promise.all([
					Promise.all(normalDatasetsPromises),
					Promise.all(restDatasetsPromises),
				]);

				// Process each normal dataset
				for (const [key, value, valueDataset] of normalDatasets as [
					key: string,
					value: unknown,
					valueDataset: Dataset<unknown, BaseIssue<unknown>>,
				][]) {
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
				if (dataset.issues === undefined || !config.abortEarly) {
					// Process each normal dataset
					for (const [key, value, valueDataset] of restDatasets as [
						key: string,
						value: unknown,
						valueDataset: Dataset<unknown, BaseIssue<unknown>>,
					][]) {
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

				// Otherwise, add object issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<
				InferObjectOutput<ObjectEntriesAsync> & { [key: string]: unknown },
				ObjectWithRestIssue | InferObjectIssue<ObjectEntriesAsync> | BaseIssue<unknown>
			>;
		},
	};
}
