import { describe, expect, test } from "@rbxts/jest-globals";
import { _subIssues } from "./_subIssues";

describe("_subIssues", () => {
	describe("should return undefined", () => {
		test("for undefined", () => {
			expect(_subIssues(undefined)).toBeUndefined();
		});

		test("for empty array", () => {
			expect(_subIssues([])).toBeUndefined();
		});

		test("for undefined issues", () => {
			expect(_subIssues([{ typed: true, value: "foo" }])).toBeUndefined();
		});
	});
});
