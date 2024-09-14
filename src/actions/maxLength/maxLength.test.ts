import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type MaxLengthAction, type MaxLengthIssue, maxLength } from "./maxLength";

describe("maxLength", () => {
	describe("should return action object", () => {
		const baseAction: Omit<MaxLengthAction<string, 5, never>, "message"> = {
			kind: "validation",
			type: "max_length",
			reference: maxLength,
			expects: "<=5",
			requirement: 5,
			async: false,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		};

		test("with undefined message", () => {
			const action: MaxLengthAction<string, 5, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(maxLength(5)).toStrictEqual(action);
			expect(maxLength(5, undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(maxLength(5, "message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies MaxLengthAction<string, 5, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(maxLength(5, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies MaxLengthAction<string, 5, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = maxLength(5);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid strings", () => {
			expectNoActionIssue(action, ["", "foo", "12345"]);
		});

		test("for valid arrays", () => {
			expectNoActionIssue(action, [[], ["foo", "bar"], [1, 2, 3, 4, 5]]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = maxLength(5, "message");
		const baseIssue: Omit<MaxLengthIssue<string, 5>, "input" | "received"> = {
			kind: "validation",
			type: "max_length",
			expected: "<=5",
			message: "message",
			requirement: 5,
		};

		test("for invalid strings", () => {
			expectActionIssue(
				action,
				baseIssue,
				["123456", "foobarbaz123"],
				(value) => `${(value as ArrayLike<defined>).size()}`,
			);
		});

		test("for invalid arrays", () => {
			expectActionIssue(
				action,
				baseIssue,
				[[1, 2, 3, 4, 5, 6], new Array(999)],
				(value) => `${(value as ArrayLike<defined>).size()}`,
			);
		});
	});
});
