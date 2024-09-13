import { describe, expect, test } from "vitest";
import { expectActionIssue, expectNoActionIssue } from "../../vitest/index.ts";
import { type LengthAction, type LengthIssue, length } from "./length.ts";

describe("length", () => {
	describe("should return action object", () => {
		const baseAction: Omit<LengthAction<string, 5, never>, "message"> = {
			kind: "validation",
			type: "length",
			reference: length,
			expects: "5",
			requirement: 5,
			async: false,
			_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const action: LengthAction<string, 5, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(length(5)).toStrictEqual(action);
			expect(length(5, undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(length(5, "message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies LengthAction<string, 5, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(length(5, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies LengthAction<string, 5, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = length(3);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: false,
				value: null,
			});
		});

		test("for valid strings", () => {
			expectNoActionIssue(action, [
				"   ",
				" \n\n",
				"\n\n\t",
				"abc",
				"ABC",
				"123",
				"あああ", // 'あ' is 3 bytes but the total length of the string is 3
				"@#$",
			]);
		});

		test("for valid arrays", () => {
			expectNoActionIssue(action, [
				[1, 2, 3],
				["foo", "bar", "baz"],
				[1, null, undefined],
				[[1, 2, 3, 4], [5], [6, 7]],
				[{ value: 1 }, { value: 2 }, { value: 3 }],
				["1", 2, { value: 3 }],
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = length(3, "message");
		const baseIssue: Omit<LengthIssue<string, 3>, "input" | "received"> = {
			kind: "validation",
			type: "length",
			expected: "3",
			message: "message",
			requirement: 3,
		};

		test("for invalid strings", () => {
			expectActionIssue(
				action,
				baseIssue,
				[
					"",
					" ",
					"  ",
					"\n",
					"\n\t",
					"あ", // 'あ' is 3 bytes
					"ab",
					"abcd",
					"1",
					"12",
					"1234",
					"@",
					"@#",
					"@#$%",
				],
				(value) => `${value.length}`,
			);
		});

		test("for invalid arrays", () => {
			expectActionIssue(
				action,
				baseIssue,
				[
					[],
					[1],
					["1", "2"],
					[1, "2", 3, "4"],
					[[1, 2, 3]],
					[[1, 2], ["3"]],
					[{ 1: "one", 2: "two", 3: "three" }],
					[[1], [2], null, [{ value: 3 }]],
				],
				(value) => `${value.length}`,
			);
		});
	});
});
