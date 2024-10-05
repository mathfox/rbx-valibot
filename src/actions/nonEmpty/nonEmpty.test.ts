import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type NonEmptyIssue, nonEmpty } from "./nonEmpty";

describe("nonEmpty", () => {
	describe("should return dataset without issues", () => {
		const action = nonEmpty();

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid strings", () => {
			expectNoActionIssue(action, [" ", "\n", "foo", "foobarbaz123"]);
		});

		test("for valid arrays", () => {
			expectNoActionIssue(action, [[3], [1, 2, 3, 4, 6], new Array(999, 0)]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = nonEmpty("message");
		const baseIssue: Omit<NonEmptyIssue<string>, "input" | "received"> = {
			kind: "validation",
			type: "non_empty",
			expected: "!0",
			message: "message",
		};

		test("for invalid strings", () => {
			expectActionIssue(action, baseIssue, [""], () => "0");
		});

		test("for invalid arrays", () => {
			expectActionIssue(action, baseIssue, [[]], () => "0");
		});
	});
});
