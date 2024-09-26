import isArray from "@rbxts/phantom/src/Array/isArray";
import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	Dataset,
	ErrorMessage,
	InferInput,
	InferIssue,
	InferOutput,
	InferTupleInput,
	InferTupleIssue,
	InferTupleOutput,
	TupleItemsAsync,
} from "../../types";
import { _addIssue } from "../../utils";
import type { TupleWithRestIssue } from "./types";
import slice from "@rbxts/phantom/src/Array/slice";

/**
 * Tuple with rest schema async type.
 */
export interface TupleWithRestSchemaAsync<
	TItems extends TupleItemsAsync,
	TRest extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TMessage extends ErrorMessage<TupleWithRestIssue> | undefined,
> extends BaseSchemaAsync<
		[...InferTupleInput<TItems>, ...InferInput<TRest>[]],
		[...InferTupleOutput<TItems>, ...InferOutput<TRest>[]],
		TupleWithRestIssue | InferTupleIssue<TItems> | InferIssue<TRest>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "tuple_with_rest";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof tupleWithRestAsync;
	/**
	 * The expected property.
	 */
	readonly expects: "Array";
	/**
	 * The items schema.
	 */
	readonly items: TItems;
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
 * Creates a tuple with rest schema.
 *
 * @param items The items schema.
 * @param rest The rest schema.
 *
 * @returns A tuple with rest schema.
 */
export function tupleWithRestAsync<
	const TItems extends TupleItemsAsync,
	const TRest extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(items: TItems, rest: TRest): TupleWithRestSchemaAsync<TItems, TRest, undefined>;

/**
 * Creates a tuple with rest schema.
 *
 * @param items The items schema.
 * @param rest The rest schema.
 * @param message The error message.
 *
 * @returns A tuple with rest schema.
 */
export function tupleWithRestAsync<
	const TItems extends TupleItemsAsync,
	const TRest extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TMessage extends ErrorMessage<TupleWithRestIssue> | undefined,
>(items: TItems, rest: TRest, message: TMessage): TupleWithRestSchemaAsync<TItems, TRest, TMessage>;

export function tupleWithRestAsync(
	items: TupleItemsAsync,
	rest: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	message?: ErrorMessage<TupleWithRestIssue>,
): TupleWithRestSchemaAsync<
	TupleItemsAsync,
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	ErrorMessage<TupleWithRestIssue> | undefined
> {
	return {
		kind: "schema",
		type: "tuple_with_rest",
		reference: tupleWithRestAsync,
		expects: "Array",
		async: true,
		items,
		rest,
		message,
		async _run(dataset, config) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (isArray(input)) {
				// Set typed to `true` and value to empty array
				dataset.typed = true;
				dataset.value = [];

				const items = (
					this as TupleWithRestSchemaAsync<
						TupleItemsAsync,
						BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
						ErrorMessage<TupleWithRestIssue> | undefined
					>
				).items;

				// Parse each normal and rest item
				const [normalDatasets, restDatasets] = await Promise.all([
					// Parse schema of each normal item
					Promise.all(
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
					),

					// Parse other items with rest schema
					Promise.all(
						(slice(input, items.size()) as defined[]).map(async (value, key) => {
							return [
								key + items.size(),
								value,
								await (
									this as TupleWithRestSchemaAsync<
										TupleItemsAsync,
										BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
										ErrorMessage<TupleWithRestIssue> | undefined
									>
								).rest._run({ typed: false, value }, config),
							] as const;
						}),
					),
				]);

				// Process each tuple item dataset
				for (const [key, value, itemDataset] of normalDatasets as [
					key: unknown,
					value: unknown,
					itemDataset: Dataset<unknown, BaseIssue<unknown>>,
				][]) {
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

				// Parse rest with schema if necessary
				if (dataset.issues === undefined || config.abortEarly === false) {
					for (const [key, value, itemDataset] of restDatasets as [
						key: unknown,
						value: unknown,
						itemDataset: Dataset<unknown, BaseIssue<unknown>>,
					][]) {
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
				}

				// Otherwise, add tuple issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<unknown[], TupleWithRestIssue | BaseIssue<unknown>>;
		},
	};
}
