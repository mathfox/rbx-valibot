import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { minValue } from "./minValue";
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from "@rbxts/phantom/src/Number";

// TODO: Add tests for "non-..." cases (see `value.test`)

describe("minValue", () => {
	describe("should return dataset without issues", () => {
		test("for untyped inputs", () => {
			expect(minValue(1)._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid booleans", () => {
			expectNoActionIssue(minValue(false), [false, true]);
			expectNoActionIssue(minValue(true), [true]);
		});

		test("for valid numbers", () => {
			expectNoActionIssue(minValue(10), [10, 11, 9999, MAX_SAFE_INTEGER]);
		});

		test("for valid strings", () => {
			expectNoActionIssue(minValue("2024"), ["2024", "2025", "9999", "XYZ"]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			kind: "validation",
			type: "min_value",
			message: "message",
		} as const;

		test("for invalid booleans", () => {
			expectActionIssue(minValue(true, "message"), { ...baseInfo, expected: ">=true", requirement: true }, [false]);
		});

		test("for invalid numbers", () => {
			expectActionIssue(minValue(10, "message"), { ...baseInfo, expected: ">=10", requirement: 10 }, [
				MIN_SAFE_INTEGER,
				0,
				9,
			]);
		});

		test("for invalid strings", () => {
			expectActionIssue(minValue("2024", "message"), { ...baseInfo, expected: '>="2024"', requirement: "2024" }, [
				"",
				"1234",
				"2023",
			]);
		});
	});
});
