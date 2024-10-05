import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type EmptyIssue, empty } from "./empty";

describe("empty", () => {
	describe("should return dataset without issues", () => {
		const action = empty();

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
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
			expectActionIssue(
				action,
				baseIssue,
				[" ", "\n", "foo", "foobarbaz123"],
				(input) => `${(input as ArrayLike<any>).size()}`,
			);
		});

		test("for invalid arrays", () => {
			expectActionIssue(
				action,
				baseIssue,
				[[1, 2, 3, 4, 6], new Array(999, 0)],
				(input) => `${(input as ArrayLike<any>).size()}`,
			);
		});
	});
});
