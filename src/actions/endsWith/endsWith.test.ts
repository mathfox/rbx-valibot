import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type EndsWithIssue, endsWith } from "./endsWith";

describe("endsWith", () => {
	describe("should return dataset without issues", () => {
		const action = endsWith("abc");

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid inputs", () => {
			expectNoActionIssue(action, ["abc", "123abc", "xyzabc", "xyz123abc"]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = endsWith("abc", "message");
		const baseIssue: Omit<EndsWithIssue<string, "abc">, "input" | "received"> = {
			kind: "validation",
			type: "ends_with",
			expected: '"abc"',
			message: "message",
			requirement: "abc",
		};

		test("for invalid inputs", () => {
			expectActionIssue(
				action,
				baseIssue,
				["", "c", "bc", "abc ", "abC", "123a", "123ab", "xyzab", "abcc", "abcz", "zabcdef"],
				(value) => `"${value.sub(-"abc".size())}"`,
			);
		});
	});
});
