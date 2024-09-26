import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type SomeItemIssue, someItem } from "./someItem";

describe("someItem", () => {
	describe("should return dataset without issues", () => {
		const action = someItem<number[]>((item: number) => item > 9);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid typed inputs", () => {
			expectNoActionIssue(action, [[10], [-1, 10], [10, 11, 12], [1, 2, 3, 4, 99, 6]]);
		});
	});

	describe("should return dataset with issues", () => {
		const requirement = (item: number) => item > 9;
		const action = someItem<number[], "message">(requirement, "message");

		const baseIssue: Omit<SomeItemIssue<number[]>, "input" | "received"> = {
			kind: "validation",
			type: "some_item",
			expected: undefined,
			message: "message",
			requirement,
		};

		test("for empty array", () => {
			expectActionIssue(action, baseIssue, [[]]);
		});

		test("for invalid typed inputs", () => {
			expectActionIssue(action, baseIssue, [[9], [7, 8, 9], [-1, 0, 1, 2, 3, 4]]);
		});
	});
});
