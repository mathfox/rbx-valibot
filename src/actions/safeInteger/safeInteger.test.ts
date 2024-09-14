import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type SafeIntegerAction, type SafeIntegerIssue, safeInteger } from "./safeInteger";
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from "@rbxts/number";

describe("safeInteger", () => {
	describe("should return action object", () => {
		const baseAction: Omit<SafeIntegerAction<number, never>, "message"> = {
			kind: "validation",
			type: "safe_integer",
			reference: safeInteger,
			expects: undefined,
			//requirement: expect.any(Function),
			requirement: expect.any(() => {}),
			async: false,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		};

		test("with undefined message", () => {
			const action: SafeIntegerAction<number, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(safeInteger()).toStrictEqual(action);
			expect(safeInteger(undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(safeInteger("message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies SafeIntegerAction<number, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(safeInteger(message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies SafeIntegerAction<number, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = safeInteger();

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
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
			//requirement: expect.any(Function),
			requirement: expect.any(() => {}),
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
