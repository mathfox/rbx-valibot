import type { BaseIssue, BaseSchema, BaseSchemaAsync, Config, InferIssue } from "../../types";

/**
 * Changes the local configuration of a schema.
 *
 * @param schema The schema to configure.
 * @param config The parse configuration.
 *
 * @returns The configured schema.
 */
export function config<
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(schema: TSchema, config: Config<InferIssue<TSchema>>): TSchema {
	return {
		...schema,
		_run(dataset, config_) {
			// Here we just assume it's non-async schema, in which case Promise will be returned.
			// This is due to roblox-ts macro system.
			return (schema as BaseSchema<unknown, unknown, BaseIssue<unknown>>)._run(dataset, { ...config_, ...config });
		},
	};
}
