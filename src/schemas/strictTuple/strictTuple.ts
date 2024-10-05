import isArray from "@rbxts/phantom/src/Array/isArray";
import type {
	BaseIssue,
	BaseSchema,
	ErrorMessage,
	InferTupleInput,
	InferTupleIssue,
	InferTupleOutput,
	OutputDataset,
	TupleItems,
} from "../../types";
import { _addIssue } from "../../utils";
import type { StrictTupleIssue } from "./types";
import { getGlobalConfig } from "../../storages";

/**
 * Strict tuple schema type.
 */
export interface StrictTupleSchema<
	TItems extends TupleItems,
	TMessage extends ErrorMessage<StrictTupleIssue> | undefined,
> extends BaseSchema<InferTupleInput<TItems>, InferTupleOutput<TItems>, StrictTupleIssue | InferTupleIssue<TItems>> {
	/**
	 * The schema type.
	 */
	readonly type: "strict_tuple";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof strictTuple;
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
 * Creates a strict tuple schema.
 *
 * @param items The items schema.
 *
 * @returns A strict tuple schema.
 */
export function strictTuple<const TItems extends TupleItems>(items: TItems): StrictTupleSchema<TItems, undefined>;

/**
 * Creates a strict tuple schema.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A strict tuple schema.
 */
export function strictTuple<
	const TItems extends TupleItems,
	const TMessage extends ErrorMessage<StrictTupleIssue> | undefined,
>(items: TItems, message: TMessage): StrictTupleSchema<TItems, TMessage>;

export function strictTuple(
	items: TupleItems,
	message?: ErrorMessage<StrictTupleIssue>,
): StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined> {
	return {
		kind: "schema",
		type: "strict_tuple",
		reference: strictTuple,
		expects: "Array",
		async: false,
		items,
		message,
		_run(dataset, config = getGlobalConfig()) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (isArray(input)) {
				// Set typed to `true` and value to empty array
				dataset.typed = true;
				dataset.value = [];

				const items = (this as StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined>).items;

				// Parse schema of each tuple item
				for (let key = 0; key < items.size(); key++) {
					const value = input[key];
					const itemDataset = items[key]._run({ typed: false, value }, config);

					// If there are issues, capture them
					if (itemDataset.issues) {
						if (!dataset.issues) {
							(dataset as unknown as { issues: defined[] }).issues = itemDataset.issues;
						} else {
							// Add modified item dataset issues to issues
							for (const issue of itemDataset.issues) {
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
					if (!itemDataset.typed) {
						dataset.typed = false;
					}

					// Add item to dataset
					(dataset.value as defined[]).push(itemDataset.value as defined);
				}

				// Check input for unknown items if necessary
				if (!(dataset.issues && config.abortEarly) && items.size() < input.size()) {
					const value = input[items.size()];

					_addIssue(this, "type", dataset, config, {
						input: value,
						expected: "never",
					});

					// Hint: We intentionally only add one issue for unknown items.
					// Otherwise, attackers could send large arrays to exhaust
					// device resources. If you want an issue for every unknown item,
					// use the `tupleWithRest` schema with `never` for the `rest`
					// argument.
				}

				// Otherwise, add tuple issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as OutputDataset<unknown[], StrictTupleIssue | BaseIssue<unknown>>;
		},
	};
}
