import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	Config,
	InferIssue,
	InferOutput,
	MaybePromise,
	OutputDataset,
} from "../../types";
import type { SchemaWithFallback, SchemaWithFallbackAsync } from "../fallback";

/**
 * Infer fallback type.
 */
export type InferFallback<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = TSchema extends
	| SchemaWithFallback<BaseSchema<unknown, unknown, BaseIssue<unknown>>, infer TFallback>
	| SchemaWithFallbackAsync<
			BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
			infer TFallback
	  >
	? TFallback extends InferOutput<TSchema>
		? TFallback
		: TFallback extends () => MaybePromise<InferOutput<TSchema>>
			? ReturnType<TFallback>
			: never
	: undefined;

/**
 * Returns the fallback value of the schema.
 *
 * @param schema The schema to get it from.
 * @param dataset The output dataset if available.
 * @param config The config if available.
 *
 * @returns The fallback value.
 */
export function getFallback<
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(
	schema: TSchema,
	dataset?: OutputDataset<InferOutput<TSchema>, InferIssue<TSchema>>,
	config?: Config<InferIssue<TSchema>>,
): InferFallback<TSchema> {
	return typeIs(
		(schema as SchemaWithFallback<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>).fallback,
		"function",
	)
		? (schema as SchemaWithFallback<BaseSchema<unknown, unknown, BaseIssue<unknown>>, Callback>).fallback(
				dataset,
				config,
			)
		: (schema as SchemaWithFallback<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>).fallback;
}
