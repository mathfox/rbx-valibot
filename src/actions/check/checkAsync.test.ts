import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssueAsync, expectNoActionIssueAsync } from "../../tests";
import { type CheckActionAsync, checkAsync } from "./checkAsync";
import type { CheckIssue } from "./types";

describe("checkAsync", () => {
	describe("should return action object", () => {
		const requirement = async (input: string) => input.find("foo")[0] !== undefined;
		const baseAction: Omit<CheckActionAsync<string, never>, "message"> = {
			kind: "validation",
			type: "check",
			reference: checkAsync,
			expects: undefined,
			requirement,
			async: true,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const action: CheckActionAsync<string, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(checkAsync<string>(requirement)).toStrictEqual(action);
			expect(checkAsync<string, undefined>(requirement, undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			const message = "message";
			expect(checkAsync<string, "message">(requirement, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies CheckActionAsync<string, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(checkAsync<string, typeof message>(requirement, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies CheckActionAsync<string, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = checkAsync<number>(async (input) => input > 0);

		test("for untyped inputs", async () => {
			expect(await action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid inputs", async () => {
			await expectNoActionIssueAsync(action, [1, 12345, math.huge]);
		});
	});

	describe("should return dataset with issues", () => {
		const requirement = async (input: number) => input > 0;
		const action = checkAsync<number, "message">(requirement, "message");

		const baseIssue: Omit<CheckIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "check",
			expected: undefined,
			message: "message",
			requirement,
		};

		test("for invalid inputs", async () => {
			await expectActionIssueAsync(action, baseIssue, [0, -1, -12345, -math.huge]);
		});
	});
});
