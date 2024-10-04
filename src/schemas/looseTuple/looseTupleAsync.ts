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
import type { LooseTupleIssue } from "./types";
import { getGlobalConfig } from "../../storages";

/**
 * Loose tuple schema async type.
 */
export interface LooseTupleSchemaAsync<
	TItems extends TupleItemsAsync,
	TMessage extends ErrorMessage<LooseTupleIssue> | undefined,
> extends BaseSchemaAsync<
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
	readonly reference: typeof looseTupleAsync;
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
export function looseTupleAsync<const TItems extends TupleItemsAsync>(
	items: TItems,
): LooseTupleSchemaAsync<TItems, undefined>;

/**
 * Creates a loose tuple schema.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A loose tuple schema.
 */
export function looseTupleAsync<
	const TItems extends TupleItemsAsync,
	const TMessage extends ErrorMessage<LooseTupleIssue> | undefined,
>(items: TItems, message: TMessage): LooseTupleSchemaAsync<TItems, TMessage>;

export function looseTupleAsync(
	items: TupleItemsAsync,
	message?: ErrorMessage<LooseTupleIssue>,
): LooseTupleSchemaAsync<TupleItemsAsync, ErrorMessage<LooseTupleIssue> | undefined> {
	return {
		kind: "schema",
		type: "loose_tuple",
		reference: looseTupleAsync,
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

				const items = (this as LooseTupleSchemaAsync<TupleItemsAsync, ErrorMessage<LooseTupleIssue> | undefined>).items;

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
					if (itemDataset.issues !== undefined) {
						if (dataset.issues === undefined) {
							(dataset as { issues: defined[] }).issues = itemDataset.issues;
						} else {
							// Add modified item dataset issues to issues
							for (const issue of itemDataset.issues) {
								(dataset.issues as defined[]).push(issue as defined);
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
				if (dataset.issues === undefined || !config.abortEarly) {
					for (let key = items.size(); key < input.size(); key++) {
						(dataset.value as defined[]).push(input[key] as defined);
					}
				}

				// Otherwise, add tuple issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as OutputDataset<unknown[], LooseTupleIssue | BaseIssue<unknown>>;
		},
	};
}
