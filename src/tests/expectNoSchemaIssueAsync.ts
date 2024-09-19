import { expect } from "@rbxts/jest-globals";
import type { BaseIssue, BaseSchemaAsync, InferInput } from "../types";

/**
 * Expect no schema issue to be returned.
 *
 * @param schema The schema to test.
 * @param values The values to test.
 */
export async function expectNoSchemaIssueAsync<TSchema extends BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(
	schema: TSchema,
	values: InferInput<TSchema>[],
): Promise<void> {
	for (const value of values) {
		expect(await schema._run({ typed: false, value }, {})).toEqual({
			typed: true,
			value,
		});
	}
}
