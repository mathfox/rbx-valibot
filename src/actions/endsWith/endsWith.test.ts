import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type EndsWithAction, type EndsWithIssue, endsWith } from "./endsWith";

describe("endsWith", () => {
	describe("should return action object", () => {
		const baseAction: Omit<EndsWithAction<string, "abc", never>, "message"> = {
			kind: "validation",
			type: "ends_with",
			reference: endsWith,
			expects: '"abc"',
			requirement: "abc",
			async: false,
			_run: expect.any(() => {}),
			//_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const action: EndsWithAction<string, "abc", undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(endsWith("abc")).toStrictEqual(action);
			expect(endsWith("abc", undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(endsWith("abc", "message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies EndsWithAction<string, "abc", string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(endsWith("abc", message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies EndsWithAction<string, "abc", typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = endsWith("abc");

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: false,
				value: null,
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
