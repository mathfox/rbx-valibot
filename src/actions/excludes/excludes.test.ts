import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type ExcludesIssue, excludes } from "./excludes";

describe("excludes", () => {
	describe("should return dataset without issues", () => {
		const action = excludes("foo");

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid strings", () => {
			expectNoActionIssue(action, ["", "fo", "fobar", "123fo"]);
		});

		test("for valid arrays", () => {
			expectNoActionIssue(action, [[], ["fo"], [123, "fobar"], [undefined, 123, true]]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = excludes("foo", "message");
		const baseIssue: Omit<ExcludesIssue<string, "foo">, "input" | "received"> = {
			kind: "validation",
			type: "excludes",
			expected: `!"foo"`,
			message: "message",
			requirement: "foo",
		};

		test("for invalid strings", () => {
			expectActionIssue(action, baseIssue, ["foo", "foobar", "123foo"], () => '"foo"');
		});

		test("for invalid arrays", () => {
			expectActionIssue(
				action,
				baseIssue,
				[["foo"], [123, "foo"], [undefined, 123, "foo", true, "foo"]],
				() => '"foo"',
			);
		});
	});
});
