import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type MinSizeIssue, minSize } from "./minSize";

describe("minSize", () => {
	describe("should return dataset without issues", () => {
		const action = minSize(3);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
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
				new Map<string | number, string>([
					[1, "one"],
					["2", "two"],
					[3, "three"],
					[4, "four"],
				]),
				new Map<string | number | boolean, string | undefined>([
					["1", "one"],
					[2, undefined],
					[true, undefined],
					[4, "four"],
					[5, "five"],
				]),
			]);
		});

		test("for valid sets", () => {
			expectNoActionIssue(action, [
				new Set([1, 2, 3]),
				new Set([1, "two", undefined, "4"]),
				new Set(["1", 2, "three", undefined, { value: "5" }]),
			]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = minSize(3, "message");
		const baseIssue: Omit<MinSizeIssue<Map<number, string>, 3>, "input" | "received"> = {
			kind: "validation",
			type: "min_size",
			expected: ">=3",
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
						["two", 2],
					]),
				],
				(value) => `${value.size}`,
			);
		});

		test("for invalid sets", () => {
			expectActionIssue(
				action,
				baseIssue,
				[new Set(), new Set([1]), new Set(["one", undefined])],
				(value) => `${value.size}`,
			);
		});
	});
});
