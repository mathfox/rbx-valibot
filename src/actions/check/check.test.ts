import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { check } from "./check";
import type { CheckIssue } from "./types";

describe("check", () => {
	describe("should return dataset without issues", () => {
		const action = check<number>((input) => input > 0);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid inputs", () => {
			expectNoActionIssue(action, [1, 12345, math.huge]);
		});
	});

	describe("should return dataset with issues", () => {
		const requirement = (input: number) => input > 0;
		const action = check<number, "message">(requirement, "message");

		const baseIssue: Omit<CheckIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "check",
			expected: undefined,
			message: "message",
			requirement,
		};

		test("for invalid inputs", () => {
			expectActionIssue(action, baseIssue, [0, -1, -12345, -math.huge]);
		});
	});
});
