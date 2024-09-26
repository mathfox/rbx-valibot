import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type MaxSizeIssue, maxSize } from "./maxSize";

describe("maxSize", () => {
	describe("should return dataset without issues", () => {
		const action = maxSize(3);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid maps", () => {
			expectNoActionIssue(action, [
				new Map(),
				new Map([[1, undefined]]),
				new Map<string | number, string>([
					[1, "one"],
					["2", "two"],
				]),
				new Map<string | number | boolean, string | undefined>([
					["1", "one"],
					[2, undefined],
					[true, undefined],
				]),
			]);
		});

		test("for valid sets", () => {
			expectNoActionIssue(action, [new Set(), new Set([1]), new Set([1, "2"]), new Set(["1", 2, { value: 3 }])]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = maxSize(3, "message");
		const baseIssue: Omit<MaxSizeIssue<Map<number, string>, 3>, "input" | "received"> = {
			kind: "validation",
			type: "max_size",
			expected: "<=3",
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
						[4, "four"],
					]),
					new Map<string, unknown>([
						["one", "foo"],
						["two", 123],
						["three", true],
						["four", undefined],
						["five", undefined],
						["six", {}],
						["seven", []],
					]),
				],
				(value) => `${(value as ReadonlyMap<unknown, unknown>).size()}`,
			);
		});

		test("for invalid sets", () => {
			expectActionIssue(
				action,
				baseIssue,
				[new Set([1, 2, 3, 4]), new Set([1, "3", true, undefined, [], {}])],
				(value) => `${(value as ReadonlyMap<unknown, unknown>).size()}`,
			);
		});
	});
});
