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
import type { LooseTupleIssue } from "./types";

/**
 * Loose tuple schema type.
 */
export interface LooseTupleSchema<TItems extends TupleItems, TMessage extends ErrorMessage<LooseTupleIssue> | undefined>
	extends BaseSchema<
		[...InferTupleInput<TItems>, ...unknown[]],
		[...InferTupleOutput<TItems>, ...unknown[]],
		LooseTupleIssue | InferTupleIssue<TItems>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "loose_tuple";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof looseTuple;
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
 * Creates a loose tuple schema.
 *
 * @param items The items schema.
 *
 * @returns A loose tuple schema.
 */
export function looseTuple<const TItems extends TupleItems>(items: TItems): LooseTupleSchema<TItems, undefined>;

/**
 * Creates a loose tuple schema.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A loose tuple schema.
 */
export function looseTuple<
	const TItems extends TupleItems,
	const TMessage extends ErrorMessage<LooseTupleIssue> | undefined,
>(items: TItems, message: TMessage): LooseTupleSchema<TItems, TMessage>;

export function looseTuple(
	items: TupleItems,
	message?: ErrorMessage<LooseTupleIssue>,
): LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined> {
	return {
		kind: "schema",
		type: "loose_tuple",
		reference: looseTuple,
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

				const items = (this as LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined>).items;

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

				// Add rest to dataset if necessary
				if (!dataset.issues || !config.abortEarly) {
					for (let key = items.size(); key < input.size(); key++) {
						(dataset.value as defined[]).push(input[key] as defined);
					}
				}

				// Otherwise, add tuple issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<unknown[], LooseTupleIssue | BaseIssue<unknown>>;
		},
	};
}
