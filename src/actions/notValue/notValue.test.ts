import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { notValue } from "./notValue";
import { MIN_SAFE_INTEGER, MAX_SAFE_INTEGER } from "@rbxts/phantom/src/Number";

describe("notValue", () => {
	describe("should return dataset with issues", () => {
		test("for untyped inputs", () => {
			expect(notValue(1)._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid booleans", () => {
			expectNoActionIssue(notValue(true), [false]);
			expectNoActionIssue(notValue(false), [true]);
		});

		test("for valid non-booleans", () => {
			expectNoActionIssue(notValue(true), [0, 0.0, "0", "0.0", " 0 ", "", " "]);
			expectNoActionIssue(notValue(true), [123, 123.0, "123", "123.0", "foo", "true"]);
			expectNoActionIssue(notValue(false), [1, 1.0, "1", "1.0", " 1 "]);
			expectNoActionIssue(notValue(false), [123, 123.0, "123", "123.0", "foo", "false"]);
		});

		test("for valid numbers", () => {
			expectNoActionIssue(notValue(10), [
				-math.huge,
				MIN_SAFE_INTEGER,
				-10,
				-9,
				9,
				11,
				9999,
				MAX_SAFE_INTEGER,
				math.huge,
				0 / 0,
			]);
		});

		test("for valid non-numbers", () => {
			expectNoActionIssue(notValue(10), ["9", "11", "9.0", "11.0", "", " ", true, false]);
			expectNoActionIssue(notValue(1), ["0", "0.0", " 0 ", "", " ", false]);
			expectNoActionIssue(notValue(0), ["1", "1.0", " 1 ", true]);
		});

		test("for valid strings", () => {
			expectNoActionIssue(notValue("2024"), [
				"202",
				"024",
				" 2024",
				"2024 ",
				"02024",
				"20240",
				"020240",
				"2025",
				"9999",
				"XYZ",
			]);
		});

		test("for valid non-strings", () => {
			expectNoActionIssue(notValue("10"), [9, 11, 9.0, 11.0, true, false]);
			expectNoActionIssue(notValue("1"), [0, 0.0, false]);
			expectNoActionIssue(notValue("0"), [1, 1.0, true]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			kind: "validation",
			type: "not_value",
			message: "message",
		} as const;

		const getReceived = (value: unknown): string => tostring(value);

		test("for invalid booleans", () => {
			expectActionIssue(notValue(true, "message"), { ...baseInfo, expected: "!true", requirement: true }, [true]);
			expectActionIssue(notValue(false, "message"), { ...baseInfo, expected: "!false", requirement: false }, [false]);
		});

		test("for invalid numbers", () => {
			expectActionIssue(notValue(123, "message"), { ...baseInfo, expected: "!123", requirement: 123 }, [123, 123.0]);
		});

		test("for invalid non-numbers", () => {
			expectActionIssue(
				notValue(123, "message"),
				{ ...baseInfo, expected: "!123", requirement: 123 },
				["123", "123.0", " 123 "],
				getReceived,
			);
			expectActionIssue(
				notValue(1, "message"),
				{ ...baseInfo, expected: "!1", requirement: 1 },
				["1", "1.0", " 1 ", true],
				getReceived,
			);
			expectActionIssue(
				notValue(0, "message"),
				{ ...baseInfo, expected: "!0", requirement: 0 },
				["0", "0.0", " 0 ", "", " ", false],
				getReceived,
			);
		});

		test("for invalid strings", () => {
			expectActionIssue(notValue("2024", "message"), { ...baseInfo, expected: '!"2024"', requirement: "2024" }, [
				"2024",
			]);
		});

		test("for invalid non-strings", () => {
			expectActionIssue(
				notValue("1", "message"),
				{ ...baseInfo, expected: '!"1"', requirement: "1" },
				[1, 1.0, true],
				getReceived,
			);
			expectActionIssue(
				notValue("0", "message"),
				{ ...baseInfo, expected: '!"0"', requirement: "0" },
				[0, 0.0, false],
				getReceived,
			);
		});
	});
});
