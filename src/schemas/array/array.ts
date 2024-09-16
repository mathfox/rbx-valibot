import isArray from "@rbxts/phantom/src/Array/isArray";
import type {
	ArrayPathItem,
	BaseIssue,
	BaseSchema,
	Dataset,
	ErrorMessage,
	InferInput,
	InferIssue,
	InferOutput,
} from "../../types";
import { _addIssue } from "../../utils";
import type { ArrayIssue } from "./types";

/**
 * Array schema type.
 */
export interface ArraySchema<
	TItem extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<ArrayIssue> | undefined,
> extends BaseSchema<InferInput<TItem>[], InferOutput<TItem>[], ArrayIssue | InferIssue<TItem>> {
	/**
	 * The schema type.
	 */
	readonly type: "array";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof array;
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
export function array<const TItem extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	item: TItem,
): ArraySchema<TItem, undefined>;

/**
 * Creates an array schema.
 *
 * @param item The item schema.
 * @param message The error message.
 *
 * @returns An array schema.
 */
export function array<
	const TItem extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<ArrayIssue> | undefined,
>(item: TItem, message: TMessage): ArraySchema<TItem, TMessage>;

export function array(
	item: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<ArrayIssue>,
): ArraySchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<ArrayIssue> | undefined> {
	return {
		kind: "schema",
		type: "array",
		reference: array,
		expects: "Array",
		async: false,
		item,
		message,
		_run(dataset, config) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (isArray(input)) {
				// Set typed to `true` and value to empty array
				dataset.typed = true;
				dataset.value = [];

				// Parse schema of each array item
				for (let key = 0; key < input.size(); key++) {
					const value = input[key];
					const itemDataset = this.item._run({ typed: false, value }, config);

					// If there are issues, capture them
					if (itemDataset.issues) {
						// Create array path item
						const pathItem: ArrayPathItem = {
							type: "array",
							origin: "value",
							input,
							key,
							value,
						};

						// Add modified item dataset issues to issues
						for (const issue of itemDataset.issues) {
							if (issue.path) {
								issue.path.unshift(pathItem);
							} else {
								(issue as { path: defined }).path = [pathItem];
							}
							dataset.issues?.push(issue as never);
						}
						if (!dataset.issues) {
							dataset.issues = itemDataset.issues as never;
						}

						// If necessary, abort early
						if (config.abortEarly) {
							dataset.typed = false;
							break;
						}
					}

					// If not typed, set typed to `false`
					if (!itemDataset.typed) {
						dataset.typed = false;
					}

					// Add item to dataset
					(dataset.value as defined[]).push(itemDataset.value as defined);
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
