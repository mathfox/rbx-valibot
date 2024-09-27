import isArray from "@rbxts/phantom/src/Array/isArray";
import type {
	BaseIssue,
	BaseSchema,
	Dataset,
	ErrorMessage,
	InferTupleInput,
	InferTupleIssue,
	InferTupleOutput,
	TupleItems,
} from "../../types";
import { _addIssue } from "../../utils";
import type { TupleIssue } from "./types";

/**
 * Tuple schema type.
 */
export interface TupleSchema<TItems extends TupleItems, TMessage extends ErrorMessage<TupleIssue> | undefined>
	extends BaseSchema<InferTupleInput<TItems>, InferTupleOutput<TItems>, TupleIssue | InferTupleIssue<TItems>> {
	/**
	 * The schema type.
	 */
	readonly type: "tuple";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof tuple;
	/**
	 * The expected property.
	 */
	readonly expects: "Array";
	/**
	 * The items schema.
	 */
	readonly items: TItems;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a tuple schema.
 *
 * Hint: This schema removes unknown items. The output will only include the
 * items you specify. To include unknown items, use `looseTuple`. To
 * return an issue for unknown items, use `strictTuple`. To include and
 * validate unknown items, use `tupleWithRest`.
 *
 * @param items The items schema.
 *
 * @returns A tuple schema.
 */
export function tuple<const TItems extends TupleItems>(items: TItems): TupleSchema<TItems, undefined>;

/**
 * Creates a tuple schema.
 *
 * Hint: This schema removes unknown items. The output will only include the
 * items you specify. To include unknown items, use `looseTuple`. To
 * return an issue for unknown items, use `strictTuple`. To include and
 * validate unknown items, use `tupleWithRest`.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A tuple schema.
 */
export function tuple<const TItems extends TupleItems, const TMessage extends ErrorMessage<TupleIssue> | undefined>(
	items: TItems,
	message: TMessage,
): TupleSchema<TItems, TMessage>;

export function tuple(
	items: TupleItems,
	message?: ErrorMessage<TupleIssue>,
): TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined> {
	return {
		kind: "schema",
		type: "tuple",
		reference: tuple,
		expects: "Array",
		async: false,
		items,
		message,
		_run(dataset, config) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (isArray(input)) {
				// Set typed to `true` and value to empty array
				dataset.typed = true;
				dataset.value = [];

				const items = (this as TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined>).items;

				// Parse schema of each tuple item
				for (let key = 0; key < items.size(); key++) {
					const value = input[key];
					const itemDataset = items[key]._run({ typed: false, value }, config);

					// If there are issues, capture them
					if (itemDataset.issues !== undefined) {
						if (dataset.issues === undefined) {
							(dataset as { issues: defined[] }).issues = itemDataset.issues;
						} else {
							// Add modified item dataset issues to issues
							for (const issue of itemDataset.issues) {
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
					if (itemDataset.typed === false) {
						dataset.typed = false;
					}

					// Add item to dataset
					(dataset.value as defined[]).push(itemDataset.value as defined);
				}

				// Otherwise, add tuple issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<unknown[], TupleIssue | BaseIssue<unknown>>;
		},
	};
}
