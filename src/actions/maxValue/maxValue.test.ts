import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { maxValue } from "./maxValue";
import { MIN_SAFE_INTEGER, MAX_SAFE_INTEGER } from "@rbxts/phantom/src/Number";

// TODO: Add tests for "non-..." cases (see `value.test`)

describe("maxValue", () => {
	describe("should return dataset without issues", () => {
		test("for untyped inputs", () => {
			expect(maxValue(1)._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid numbers", () => {
			expectNoActionIssue(maxValue(10), [MIN_SAFE_INTEGER, 0, 10]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			kind: "validation",
			type: "max_value",
			message: "message",
		} as const;

		test("for invalid numbers", () => {
			expectActionIssue(maxValue(10, "message"), { ...baseInfo, expected: "<=10", requirement: 10 }, [
				11,
				9999,
				MAX_SAFE_INTEGER,
			]);
		});
	});
});
