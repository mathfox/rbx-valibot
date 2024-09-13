import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseSchema, Config, InferIssue } from "../../types";
import type { SafeParseResult } from "./types";

/**
 * Parses an unknown input based on a schema.
 *
 * @param schema The schema to be used.
 * @param input The input to be parsed.
 * @param config The parse configuration.
 *
 * @returns The parse result.
 */
export function safeParse<const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	schema: TSchema,
	input: unknown,
	config?: Config<InferIssue<TSchema>>,
): SafeParseResult<TSchema> {
	const dataset = schema._run({ typed: false, value: input }, getGlobalConfig(config));
	return {
		typed: dataset.typed,
		success: !dataset.issues,
		output: dataset.value,
		issues: dataset.issues,
	} as SafeParseResult<TSchema>;
}
