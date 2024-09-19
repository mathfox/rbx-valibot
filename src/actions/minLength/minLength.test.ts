import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type MinLengthIssue, minLength } from "./minLength";

describe("minLength", () => {
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
