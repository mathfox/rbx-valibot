import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type LengthIssue, length } from "./length";

describe("length", () => {
	describe("should return dataset without issues", () => {
		const action = length(3);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid strings", () => {
			expectNoActionIssue(action, ["   ", " \n\n", "\n\n\t", "abc", "ABC", "123", "@#$"]);
		});

		test("for valid arrays", () => {
			expectNoActionIssue(action, [
				[1, 2, 3],
				["foo", "bar", "baz"],
				[[1, 2, 3, 4], [5], [6, 7]],
				[{ value: 1 }, { value: 2 }, { value: 3 }],
				["1", 2, { value: 3 }],
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = length(3, "message");
		const baseIssue: Omit<LengthIssue<string, 3>, "input" | "received"> = {
			kind: "validation",
			type: "length",
			expected: "3",
			message: "message",
			requirement: 3,
		};

		test("for invalid strings", () => {
			expectActionIssue(
				action,
				baseIssue,
				["", " ", "  ", "\n", "\n\t", "ab", "abcd", "1", "12", "1234", "@", "@#", "@#$%"],
				(value) => `${(value as ArrayLike<unknown>).size()}`,
			);
		});

		test("for invalid arrays", () => {
			expectActionIssue(
				action,
				baseIssue,
				[
					[],
					[1],
					["1", "2"],
					[1, "2", 3, "4"],
					[[1, 2, 3]],
					[[1, 2], ["3"]],
					[{ 1: "one", 2: "two", 3: "three" }],
					[[1], [2], undefined, [{ value: 3 }]],
				],
				(value) => `${(value as ArrayLike<unknown>).size()}`,
			);
		});
	});
});
