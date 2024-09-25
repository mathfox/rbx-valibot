import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type MaxValueAction, maxValue } from "./maxValue";
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from "@rbxts/number";

// TODO: Add tests for "non-..." cases (see `value.test`)

describe("maxValue", () => {
	describe("should return action object", () => {
		const baseAction: Omit<MaxValueAction<number, 5, never>, "message"> = {
			kind: "validation",
			type: "max_value",
			reference: maxValue,
			expects: "<=5",
			requirement: 5,
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const action: MaxValueAction<number, 5, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(maxValue(5)).toStrictEqual(action);
			expect(maxValue(5, undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(maxValue(5, "message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies MaxValueAction<number, 5, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(maxValue(5, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies MaxValueAction<number, 5, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		test("for untyped inputs", () => {
			expect(maxValue(1)._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid booleans", () => {
			expectNoActionIssue(maxValue(true), [true, false]);
			expectNoActionIssue(maxValue(false), [false]);
		});

		test("for valid numbers", () => {
			expectNoActionIssue(maxValue(10), [MIN_SAFE_INTEGER, 0, 10]);
		});

		test("for valid strings", () => {
			expectNoActionIssue(maxValue("2024"), ["", "1234", "2024"]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			kind: "validation",
			type: "max_value",
			message: "message",
		} as const;

		test("for invalid booleans", () => {
			expectActionIssue(maxValue(false, "message"), { ...baseInfo, expected: "<=false", requirement: false }, [true]);
		});

		test("for invalid numbers", () => {
			expectActionIssue(maxValue(10, "message"), { ...baseInfo, expected: "<=10", requirement: 10 }, [
				11,
				9999,
				MAX_SAFE_INTEGER,
			]);
		});

		test("for invalid strings", () => {
			expectActionIssue(maxValue("2024", "message"), { ...baseInfo, expected: '<="2024"', requirement: "2024" }, [
				"2025",
				"9999",
				"XYZ",
			]);
		});
	});
});
