import { describe, expect, test } from "@rbxts/jest-globals";
import type { TypedDataset } from "../../types/dataset";
import { expectNoActionIssue } from "../../tests";
import { type CheckItemsIssue, checkItems } from "./checkItems";

describe("checkItems", () => {
	describe("should return dataset without issues", () => {
		const action = checkItems<number[]>((item: number) => item > 9);

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
		const action = checkItems<number[], "message">(requirement, "message");

		const baseIssue: Omit<CheckItemsIssue<number[]>, "input" | "received"> = {
			kind: "validation",
			type: "check_items",
			expected: undefined,
			message: "message",
			requirement,
			issues: undefined,
			lang: undefined,
			abortEarly: undefined,
			abortPipeEarly: undefined,
		};

		test("for invalid content", () => {
			const input = [-12, 345, 6, 10];
			expect(action._run({ typed: true, value: input }, {})).toEqual({
				typed: true,
				value: input,
				issues: [
					{
						...baseIssue,
						input: input[0],
						received: `${input[0]}`,
					},
					{
						...baseIssue,
						input: input[2],
						received: `${input[2]}`,
					},
				],
			} satisfies TypedDataset<number[], CheckItemsIssue<number[]>>);
		});
	});
});
