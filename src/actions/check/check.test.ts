import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type CheckAction, check } from "./check";
import type { CheckIssue } from "./types";

describe("check", () => {
	describe("should return action object", () => {
		const requirement = (input: string) => input.find("foo")[0] != undefined;
		const baseAction: Omit<CheckAction<string, never>, "message"> = {
			kind: "validation",
			type: "check",
			reference: check,
			expects: undefined,
			requirement,
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const action: CheckAction<string, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(check<string>(requirement)).toStrictEqual(action);
			expect(check<string, undefined>(requirement, undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			const message = "message";
			expect(check<string, "message">(requirement, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies CheckAction<string, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(check<string, typeof message>(requirement, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies CheckAction<string, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = check<number>((input) => input > 0);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid inputs", () => {
			expectNoActionIssue(action, [1, 12345, math.huge]);
		});
	});

	describe("should return dataset with issues", () => {
		const requirement = (input: number) => input > 0;
		const action = check<number, "message">(requirement, "message");

		const baseIssue: Omit<CheckIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "check",
			expected: undefined,
			message: "message",
			requirement,
		};

		test("for invalid inputs", () => {
			expectActionIssue(action, baseIssue, [0, -1, -12345, -math.huge]);
		});
	});
});
