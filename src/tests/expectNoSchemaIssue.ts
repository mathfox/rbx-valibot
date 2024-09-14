import { expect } from "@rbxts/jest-globals";
import type { BaseIssue, BaseSchema, InferInput } from "../types";

/**
 * Expect no schema issue to be returned.
 *
 * @param schema The schema to test.
 * @param values The values to test.
 */
export function expectNoSchemaIssue<TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
	schema: TSchema,
	values: InferInput<TSchema>[],
): void {
	for (const value of values) {
		expect(schema._run({ typed: false, value }, {})).toStrictEqual({
			typed: true,
			value,
		});
	}
}
