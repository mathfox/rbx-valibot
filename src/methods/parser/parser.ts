import type { BaseIssue, BaseSchema, Config, InferIssue, InferOutput } from "../../types";
import { parse } from "../parse";

/**
 * The parser type.
 */
export interface Parser<
	TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	TConfig extends Config<InferIssue<TSchema>> | undefined,
> {
	/**
	 * Parses an unknown input based on the schema.
	 */
	(input: unknown): InferOutput<TSchema>;
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
export function parser<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	schema: TSchema,
): Parser<TSchema, undefined>;

/**
 * Returns a function that parses an unknown input based on a schema.
 *
 * @param schema The schema to be used.
 * @param config The parser configuration.
 *
 * @returns The parser function.
 */
export function parser<
	const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	const TConfig extends Config<InferIssue<TSchema>> | undefined,
>(schema: TSchema, config: TConfig): Parser<TSchema, TConfig>;

export function parser(
	schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	config?: Config<InferIssue<BaseSchema<unknown, unknown, BaseIssue<unknown>>>>,
): Parser<BaseSchema<unknown, unknown, BaseIssue<unknown>>, Config<BaseIssue<unknown>> | undefined> {
	const func = setmetatable(
		{},
		{
			__call: (_, input: unknown) => parse(schema, input, config),
		},
	) as Parser<BaseSchema<unknown, unknown, BaseIssue<unknown>>, Config<BaseIssue<unknown>> | undefined>;

	(func as { schema: unknown }).schema = schema;
	(func as { config: unknown }).config = config;

	return func;
}
