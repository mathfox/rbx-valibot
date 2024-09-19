import type { BaseIssue, BaseSchema, BaseSchemaAsync } from "../../types";

/**
 * Creates an object entries definition from a list of keys and a schema.
 *
 * @param list A list of keys.
 * @param schema The schema of the keys.
 *
 * @returns The object entries.
 */
export function entriesFromList<
	const TList extends readonly (string | number | symbol)[],
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(list: TList, schema: TSchema): Record<TList[number], TSchema> {
	const entries: Record<TList[number], TSchema> = {} as unknown as Record<TList[number], TSchema>;

	for (const key of list) {
		entries[key as TList[number]] = schema;
	}
	return entries;
}
