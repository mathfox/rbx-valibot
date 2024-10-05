import isArray from "@rbxts/phantom/src/Array/isArray";
import type {
	BaseIssue,
	BaseSchemaAsync,
	ErrorMessage,
	InferTupleInput,
	InferTupleIssue,
	InferTupleOutput,
	OutputDataset,
	TupleItemsAsync,
} from "../../types";
import { _addIssue } from "../../utils";
import type { StrictTupleIssue } from "./types";
import { getGlobalConfig } from "../../storages";

/**
 * Strict tuple schema async type.
 */
export interface StrictTupleSchemaAsync<
	TItems extends TupleItemsAsync,
	TMessage extends ErrorMessage<StrictTupleIssue> | undefined,
> extends BaseSchemaAsync<
		InferTupleInput<TItems>,
		InferTupleOutput<TItems>,
		StrictTupleIssue | InferTupleIssue<TItems>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "strict_tuple";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof strictTupleAsync;
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
export function strictTupleAsync<const TItems extends TupleItemsAsync>(
	items: TItems,
): StrictTupleSchemaAsync<TItems, undefined>;

/**
 * Creates a strict tuple schema.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A strict tuple schema.
 */
export function strictTupleAsync<
	const TItems extends TupleItemsAsync,
	const TMessage extends ErrorMessage<StrictTupleIssue> | undefined,
>(items: TItems, message: TMessage): StrictTupleSchemaAsync<TItems, TMessage>;

export function strictTupleAsync(
	items: TupleItemsAsync,
	message?: ErrorMessage<StrictTupleIssue>,
): StrictTupleSchemaAsync<TupleItemsAsync, ErrorMessage<StrictTupleIssue> | undefined> {
	return {
		kind: "schema",
		type: "strict_tuple",
		reference: strictTupleAsync,
		expects: "Array",
		async: true,
		items,
		message,
		async _run(dataset, config = getGlobalConfig()) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (isArray(input)) {
				// Set typed to `true` and value to empty array
				dataset.typed = true;
				dataset.value = [];

				const items = (this as StrictTupleSchemaAsync<TupleItemsAsync, ErrorMessage<StrictTupleIssue> | undefined>)
					.items;

				// Parse schema of each tuple item
				const itemDatasets = await Promise.all(
					items.map(async (item, key) => {
						const value = input[key];

						return [
							key,
							value,
							await (item as BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>)._run(
								{ typed: false, value },
								config,
							),
						];
					}),
				);

				// Process each tuple item dataset
				for (const [key, value, itemDataset] of itemDatasets as [
					key: unknown,
					value: unknown,
					itemDataset: OutputDataset<unknown, BaseIssue<unknown>>,
				][]) {
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
