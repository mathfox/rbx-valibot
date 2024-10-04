import { getGlobalConfig } from "../../storages";
import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	ErrorMessage,
	FailureDataset,
	InferInput,
	InferIssue,
	InferOutput,
	MaybeReadonly,
	PartialDataset,
	SuccessDataset,
} from "../../types";
import { _addIssue, _joinExpects } from "../../utils";
import type { UnionIssue } from "./types";
import { _subIssues } from "./utils";

/**
 * Union options async type.
 */
export type UnionOptionsAsync = MaybeReadonly<
	(BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>)[]
>;

/**
 * Union schema async type.
 */
export interface UnionSchemaAsync<
	TOptions extends UnionOptionsAsync,
	TMessage extends ErrorMessage<UnionIssue<InferIssue<TOptions[number]>>> | undefined,
> extends BaseSchemaAsync<
		InferInput<TOptions[number]>,
		InferOutput<TOptions[number]>,
		UnionIssue<InferIssue<TOptions[number]>> | InferIssue<TOptions[number]>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "union";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof unionAsync;
	/**
	 * The union options.
	 */
	readonly options: TOptions;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates an union schema.
 *
 * @param options The union options.
 *
 * @returns An union schema.
 */
export function unionAsync<const TOptions extends UnionOptionsAsync>(
	options: TOptions,
): UnionSchemaAsync<TOptions, undefined>;

/**
 * Creates an union schema.
 *
 * @param options The union options.
 * @param message The error message.
 *
 * @returns An union schema.
 */
export function unionAsync<
	const TOptions extends UnionOptionsAsync,
	const TMessage extends ErrorMessage<UnionIssue<InferIssue<TOptions[number]>>> | undefined,
>(options: TOptions, message: TMessage): UnionSchemaAsync<TOptions, TMessage>;

export function unionAsync(
	options: UnionOptionsAsync,
	message?: ErrorMessage<UnionIssue<BaseIssue<unknown>>>,
): UnionSchemaAsync<UnionOptionsAsync, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined> {
	return {
		kind: "schema",
		type: "union",
		reference: unionAsync,
		expects: _joinExpects(
			options.map((option) => option.expects),
			"|",
		),
		async: true,
		options,
		message,
		async _run(dataset, config = getGlobalConfig()) {
			// Create variables to collect datasets
			let validDataset: SuccessDataset<unknown> | undefined;
			let typedDatasets: PartialDataset<unknown, BaseIssue<unknown>>[] | undefined;
			let untypedDatasets: FailureDataset<BaseIssue<unknown>>[] | undefined;

			// Parse schema of each option and collect datasets
			for (const schema of (
				this as UnionSchemaAsync<UnionOptionsAsync, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined>
			).options) {
				const optionDataset = await (schema as BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>)._run(
					{ typed: false, value: dataset.value },
					config,
				);

				// If typed, add it to valid or typed datasets
				if (optionDataset.typed === true) {
					// If there are issues, add it to typed datasets
					if (optionDataset.issues !== undefined) {
						if (typedDatasets !== undefined) {
							typedDatasets.push(optionDataset);
						} else {
							typedDatasets = [optionDataset];
						}

						// Otherwise, add it as valid dataset and break loop
					} else {
						validDataset = optionDataset;
						break;
					}

					// Otherwise, add it to untyped datasets
				} else {
					if (untypedDatasets !== undefined) {
						untypedDatasets.push(optionDataset);
					} else {
						untypedDatasets = [optionDataset];
					}
				}
			}

			// If there is a valid dataset, return it
			if (validDataset !== undefined) {
				return validDataset;
			}

			// If there are typed datasets process only those
			if (typedDatasets !== undefined) {
				// If there is only one typed dataset, return it
				if (typedDatasets.size() === 1) {
					return typedDatasets[0];
				}

				// Otherwise, add issue with typed subissues
				// Hint: If there is more than one typed dataset, we use a general
				// union issue with subissues because the issues could contradict
				// each other.
				_addIssue(this, "type", dataset, config, {
					issues: _subIssues(typedDatasets),
				});

				// And set typed to `true`
				dataset.typed = true;

				// Otherwise, if there is exactly one untyped dataset, return it
			} else if (untypedDatasets?.size() === 1) {
				return untypedDatasets[0];

				// Otherwise, add issue with untyped subissues
			} else {
				// Hint: If there are zero or more than one untyped results, we use a
				// general union issue with subissues because the issues could
				// contradict each other.
				_addIssue(this, "type", dataset, config, {
					issues: _subIssues(untypedDatasets),
				});
			}

			// Return output dataset
			return dataset;
		},
	};
}
