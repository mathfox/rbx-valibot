import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type MinLengthAction, type MinLengthIssue, minLength } from "./minLength";

describe("minLength", () => {
	describe("should return action object", () => {
		const baseAction: Omit<MinLengthAction<string, 5, never>, "message"> = {
			kind: "validation",
			type: "min_length",
			reference: minLength,
			expects: ">=5",
			requirement: 5,
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const action: MinLengthAction<string, 5, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(minLength(5)).toStrictEqual(action);
			expect(minLength(5, undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(minLength(5, "message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies MinLengthAction<string, 5, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(minLength(5, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies MinLengthAction<string, 5, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = minLength(5);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid strings", () => {
			expectNoActionIssue(action, ["12345", "123456", "foobarbaz123"]);
		});

		test("for valid arrays", () => {
			expectNoActionIssue(action, [[1, 2, 3, 4, 5], new Array(6), new Array(999)]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = minLength(5, "message");
		const baseIssue: Omit<MinLengthIssue<string, 5>, "input" | "received"> = {
			kind: "validation",
			type: "min_length",
			expected: ">=5",
			message: "message",
			requirement: 5,
		};

		test("for invalid strings", () => {
			expectActionIssue(action, baseIssue, ["", "foo", "1234"], (value) => `${(value as ArrayLike<unknown>).size()}`);
		});

		test("for invalid arrays", () => {
			expectActionIssue(
				action,
				baseIssue,
				[[], ["foo", "bar"], [1, 2, 3, 4]],
				(value) => `${(value as ArrayLike<unknown>).size()}`,
			);
		});
	});
});
