import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../vitest";
import { type IntegerAction, type IntegerIssue, integer } from "./integer";
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from "@rbxts/number";

describe("integer", () => {
	describe("should return action object", () => {
		const baseAction: Omit<IntegerAction<number, never>, "message"> = {
			kind: "validation",
			type: "integer",
			reference: integer,
			expects: undefined,
			//requirement: expect.any(Function),
			requirement: expect.any(() => {}),
			async: false,
			_run: expect.any(() => {}),
			//_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const action: IntegerAction<number, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(integer()).toStrictEqual(action);
			expect(integer(undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(integer("message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies IntegerAction<number, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(integer(message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies IntegerAction<number, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = integer();

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: false,
				value: null,
			});
		});

		test("for integer numbers", () => {
			expectNoActionIssue(action, [0, 123456789, -123456789, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = integer("message");
		const baseIssue: Omit<IntegerIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "integer",
			expected: undefined,
			message: "message",
			//requirement: expect.any(Function),
			requirement: expect.any(() => {}),
		};

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
