import { getDefault } from "../../methods/getDefault";
import type { BaseIssue, BaseSchema, Dataset, Default, InferInput, InferIssue } from "../../types";
import type { InferOptionalOutput } from "./types";

/**
 * Optional schema type.
 */
export interface OptionalSchema<
	TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	TDefault extends Default<TWrapped, undefined>,
> extends BaseSchema<InferInput<TWrapped> | undefined, InferOptionalOutput<TWrapped, TDefault>, InferIssue<TWrapped>> {
	/**
	 * The schema type.
	 */
	readonly type: "optional";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof optional;
	/**
	 * The expected property.
	 */
	readonly expects: `(${TWrapped["expects"]} | undefined)`;
	/**
	 * The wrapped schema.
	 */
	readonly wrapped: TWrapped;
	/**
	 * The default value.
	 */
	readonly default: TDefault;
}

/**
 * Creates a optional schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns A optional schema.
 */
export function optional<const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	wrapped: TWrapped,
): OptionalSchema<TWrapped, never>;

/**
 * Creates a optional schema.
 *
 * @param wrapped The wrapped schema.
 * @param default_ The default value.
 *
 * @returns A optional schema.
 */
export function optional<
	const TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	const TDefault extends Default<TWrapped, undefined>,
>(wrapped: TWrapped, default_: TDefault): OptionalSchema<TWrapped, TDefault>;

export function optional(
	wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	...args: unknown[]
): OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown> {
	return {
		kind: "schema",
		type: "optional",
		reference: optional,
		expects: `(${wrapped.expects} | undefined)`,
		async: false,
		wrapped,
		default: args[0],
		_run(dataset, config) {
			// If value is `undefined`, override it with default or return dataset
			if (dataset.value === undefined) {
				// If default is specified, override value of dataset
				if ("default" in this) {
					dataset.value = getDefault(this, dataset as Dataset<undefined, never>, config);
				}

				// If value is still `undefined`, return dataset
				if (dataset.value === undefined) {
					dataset.typed = true;
					return dataset;
				}
			}

			// Otherwise, return dataset of wrapped schema
			return (this as OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>).wrapped._run(
				dataset,
				config,
			);
		},
	};
}
