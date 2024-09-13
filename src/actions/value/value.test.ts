import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../vitest";
import { type ValueAction, value } from "./value";
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from "@rbxts/number";

describe("value", () => {
	describe("should return action object", () => {
		const baseAction: Omit<ValueAction<number, 5, never>, "message"> = {
			kind: "validation",
			type: "value",
			reference: value,
			expects: "5",
			requirement: 5,
			async: false,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		};

		test("with undefined message", () => {
			const action: ValueAction<number, 5, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(value(5)).toStrictEqual(action);
			expect(value(5, undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(value(5, "message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies ValueAction<number, 5, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(value(5, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies ValueAction<number, 5, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		test("for untyped inputs", () => {
			expect(value(1)._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid booleans", () => {
			expectNoActionIssue(value(true), [true]);
			expectNoActionIssue(value(false), [false]);
		});

		test("for valid non-booleans", () => {
			expectNoActionIssue(value(true), [1, 1.0, "1", "1.0", " 1 "]);
			expectNoActionIssue(value(false), [0, 0.0, "0", "0.0", " 0 ", "", " "]);
		});

		test("for valid numbers", () => {
			expectNoActionIssue(value(123), [123, 123.0]);
		});

		test("for valid non-numbers", () => {
			expectNoActionIssue(value(123), ["123", "123.0", " 123 "]);
			expectNoActionIssue(value(1), ["1", "1.0", " 1 ", true]);
			expectNoActionIssue(value(0), ["0", "0.0", " 0 ", "", " ", false]);
		});

		test("for valid strings", () => {
			expectNoActionIssue(value("2024"), ["2024"]);
		});

		test("for valid non-strings", () => {
			expectNoActionIssue(value("1"), [1, 1.0, true]);
			expectNoActionIssue(value("0"), [0, 0.0, false]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			kind: "validation",
			type: "value",
			message: "message",
		} as const;

		const getReceived = (value: unknown): string => tostring(value);

		test("for invalid booleans", () => {
			expectActionIssue(value(true, "message"), { ...baseInfo, expected: "true", requirement: true }, [false]);
			expectActionIssue(value(false, "message"), { ...baseInfo, expected: "false", requirement: false }, [true]);
		});

		test("for invalid numbers", () => {
			expectActionIssue(value(10, "message"), { ...baseInfo, expected: "10", requirement: 10 }, [
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

		test("for invalid non-numbers", () => {
			expectActionIssue(
				value(10, "message"),
				{ ...baseInfo, expected: "10", requirement: 10 },
				["9", "11", "9.0", "11.0", "", " ", true, false],
				getReceived,
			);
			expectActionIssue(
				value(1, "message"),
				{ ...baseInfo, expected: "1", requirement: 1 },
				["0", "0.0", " 0 ", "", " ", false],
				getReceived,
			);
			expectActionIssue(
				value(0, "message"),
				{ ...baseInfo, expected: "0", requirement: 0 },
				["1", "1.0", " 1 ", true],
				getReceived,
			);
		});

		test("for invalid strings", () => {
			expectActionIssue(value("2024", "message"), { ...baseInfo, expected: '"2024"', requirement: "2024" }, [
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

		test("for invalid non-strings", () => {
			expectActionIssue(
				value("10", "message"),
				{ ...baseInfo, expected: '"10"', requirement: "10" },
				[9, 11, 9.0, 11.0, true, false],
				getReceived,
			);
			expectActionIssue(
				value("1", "message"),
				{ ...baseInfo, expected: '"1"', requirement: "1" },
				[0, 0.0, false],
				getReceived,
			);
			expectActionIssue(
				value("0", "message"),
				{ ...baseInfo, expected: '"0"', requirement: "0" },
				[1, 1.0, true],
				getReceived,
			);
		});
	});
});
