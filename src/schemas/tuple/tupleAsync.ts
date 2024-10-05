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
import type { TupleIssue } from "./types";
import { getGlobalConfig } from "../../storages";

/**
 * Tuple schema async type.
 */
export interface TupleSchemaAsync<TItems extends TupleItemsAsync, TMessage extends ErrorMessage<TupleIssue> | undefined>
	extends BaseSchemaAsync<InferTupleInput<TItems>, InferTupleOutput<TItems>, TupleIssue | InferTupleIssue<TItems>> {
	/**
	 * The schema type.
	 */
	readonly type: "tuple";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof tupleAsync;
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
 * items you specify. To include unknown items, use `looseTupleAsync`. To
 * return an issue for unknown items, use `strictTupleAsync`. To include and
 * validate unknown items, use `tupleWithRestAsync`.
 *
 * @param items The items schema.
 *
 * @returns A tuple schema.
 */
export function tupleAsync<const TItems extends TupleItemsAsync>(items: TItems): TupleSchemaAsync<TItems, undefined>;

/**
 * Creates a tuple schema.
 *
 * Hint: This schema removes unknown items. The output will only include the
 * items you specify. To include unknown items, use `looseTupleAsync`. To
 * return an issue for unknown items, use `strictTupleAsync`. To include and
 * validate unknown items, use `tupleWithRestAsync`.
 *
 * @param items The items schema.
 * @param message The error message.
 *
 * @returns A tuple schema.
 */
export function tupleAsync<
	const TItems extends TupleItemsAsync,
	const TMessage extends ErrorMessage<TupleIssue> | undefined,
>(items: TItems, message: TMessage): TupleSchemaAsync<TItems, TMessage>;

export function tupleAsync(
	items: TupleItemsAsync,
	message?: ErrorMessage<TupleIssue>,
): TupleSchemaAsync<TupleItemsAsync, ErrorMessage<TupleIssue> | undefined> {
	return {
		kind: "schema",
		type: "tuple",
		reference: tupleAsync,
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

				const items = (this as TupleSchemaAsync<TupleItemsAsync, ErrorMessage<TupleIssue> | undefined>).items;

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
							(dataset as unknown as { issues: defined[] }).issues = itemDataset.issues;
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
			return dataset as OutputDataset<unknown[], TupleIssue | BaseIssue<unknown>>;
		},
	};
}
