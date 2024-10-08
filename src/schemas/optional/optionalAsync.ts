import { getDefault } from "../../methods/getDefault";
import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseSchema, BaseSchemaAsync, DefaultAsync, InferInput, InferIssue } from "../../types";
import type { InferOptionalOutput } from "./types";

/**
 * Optional schema async type.
 */
export interface OptionalSchemaAsync<
	TWrapped extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TDefault extends DefaultAsync<TWrapped, undefined>,
> extends BaseSchemaAsync<
		InferInput<TWrapped> | undefined,
		InferOptionalOutput<TWrapped, TDefault>,
		InferIssue<TWrapped>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "optional";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof optionalAsync;
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
 * Creates an optional schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns An optional schema.
 */
export function optionalAsync<
	const TWrapped extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): OptionalSchemaAsync<TWrapped, never>;

/**
 * Creates an optional schema.
 *
 * @param wrapped The wrapped schema.
 * @param default_ The default value.
 *
 * @returns An optional schema.
 */
export function optionalAsync<
	const TWrapped extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TDefault extends DefaultAsync<TWrapped, undefined>,
>(wrapped: TWrapped, default_: TDefault): OptionalSchemaAsync<TWrapped, TDefault>;

export function optionalAsync(
	wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	...args: unknown[]
): OptionalSchemaAsync<
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	unknown
> {
	return {
		kind: "schema",
		type: "optional",
		reference: optionalAsync,
		expects: `(${wrapped.expects} | undefined)`,
		async: true,
		wrapped,
		default: args[0],
		async _run(dataset, config = getGlobalConfig()) {
			// If value is `undefined`, override it with default or return dataset
			if (dataset.value === undefined) {
				// If default is specified, override value of dataset
				if ("default" in this) {
					dataset.value = await getDefault(this, dataset, config);
				}

				// If value is still `undefined`, return dataset
				if (dataset.value === undefined) {
					dataset.typed = true;
					return dataset;
				}
			}

			// Otherwise, return dataset of wrapped schema
			return (this as OptionalSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>).wrapped._run(
				dataset,
				config,
			);
		},
	};
}
