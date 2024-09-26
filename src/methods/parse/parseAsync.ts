import { getGlobalConfig } from "../../storages";
import type { BaseIssue, BaseSchema, BaseSchemaAsync, Config, InferIssue, InferOutput } from "../../types";
import { ValiError } from "../../utils";

/**
 * Parses an unknown input based on a schema.
 *
 * @param schema The schema to be used.
 * @param input The input to be parsed.
 * @param config The parse configuration.
 *
 * @returns The parsed input.
 */
export async function parseAsync<
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema, input: unknown, config?: Config<InferIssue<TSchema>>): Promise<InferOutput<TSchema>> {
	const dataset = await (schema as BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>)._run(
		{ typed: false, value: input },
		getGlobalConfig(config),
	);

	if (dataset.issues !== undefined) {
		throw new ValiError(dataset.issues);
	}

	return dataset.value;
}
