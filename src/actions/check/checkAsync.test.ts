import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssueAsync, expectNoActionIssueAsync } from "../../tests";
import { checkAsync } from "./checkAsync";
import type { CheckIssue } from "./types";

describe("checkAsync", () => {
	describe("should return dataset without issues", () => {
		const action = checkAsync<number>(async (input) => input > 0);

		test("for untyped inputs", async () => {
			expect(await action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid inputs", async () => {
			await expectNoActionIssueAsync(action, [1, 12345, math.huge]);
		});
	});

	describe("should return dataset with issues", () => {
		const requirement = async (input: number) => input > 0;
		const action = checkAsync<number, "message">(requirement, "message");

		const baseIssue: Omit<CheckIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "check",
			expected: undefined,
			message: "message",
			requirement,
		};

		test("for invalid inputs", async () => {
			await expectActionIssueAsync(action, baseIssue, [0, -1, -12345, -math.huge]);
		});
	});
});
