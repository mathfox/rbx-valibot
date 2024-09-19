import { expect } from "@rbxts/jest-globals";
import type { BaseIssue, BaseSchemaAsync, InferIssue, UntypedDataset } from "../types";
import { _stringify } from "../utils";

/**
 * Expect an schema issue to be returned.
 *
 * @param schema The schema to test.
 * @param baseIssue The base issue data.
 * @param values The values to test.
 */
export async function expectSchemaIssueAsync<TSchema extends BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>>(
	schema: TSchema,
	baseIssue: Omit<InferIssue<TSchema>, "input" | "received">,
	values: unknown[],
): Promise<void> {
	for (const value of values) {
		expect(await schema._run({ typed: false, value }, {})).toEqual({
			typed: false,
			value,
			issues: [
				{
					requirement: undefined,
					path: undefined,
					issues: undefined,
					lang: undefined,
					abortEarly: undefined,
					abortPipeEarly: undefined,

					...baseIssue,
					input: value,
					received: _stringify(value),
				},
			],
		} satisfies UntypedDataset<InferIssue<TSchema>>);
	}
}
