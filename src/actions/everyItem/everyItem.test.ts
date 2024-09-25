import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type EveryItemAction, type EveryItemIssue, everyItem } from "./everyItem";

describe("everyItem", () => {
	describe("should return action object", () => {
		const requirement = (item: string) => item.sub(1, 2) === "DE";
		const baseAction: Omit<EveryItemAction<string[], never>, "message"> = {
			kind: "validation",
			type: "every_item",
			reference: everyItem,
			expects: undefined,
			requirement,
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const action: EveryItemAction<string[], undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(everyItem<string[]>(requirement)).toStrictEqual(action);
			expect(everyItem<string[], undefined>(requirement, undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			const message = "message";
			expect(everyItem<string[], "message">(requirement, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies EveryItemAction<string[], "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(everyItem<string[], typeof message>(requirement, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies EveryItemAction<string[], typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = everyItem<number[]>((item: number) => item > 9);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
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
