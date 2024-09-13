import { expect } from "@rbxts/jest-globals";
import type { BaseIssue, BaseValidationAsync, InferInput } from "../types";

/**
 * Expect no action issue to be returned.
 *
 * @param action The action to test.
 * @param values The values to test.
 */
export async function expectNoActionIssueAsync<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TAction extends BaseValidationAsync<any, unknown, BaseIssue<unknown>>,
>(action: TAction, values: InferInput<TAction>[]): Promise<void> {
	for (const value of values) {
		expect(await action._run({ typed: true, value }, {})).toStrictEqual({
			typed: true,
			value,
		});
	}
}
