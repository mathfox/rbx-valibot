import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../vitest/index.ts";
import { type EmptyAction, type EmptyIssue, empty } from "./empty.ts";

describe("empty", () => {
	describe("should return action object", () => {
		const baseAction: Omit<EmptyAction<string, never>, "message"> = {
			kind: "validation",
			type: "empty",
			reference: empty,
			expects: "0",
			async: false,
			_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const action: EmptyAction<string, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(empty()).toStrictEqual(action);
			expect(empty(undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(empty("message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies EmptyAction<string, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(empty(message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies EmptyAction<string, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = empty();

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: false,
				value: null,
			});
		});

		test("for valid strings", () => {
			expectNoActionIssue(action, [""]);
		});

		test("for valid arrays", () => {
			expectNoActionIssue(action, [[]]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = empty("message");
		const baseIssue: Omit<EmptyIssue<string>, "input" | "received"> = {
			kind: "validation",
			type: "empty",
			expected: "0",
			message: "message",
		};

		test("for invalid strings", () => {
			expectActionIssue(action, baseIssue, [" ", "\n", "foo", "foobarbaz123"], (input) => `${input.length}`);
		});

		test("for invalid arrays", () => {
			expectActionIssue(action, baseIssue, [[null], [1, 2, 3, 4, 6], Array(999)], (input) => `${input.length}`);
		});
	});
});
