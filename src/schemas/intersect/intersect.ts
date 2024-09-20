import type { BaseIssue, BaseSchema, Dataset, ErrorMessage, InferIssue } from "../../types";
import { _addIssue, _joinExpects } from "../../utils";
import type { InferIntersectInput, InferIntersectOutput, IntersectIssue, IntersectOptions } from "./types";
import { _merge } from "./utils";

/**
 * Intersect schema type.
 */
export interface IntersectSchema<
	TOptions extends IntersectOptions,
	TMessage extends ErrorMessage<IntersectIssue> | undefined,
> extends BaseSchema<
		InferIntersectInput<TOptions>,
		InferIntersectOutput<TOptions>,
		IntersectIssue | InferIssue<TOptions[number]>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "intersect";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof intersect;
	/**
	 * The intersect options.
	 */
	readonly options: TOptions;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates an intersect schema.
 *
 * @param options The intersect options.
 *
 * @returns An intersect schema.
 */
export function intersect<const TOptions extends IntersectOptions>(
	options: TOptions,
): IntersectSchema<TOptions, undefined>;

/**
 * Creates an intersect schema.
 *
 * @param options The intersect options.
 * @param message The error message.
 *
 * @returns An intersect schema.
 */
export function intersect<
	const TOptions extends IntersectOptions,
	const TMessage extends ErrorMessage<IntersectIssue> | undefined,
>(options: TOptions, message: TMessage): IntersectSchema<TOptions, TMessage>;

export function intersect(
	options: IntersectOptions,
	message?: ErrorMessage<IntersectIssue>,
): IntersectSchema<IntersectOptions, ErrorMessage<IntersectIssue> | undefined> {
	return {
		kind: "schema",
		type: "intersect",
		reference: intersect,
		expects: _joinExpects(
			options.map((option) => option.expects),
			"&",
		),
		async: false,
		options,
		message,
		_run(dataset, config) {
			// Parse input with schema of options, if not empty
			if ((this as IntersectSchema<IntersectOptions, ErrorMessage<IntersectIssue> | undefined>).options.size()) {
				// Get input value from dataset
				const input = dataset.value;

				// Create variable to store outputs
				let outputs: unknown[] | undefined;

				// Set typed initially to `true`
				dataset.typed = true;

				// Parse schema of each option and collect outputs
				for (const schema of (this as IntersectSchema<IntersectOptions, ErrorMessage<IntersectIssue> | undefined>)
					.options) {
					const optionDataset = schema._run({ typed: false, value: input }, config);

					// If there are issues, capture them
					if (optionDataset.issues) {
						if (dataset.issues) {
							dataset.issues.push(...(optionDataset.issues as unknown as never[]));
						} else {
							dataset.issues = optionDataset.issues as never;
						}

						// If necessary, abort early
						if (config.abortEarly) {
							dataset.typed = false;
							break;
						}
					}

					// If not typed, set typed to `false`
					if (!optionDataset.typed) {
						dataset.typed = false;
					}

					// Add output of option if necessary
					if (dataset.typed) {
						if (outputs) {
							(outputs as defined[]).push(optionDataset.value as defined);
						} else {
							outputs = [optionDataset.value];
						}
					}
				}

				// If outputs are typed, merge them
				if (dataset.typed) {
					// Set first output as initial output
					dataset.value = outputs![0];

					// Merge outputs into one final output
					for (let index = 1; index < outputs!.size(); index++) {
						const mergeDataset = _merge(dataset.value, outputs![index]);

						// If outputs can't be merged, add issue and break loop
						if (mergeDataset.issue) {
							_addIssue(this, "type", dataset, config, {
								received: "unknown",
							});
							break;
						}

						// Otherwise, set merged output
						dataset.value = mergeDataset.value;
					}
				}

				// Otherwise, add intersect issue
			} else {
				_addIssue(this, "type", dataset, config);
			}

			// Return output dataset
			return dataset as Dataset<never, IntersectIssue | BaseIssue<unknown>>;
		},
	};
}
