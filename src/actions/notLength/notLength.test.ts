import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type NotLengthAction, type NotLengthIssue, notLength } from "./notLength";

describe("notLength", () => {
	describe("should return action object", () => {
		const baseAction: Omit<NotLengthAction<string, 5, never>, "message"> = {
			kind: "validation",
			type: "not_length",
			reference: notLength,
			expects: "!5",
			requirement: 5,
			async: false,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		};

		test("with undefined message", () => {
			const action: NotLengthAction<string, 5, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(notLength(5)).toStrictEqual(action);
			expect(notLength(5, undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(notLength(5, "message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies NotLengthAction<string, 5, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(notLength(5, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies NotLengthAction<string, 5, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = notLength(3);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid strings", () => {
			expectNoActionIssue(action, [
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
			]);
		});

		test("for valid arrays", () => {
			expectNoActionIssue(action, [
				[],
				[1],
				["1", "2"],
				[1, "2", 3, "4"],
				[[1, 2, 3]],
				[[1, 2], ["3"]],
				[{ 1: "one", 2: "two", 3: "three" }],
				[[1], [2], undefined, [{ value: 3 }]],
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = notLength(3, "message");
		const baseIssue: Omit<NotLengthIssue<string, 3>, "input" | "received"> = {
			kind: "validation",
			type: "not_length",
			expected: "!3",
			message: "message",
			requirement: 3,
		};

		test("for invalid strings", () => {
			expectActionIssue(
				action,
				baseIssue,
				[
					"   ",
					" \n\n",
					"\n\n\t",
					"abc",
					"ABC",
					"123",
					"あああ", // 'あ' is 3 bytes but the total length of the string is 3
					"@#$",
				],
				(value) => `${(value as ArrayLike<unknown>).size()}`,
			);
		});

		test("for invalid arrays", () => {
			expectActionIssue(
				action,
				baseIssue,
				[
					[1, 2, 3],
					["foo", "bar", "baz"],
					[1, undefined, undefined],
					[[1, 2, 3, 4], [5], [6, 7]],
					[{ value: 1 }, { value: 2 }, { value: 3 }],
					["1", 2, { value: 3 }],
				],
				(value) => `${(value as ArrayLike<unknown>).size()}`,
			);
		});
	});
});
