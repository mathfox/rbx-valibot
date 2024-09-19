import { getDefault } from "../../methods/getDefault";
import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	Dataset,
	DefaultAsync,
	InferInput,
	InferIssue,
} from "../../types";
import type { InferUndefinedableOutput } from "./types";

/**
 * Undefinedable schema async type.
 */
export interface UndefinedableSchemaAsync<
	TWrapped extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TDefault extends DefaultAsync<TWrapped, undefined>,
> extends BaseSchemaAsync<
		InferInput<TWrapped> | undefined,
		InferUndefinedableOutput<TWrapped, TDefault>,
		InferIssue<TWrapped>
	> {
	/**
	 * The schema type.
	 */
	readonly type: "undefinedable";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof undefinedableAsync;
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
 * Creates an undefinedable schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns An undefinedable schema.
 */
export function undefinedableAsync<
	const TWrapped extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): UndefinedableSchemaAsync<TWrapped, never>;

/**
 * Creates an undefinedable schema.
 *
 * @param wrapped The wrapped schema.
 * @param default_ The default value.
 *
 * @returns An undefinedable schema.
 */
export function undefinedableAsync<
	const TWrapped extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TDefault extends DefaultAsync<TWrapped, undefined>,
>(wrapped: TWrapped, default_: TDefault): UndefinedableSchemaAsync<TWrapped, TDefault>;

export function undefinedableAsync(
	wrapped: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	...args: unknown[]
): UndefinedableSchemaAsync<
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	unknown
> {
	return {
		kind: "schema",
		type: "undefinedable",
		reference: undefinedableAsync,
		expects: `(${wrapped.expects} | undefined)`,
		async: true,
		wrapped,
		default: args[0],
		async _run(dataset, config) {
			// If value is `undefined`, override it with default or return dataset
			if (dataset.value === undefined) {
				// If default is specified, override value of dataset
				if ("default" in this) {
					dataset.value = await getDefault(this, dataset as Dataset<undefined, never>, config);
				}

				// If value is still `undefined`, return dataset
				if (dataset.value === undefined) {
					dataset.typed = true;
					return dataset;
				}
			}

			// Otherwise, return dataset of wrapped schema
			// roblox-ts manual cast
			return (this as UndefinedableSchemaAsync<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>).wrapped._run(
				dataset,
				config,
			);
		},
	};
}
