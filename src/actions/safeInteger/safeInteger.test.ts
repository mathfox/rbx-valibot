import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type SafeIntegerIssue, safeInteger } from "./safeInteger";
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from "@rbxts/phantom/src/Number";

describe("safeInteger", () => {
	describe("should return dataset without issues", () => {
		const action = safeInteger();

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for safe integer numbers", () => {
			expectNoActionIssue(action, [0, 123456789, -123456789, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = safeInteger("message");
		const baseIssue: Omit<SafeIntegerIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "safe_integer",
			expected: undefined,
			message: "message",
			requirement: expect.any("function"),
		};

		test("for unsafe integer numbers", () => {
			expectActionIssue(action, baseIssue, [MAX_SAFE_INTEGER + 1, MIN_SAFE_INTEGER - 1]);
		});

		test("for floating point numbers", () => {
			expectActionIssue(action, baseIssue, [0.1, 12.34, -1 / 3, math.pi]);
		});

		test("for infinite numbers", () => {
			expectActionIssue(action, baseIssue, [math.huge, -math.huge]);
		});

		test("for not a number", () => {
			expectActionIssue(action, baseIssue, [0 / 0]);
		});
	});
});
