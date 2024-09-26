import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { string_ } from "../string";
import { nonOptional } from "./nonOptional";
import type { NonOptionalIssue } from "./types";
import { optional } from "../optional";

describe("nonOptional", () => {
	describe("should return dataset without issues", () => {
		const schema = nonOptional(optional(string_()));

		test("for valid wrapped types", () => {
			expectNoSchemaIssue(schema, ["", "foo", "#$%"]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = nonOptional(optional(string_()), "message");
		const baseIssue: Omit<NonOptionalIssue, "input" | "received"> = {
			kind: "schema",
			type: "non_optional",
			expected: "!undefined",
			message: "message",
		};

		test("for undefined", () => {
			expectSchemaIssue(schema, baseIssue, [undefined]);
		});
	});
});
