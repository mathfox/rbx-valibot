import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type IncludesIssue, includes } from "./includes";

describe("includes", () => {
	describe("should return dataset without issues", () => {
		const action = includes("foo");

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid strings", () => {
			expectNoActionIssue(action, ["foo", "foobar", "123foo"]);
		});

		test("for valid arrays", () => {
			expectNoActionIssue(action, [["foo"], [123, "foo"], [123, "foo", true, "foo"]]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = includes("foo", "message");
		const baseIssue: Omit<IncludesIssue<string, "foo">, "input" | "received"> = {
			kind: "validation",
			type: "includes",
			expected: '"foo"',
			message: "message",
			requirement: "foo",
		};

		test("for invalid strings", () => {
			expectActionIssue(action, baseIssue, ["", "fo", "fobar", "123fo"], () => '!"foo"');
		});

		test("for invalid arrays", () => {
			expectActionIssue(action, baseIssue, [[], ["fo"], [123, "fobar"], [undefined, 123, true]], () => '!"foo"');
		});
	});
});
