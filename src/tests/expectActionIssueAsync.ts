import { expect } from "@rbxts/jest-globals";
import type { BaseIssue, BaseValidationAsync, InferInput, InferIssue, PartialDataset } from "../types";
import { _stringify } from "../utils";

/**
 * Expect an action issue to be returned.
 *
 * @param action The action to test.
 * @param baseIssue The base issue data.
 * @param values The values to test.
 * @param getReceived Received value getter.
 */
export async function expectActionIssueAsync<TAction extends BaseValidationAsync<any, unknown, BaseIssue<unknown>>>(
	action: TAction,
	baseIssue: Omit<InferIssue<TAction>, "input" | "received">,
	values: InferInput<TAction>[],
	getReceived?: (value: InferInput<TAction>) => string,
): Promise<void> {
	for (const value of values) {
		expect(await action._run({ typed: true, value }, {})).toEqual({
			typed: true,
			value,
			issues: [
				{
					requirement: undefined,
					issues: undefined,
					lang: undefined,
					abortEarly: undefined,
					abortPipeEarly: undefined,

					input: value,
					received: getReceived?.(value) ?? _stringify(value),
					...baseIssue,
				},
			],
		} satisfies PartialDataset<typeof value, InferIssue<TAction>>);
	}
}
