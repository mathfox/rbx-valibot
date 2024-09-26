import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type EveryItemIssue, everyItem } from "./everyItem";

describe("everyItem", () => {
	describe("should return dataset without issues", () => {
		const action = everyItem<number[]>((item: number) => item > 9);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for empty array", () => {
			expectNoActionIssue(action, [[]]);
		});

		test("for valid content", () => {
			expectNoActionIssue(action, [[10, 11, 12, 13, 99]]);
		});
	});

	describe("should return dataset with issues", () => {
		const requirement = (item: number) => item > 9;
		const action = everyItem<number[], "message">(requirement, "message");

		const baseIssue: Omit<EveryItemIssue<number[]>, "input" | "received"> = {
			kind: "validation",
			type: "every_item",
			expected: undefined,
			message: "message",
			requirement,
		};

		test("for invalid content", () => {
			expectActionIssue(action, baseIssue, [[9], [1, 2, 3], [10, 11, -12, 13, 99]]);
		});
	});
});
