import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type RegexIssue, regex } from "./regex";
import RegExp from "@rbxts/regexp";

describe("regex", () => {
	const requirement = RegExp("^ID-d{3}$", "u");

	describe("should return dataset without issues", () => {
		const action = regex(requirement);

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for matching strings", () => {
			expectNoActionIssue(action, ["ID-000", "ID-123", "ID-999"]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = regex(requirement, "message");

		const baseIssue: Omit<RegexIssue<string>, "input" | "received"> = {
			kind: "validation",
			type: "regex",
			expected: `${requirement}`,
			requirement,
			message: "message",
		};

		test("for empty strings", () => {
			expectActionIssue(action, baseIssue, ["", " ", "\n"]);
		});

		test("for blank spaces", () => {
			expectActionIssue(action, baseIssue, [" ID-000", "ID-000 ", " ID-000 "]);
		});

		test("for missing separator", () => {
			expectActionIssue(action, baseIssue, ["ID000"]);
		});

		test("for invalid separators", () => {
			expectActionIssue(action, baseIssue, ["ID 000", "ID:000", "ID–000", "ID_000", "ID/000", "ID.000"]);
		});

		test("for invalid prefix", () => {
			expectActionIssue(action, baseIssue, ["id-000", "D-000", "I-000", "AD-000", "IA-000"]);
		});

		test("for invalid number", () => {
			expectActionIssue(action, baseIssue, [
				"ID-0", // 1 digit
				"ID-00", // 2 digits
				"ID-0000", // 4 digits
				"ID-00000", // 5 digits
				"ID-A00", // letter
				"ID-0A0", // letter
				"ID-00A", // letter
				"ID-a00", // letter
				"ID-0a0", // letter
				"ID-00a", // letter
			]);
		});
	});
});
