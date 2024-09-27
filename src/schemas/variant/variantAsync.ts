import { toArray } from "@rbxts/phantom/src/Set";
import type { BaseIssue, BaseSchemaAsync, Dataset, ErrorMessage, InferInput, InferOutput } from "../../types";
import { _addIssue, _joinExpects } from "../../utils";
import type {
	InferVariantIssue,
	VariantIssue,
	VariantOptionSchema,
	VariantOptionSchemaAsync,
	VariantOptionsAsync,
} from "./types";

/**
 * Variant schema async type.
 */
export interface VariantSchemaAsync<
	TKey extends string,
	TOptions extends VariantOptionsAsync<TKey>,
	TMessage extends ErrorMessage<VariantIssue> | undefined,
> extends BaseSchemaAsync<
		InferInput<TOptions[number]>,
		InferOutput<TOptions[number]>,
		VariantIssue | InferVariantIssue<TOptions>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "variant";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof variantAsync;
	/**
	 * The expected property.
	 */
	readonly expects: "Object";
	/**
	 * The discriminator key.
	 */
	readonly key: TKey;
	/**
	 * The variant options.
	 */
	readonly options: TOptions;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a variant schema.
 *
 * @param key The discriminator key.
 * @param options The variant options.
 *
 * @returns A variant schema.
 */
export function variantAsync<const TKey extends string, const TOptions extends VariantOptionsAsync<TKey>>(
	key: TKey,
	options: TOptions,
): VariantSchemaAsync<TKey, TOptions, undefined>;

/**
 * Creates a variant schema.
 *
 * @param key The discriminator key.
 * @param options The variant options.
 * @param message The error message.
 *
 * @returns An variant schema.
 */
export function variantAsync<
	const TKey extends string,
	const TOptions extends VariantOptionsAsync<TKey>,
	const TMessage extends ErrorMessage<VariantIssue> | undefined,
>(key: TKey, options: TOptions, message: TMessage): VariantSchemaAsync<TKey, TOptions, TMessage>;

export function variantAsync(
	key: string,
	options: VariantOptionsAsync<string>,
	message?: ErrorMessage<VariantIssue>,
): VariantSchemaAsync<string, VariantOptionsAsync<string>, ErrorMessage<VariantIssue> | undefined> {
	return {
		kind: "schema",
		type: "variant",
		reference: variantAsync,
		expects: "Object",
		async: true,
		key,
		options,
		message,
		async _run(dataset, config) {
			// Get input value from dataset
			const input = dataset.value;

			// If root type is valid, check nested types
			if (typeIs(input, "table")) {
				// Create output dataset variable
				let outputDataset: Dataset<unknown, BaseIssue<unknown>> | undefined;

				// Create variables to store invalid discriminator information
				let maxDiscriminatorPriority = 0;
				let invalidDiscriminatorKey = (
					this as VariantSchemaAsync<string, VariantOptionsAsync<string>, ErrorMessage<VariantIssue> | undefined>
				).key;
				let expectedDiscriminators: string[] = [];

				// Create recursive function to parse nested variant options
				const parseOptions = async (
					variant: VariantOptionSchema<string> | VariantOptionSchemaAsync<string>,
					allKeys: Set<string>,
				) => {
					for (const schema of variant.options) {
						// If it is a variant schema, parse its options recursively
						if (schema.type === "variant") {
							await parseOptions(schema, new Set<string>(toArray(allKeys)).add(schema.key));

							// Otherwise, check discriminators and parse object schema
						} else {
							// Create variables to store local discriminator information
							let keysAreValid = true;
							let currentPriority = 0;

							// Check if all discriminator keys are valid and collect
							// information about invalid discriminator keys if not
							for (const currentKey of allKeys) {
								// If any discriminator is invalid, mark keys as invalid
								if (
									(
										await (schema.entries[currentKey] as BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>)._run(
											{ typed: false, value: input[currentKey as keyof typeof input] },
											config,
										)
									).issues !== undefined
								) {
									keysAreValid = false;

									// If invalid discriminator key is not equal to current key
									// and if current key has a higher priority or same priority
									// but is the first one present in input, reset invalid
									// discriminator information
									if (
										invalidDiscriminatorKey !== currentKey &&
										(maxDiscriminatorPriority < currentPriority ||
											(maxDiscriminatorPriority === currentPriority &&
												currentKey in input &&
												!(invalidDiscriminatorKey in input)))
									) {
										maxDiscriminatorPriority = currentPriority;
										invalidDiscriminatorKey = currentKey;
										expectedDiscriminators = [];
									}

									// If invalid discriminator key is equal to current key,
									// store its expected value
									if (invalidDiscriminatorKey === currentKey) {
										expectedDiscriminators.push(schema.entries[currentKey].expects);
									}

									// Break loop on first invalid discriminator key
									break;
								}

								// Increase priority for next discriminator key
								currentPriority++;
							}

							// If all discriminators are valid, parse input with schema of option
							if (keysAreValid) {
								const optionDataset = await (schema as BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>)._run(
									{ typed: false, value: input },
									config,
								);

								// Store output dataset if necessary
								// Hint: Only the first untyped or typed dataset is returned, and
								// typed datasets take precedence over untyped ones.
								if (outputDataset === undefined || (outputDataset.typed === false && optionDataset.typed === true)) {
									outputDataset = optionDataset;
								}
							}
						}

						// If valid option is found, break loop
						// Hint: The `break` statement is intentionally placed at the end of
						// the loop to break any outer loops in case of recursive execution.
						if (outputDataset !== undefined && outputDataset.issues === undefined) {
							break;
						}
					}
				};

				// Parse input with nested variant options recursively
				await parseOptions(
					this as VariantSchemaAsync<string, VariantOptionsAsync<string>, ErrorMessage<VariantIssue> | undefined>,
					new Set([
						(this as VariantSchemaAsync<string, VariantOptionsAsync<string>, ErrorMessage<VariantIssue> | undefined>)
							.key,
					]),
				);

				// If any output dataset is available, return it
				if (outputDataset !== undefined) {
					return outputDataset;
				}

				// Otherwise, add discriminator issue
				_addIssue(this, "type", dataset, config, {
					input: input[invalidDiscriminatorKey as keyof typeof input],
					expected: _joinExpects(expectedDiscriminators, "|"),
				});

				// Otherwise, add variant issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Finally, return  output dataset
			return dataset as Dataset<InferOutput<VariantOptionsAsync<string>[number]>, VariantIssue | BaseIssue<unknown>>;
		},
	};
}
