import type { OptionalSchema, OptionalSchemaAsync, UndefinedableSchema, UndefinedableSchemaAsync } from "../../schemas";
import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	Config,
	Dataset,
	InferInput,
	InferIssue,
	MaybePromise,
} from "../../types";

/**
 * Infer default type.
 */
export type InferDefault<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
		| OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>
		| OptionalSchemaAsync<
				BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
				unknown
		  >
		| UndefinedableSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>
		| UndefinedableSchemaAsync<
				BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
				unknown
		  >,
> = TSchema extends
	| OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, infer TDefault>
	| OptionalSchemaAsync<
			BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
			infer TDefault
	  >
	| UndefinedableSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, infer TDefault>
	| UndefinedableSchemaAsync<
			BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
			infer TDefault
	  >
	? [TDefault] extends [never]
		? undefined
		: TDefault extends () => MaybePromise<InferInput<TSchema>>
			? ReturnType<TDefault>
			: TDefault
	: undefined;

/**
 * Returns the default value of the schema.
 *
 * @param schema The schema to get it from.
 * @param dataset The input dataset if available.
 * @param config The config if available.
 *
 * @returns The default value.
 */
export function getDefault<
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema, dataset?: Dataset<undefined, never>, config?: Config<InferIssue<TSchema>>): InferDefault<TSchema> {
	// roblox-ts requires weird manual casts
	return typeIs((schema as unknown as { default: unknown }).default, "function")
		? (schema as unknown as { default: Callback }).default(dataset, config)
		: (schema as unknown as { default: unknown }).default;
}
