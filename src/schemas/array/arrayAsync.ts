import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	Dataset,
	ErrorMessage,
	InferInput,
	InferIssue,
	InferOutput,
} from "../../types";
import { _addIssue } from "../../utils";
import isArray from "../../utils/isArray";
import type { ArrayIssue } from "./types";

/**
 * Array schema type.
 */
export interface ArraySchemaAsync<
	TItem extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<ArrayIssue> | undefined,
> extends BaseSchemaAsync<InferInput<TItem>[], InferOutput<TItem>[], ArrayIssue | InferIssue<TItem>> {
	/**
	 * The schema type.
	 */
	readonly type: "array";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof arrayAsync;
	/**
	 * The expected property.
	 */
	readonly expects: "Array";
	/**
	 * The array item schema.
	 */
	readonly item: TItem;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates an array schema.
 *
 * @param item The item schema.
 *
 * @returns An array schema.
 */
export function arrayAsync<
	const TItem extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(item: TItem): ArraySchemaAsync<TItem, undefined>;

/**
 * Creates an array schema.
 *
 * @param item The item schema.
 * @param message The error message.
 *
 * @returns An array schema.
 */
export function arrayAsync<
	const TItem extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<ArrayIssue> | undefined,
>(item: TItem, message: TMessage): ArraySchemaAsync<TItem, TMessage>;

export function arrayAsync(
	item: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<ArrayIssue>,
): ArraySchemaAsync<
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	ErrorMessage<ArrayIssue> | undefined
> {
	return {
		kind: "schema",
		type: "array",
		reference: arrayAsync,
		expects: "Array",
		async: true,
		item,
		message,
		async _run(dataset, config) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (isArray(input)) {
				// Set typed to `true` and value to empty array
				dataset.typed = true;
				dataset.value = [];

				const itemDatasetsPromises = new Array<Promise<unknown>>();

				for (const value of input as defined[]) {
					itemDatasetsPromises.push(
						(async () => {
							return (
								this as ArraySchemaAsync<
									BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
									ErrorMessage<ArrayIssue> | undefined
								>
							).item._run({ typed: false, value }, config);
						})(),
					);
				}

				// Parse schema of each item async
				const itemDatasets = await Promise.all(itemDatasetsPromises);

				// Process each item dataset
				for (let key = 0; key < itemDatasets.size(); key++) {
					// Get item dataset
					const itemDataset = itemDatasets[key];

					// If there are issues, capture them
					if ((itemDataset as Dataset<unknown, BaseIssue<unknown>>).issues) {
						// Add modified item dataset issues to issues
						for (const issue of (itemDataset as Dataset<unknown, BaseIssue<unknown>>).issues!) {
							dataset.issues?.push(issue as never);
						}
						if (!dataset.issues) {
							dataset.issues = (itemDataset as Dataset<unknown, BaseIssue<unknown>>).issues as never;
						}

						// If necessary, abort early
						if (config.abortEarly) {
							dataset.typed = false;
							break;
						}
					}

					// If not typed, set typed to `false`
					if (!(itemDataset as Dataset<unknown, BaseIssue<unknown>>).typed) {
						dataset.typed = false;
					}

					// Add item to dataset
					(dataset.value as defined[]).push((itemDataset as Dataset<unknown, BaseIssue<unknown>>).value as defined);
				}

				// Otherwise, add array issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<unknown[], ArrayIssue | BaseIssue<unknown>>;
		},
	};
}
