import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type MultipleOfIssue, multipleOf } from "./multipleOf";

describe("multipleOf", () => {
	describe("should return dataset without issues", () => {
		const action = multipleOf(5);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid numbers", () => {
			expectNoActionIssue(action, [-15, -10, -5, 0, 5, 10, 15]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = multipleOf(5, "message");
		const baseIssue: Omit<MultipleOfIssue<number, 5>, "input" | "received"> = {
			kind: "validation",
			type: "multiple_of",
			expected: "%5",
			message: "message",
			requirement: 5,
		};

		test("for invalid numbers", () => {
			expectActionIssue(action, baseIssue, [-14, -9, -4, 1, 3, 6, 11]);
		});

		test("for infinity", () => {
			expectActionIssue(action, baseIssue, [-math.huge, math.huge]);
		});

		test("for NaN", () => {
			expectActionIssue(action, baseIssue, [0 / 0]);
		});
	});
});
