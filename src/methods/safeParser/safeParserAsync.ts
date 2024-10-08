import type { BaseIssue, BaseSchema, BaseSchemaAsync, Config, InferIssue } from "../../types";
import { type SafeParseResult, safeParseAsync } from "../safeParse";

/**
 * The safe parser async type.
 */
export interface SafeParserAsync<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TConfig extends Config<InferIssue<TSchema>> | undefined,
> {
	/**
	 * Parses an unknown input based on the schema.
	 */
	(input: unknown): Promise<SafeParseResult<TSchema>>;
	/**
	 * The schema to be used.
	 */
	readonly schema: TSchema;
	/**
	 * The parser configuration.
	 */
	readonly config: TConfig;
}

/**
 * Returns a function that parses an unknown input based on a schema.
 *
 * @param schema The schema to be used.
 *
 * @returns The parser function.
 */
export function safeParserAsync<
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): SafeParserAsync<TSchema, undefined>;

/**
 * Returns a function that parses an unknown input based on a schema.
 *
 * @param schema The schema to be used.
 * @param config The parser configuration.
 *
 * @returns The parser function.
 */
export function safeParserAsync<
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TConfig extends Config<InferIssue<TSchema>> | undefined,
>(schema: TSchema, config: TConfig): SafeParserAsync<TSchema, TConfig>;

export function safeParserAsync(
	schema: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	config?: Config<
		InferIssue<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>
	>,
): SafeParserAsync<
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	Config<BaseIssue<unknown>> | undefined
> {
	const func = setmetatable(
		{},
		{
			__call: (_, input: unknown) => safeParseAsync(schema, input, config),
		},
	) as SafeParserAsync<
		BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
		Config<BaseIssue<unknown>> | undefined
	>;

	(func as { schema: unknown }).schema = schema;
	(func as { config: unknown }).config = config;

	return func;
}
