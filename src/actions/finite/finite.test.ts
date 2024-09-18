import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type FiniteAction, type FiniteIssue, finite } from "./finite";
import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from "@rbxts/number";

describe("finite", () => {
	describe("should return action object", () => {
		const baseAction: Omit<FiniteAction<number, never>, "message"> = {
			kind: "validation",
			type: "finite",
			reference: finite,
			expects: undefined,
			requirement: expect.any("function"),
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const action: FiniteAction<number, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(finite()).toStrictEqual(action);
			expect(finite(undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(finite("message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies FiniteAction<number, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(finite(message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies FiniteAction<number, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = finite();

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for finite numbers", () => {
			expectNoActionIssue(action, [0, 1234, 12.34, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = finite("message");
		const baseIssue: Omit<FiniteIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "finite",
			expected: undefined,
			message: "message",
			requirement: expect.any("function"),
		};

		test("for infinite numbers", () => {
			expectActionIssue(action, baseIssue, [math.huge, -math.huge]);
		});

		test("for not a number", () => {
			expectActionIssue(action, baseIssue, [0 / 0]);
		});
	});
});
