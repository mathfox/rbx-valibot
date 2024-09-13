import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../vitest";
import { type NotSizeAction, type NotSizeIssue, notSize } from "./notSize";

describe("notSize", () => {
	describe("should return action object", () => {
		const baseAction: Omit<NotSizeAction<Blob, 5, never>, "message"> = {
			kind: "validation",
			type: "not_size",
			reference: notSize,
			expects: "!5",
			requirement: 5,
			async: false,
			_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const action: NotSizeAction<Blob, 5, undefined> = {
				...baseAction,
				message: undefined,
			};
			expect(notSize(5)).toStrictEqual(action);
			expect(notSize(5, undefined)).toStrictEqual(action);
		});

		test("with string message", () => {
			expect(notSize(5, "message")).toStrictEqual({
				...baseAction,
				message: "message",
			} satisfies NotSizeAction<Blob, 5, string>);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(notSize(5, message)).toStrictEqual({
				...baseAction,
				message,
			} satisfies NotSizeAction<Blob, 5, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const action = notSize(3);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: false,
				value: null,
			});
		});

		test("for valid maps", () => {
			expectNoActionIssue(action, [
				new Map(),
				new Map([[1, "one"]]),
				new Map([
					["one", 1],
					["two", null],
				]),
				new Map<string | number, string | null>([
					[1, "one"],
					[2, "two"],
					["3", "three"],
					[4, null],
				]),
			]);
		});

		test("for valid sets", () => {
			expectNoActionIssue(action, [
				new Set(),
				new Set([1]),
				new Set(["one", null]),
				new Set("1234"),
				new Set([[1, 2, 3, 4], [5, 6], [7], [8, 9]]),
			]);
		});

		test("for valid blobs", () => {
			expectNoActionIssue(action, [
				new Blob([]),
				new Blob([""]),
				new Blob([" "]),
				new Blob(["1"]),
				new Blob(["hi"], { type: "text/plain" }),
				new Blob([new Uint8Array([72, 105])]), // 'Hi'
				new Blob(["  \t\n"]),
				new Blob([new Uint8Array([104, 105, 33, 33])]), // 'hi!!'
				new Blob(["🤖"]),
				new Blob(["🤖😍"]),
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = notSize(3, "message");
		const baseIssue: Omit<NotSizeIssue<Map<number, string>, 3>, "input" | "received"> = {
			kind: "validation",
			type: "not_size",
			expected: "!3",
			message: "message",
			requirement: 3,
		};

		test("for invalid maps", () => {
			expectActionIssue(
				action,
				baseIssue,
				[
					new Map([
						[1, "one"],
						[2, "two"],
						[3, "three"],
					]),
					new Map([
						[" ", "space"],
						["\n", "new-line"],
						["\t", "tab"],
					]),
					new Map<string, string | number>([
						["one", 1],
						["two", "2"],
						["three", 3],
					]),
					new Map<string | number | boolean, string | null>([
						["1", "one"],
						[2, null],
						[true, null],
					]),
				],
				(value) => `${value.size}`,
			);
		});

		test("for invalid sets", () => {
			expectActionIssue(
				action,
				baseIssue,
				[
					new Set([1, 2, 3]),
					new Set("123"),
					new Set([" ", "\n", "\t"]),
					new Set([[1, 2, 3, 4], [5, 6], [7]]),
					new Set([1, "two", null]),
					new Set(["1", { value: "5" }, null]),
				],
				(value) => `${value.size}`,
			);
		});

		test("for invalid blobs", () => {
			expectActionIssue(
				action,
				baseIssue,
				[
					new Blob(["bot"]),
					new Blob(["✨"]),
					new Blob([" \t\n"]),
					new Blob(["1", "2", "3"], { type: "text/plain" }),
					new Blob(
						[
							new Uint8Array([104, 105]), // 'hi'
							new Blob(["!"], { type: "text/plain" }),
						],
						{ type: "text/plain" },
					),
				],
				(value) => `${value.size}`,
			);
		});
	});
});
