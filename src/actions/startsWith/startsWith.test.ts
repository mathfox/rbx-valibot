import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type StartsWithIssue, startsWith } from "./startsWith";

describe("startsWith", () => {
	describe("should return dataset without issues", () => {
		const action = startsWith("abc");

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid inputs", () => {
			expectNoActionIssue(action, ["abc", "abcdef", "abc123", "abc123def"]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = startsWith("abc", "message");
		const baseIssue: Omit<StartsWithIssue<string, "abc">, "input" | "received"> = {
			kind: "validation",
			type: "starts_with",
			expected: '"abc"',
			message: "message",
			requirement: "abc",
		};

		test("for invalid inputs", () => {
			expectActionIssue(
				action,
				baseIssue,
				["", "a", "ab", " abc", "Abc", "a123", "ab123", "abdef", "aabc", "zabc", "zabcdef"],
				(value) => `"${value.sub(1, "abc".size())}"`,
			);
		});
	});
});
