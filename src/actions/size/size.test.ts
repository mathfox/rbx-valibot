import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type SizeIssue, size } from "./size";

describe("size", () => {
	describe("should return dataset without issues", () => {
		const action = size(3);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid maps", () => {
			expectNoActionIssue(action, [
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
				new Map<string | number | boolean, string | undefined>([
					["1", "one"],
					[2, undefined],
					[true, undefined],
				]),
			]);
		});

		test("for valid sets", () => {
			expectNoActionIssue(action, [
				new Set([1, 2, 3]),
				new Set(["123"]),
				new Set([" ", "\n", "\t"]),
				new Set([[1, 2, 3, 4], [5, 6], [7]]),
				new Set([1, "two", undefined]),
				new Set(["1", { value: "5" }, undefined]),
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = size(3, "message");
		const baseIssue: Omit<SizeIssue<Map<number, string>, 3>, "input" | "received"> = {
			kind: "validation",
			type: "size",
			expected: "3",
			message: "message",
			requirement: 3,
		};

		test("for invalid maps", () => {
			expectActionIssue(
				action,
				baseIssue,
				[
					new Map(),
					new Map([[1, "one"]]),
					new Map([
						["one", 1],
						["two", undefined],
					]),
					new Map<string | number, string | undefined>([
						[1, "one"],
						[2, "two"],
						["3", "three"],
						[4, undefined],
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
					new Set(),
					new Set([1]),
					new Set(["one", undefined]),
					new Set(["1234"]),
					new Set([[1, 2, 3, 4], [5, 6], [7], [8, 9]]),
				],
				(value) => `${value.size}`,
			);
		});
	});
});
