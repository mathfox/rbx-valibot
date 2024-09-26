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

		test("for valid numbers", () => {
			expectNoActionIssue(minValue(10), [10, 11, 9999, MAX_SAFE_INTEGER]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			kind: "validation",
			type: "min_value",
			message: "message",
		} as const;

		test("for invalid numbers", () => {
			expectActionIssue(minValue(10, "message"), { ...baseInfo, expected: ">=10", requirement: 10 }, [
				MIN_SAFE_INTEGER,
				0,
				9,
			]);
		});
	});
});
