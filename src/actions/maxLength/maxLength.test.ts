import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type MaxLengthIssue, maxLength } from "./maxLength";

describe("maxLength", () => {
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
