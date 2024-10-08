import type { BaseIssue, BaseSchema, BaseSchemaAsync, Config, InferIssue, InferOutput } from "../../types";
import { parseAsync } from "../parse";

/**
 * The parser async type.
 */
export interface ParserAsync<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TConfig extends Config<InferIssue<TSchema>> | undefined,
> {
	/**
	 * Parses an unknown input based on the schema.
	 */
	(input: unknown): Promise<InferOutput<TSchema>>;
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
export function parserAsync<
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema): ParserAsync<TSchema, undefined>;

/**
 * Returns a function that parses an unknown input based on a schema.
 *
 * @param schema The schema to be used.
 * @param config The parser configuration.
 *
 * @returns The parser function.
 */
export function parserAsync<
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	const TConfig extends Config<InferIssue<TSchema>> | undefined,
>(schema: TSchema, config: TConfig): ParserAsync<TSchema, TConfig>;

export function parserAsync(
	schema: BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	config?: Config<
		InferIssue<BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>
	>,
): ParserAsync<
	BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	Config<BaseIssue<unknown>> | undefined
> {
	const func = setmetatable(
		{},
		{
			__call: (_, input: unknown) => parseAsync(schema, input, config),
		},
	) as ParserAsync<
		BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
		Config<BaseIssue<unknown>> | undefined
	>;

	(func as { schema: unknown }).schema = schema;
	(func as { config: unknown }).config = config;

	return func;
}
