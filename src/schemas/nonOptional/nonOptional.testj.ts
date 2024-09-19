//import { describe, expect, test } from "@rbxts/jest-globals";
//import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
//import { type StringSchema, string } from "../string";
//import { type NonOptionalSchema, nonOptional } from "./nonOptional";
//import type { NonOptionalIssue } from "./types";
//
//describe("nonOptional", () => {
//	describe("should return dataset without issues", () => {
//		const schema = nonOptional(nullish(string()));
//
//		test("for valid wrapped types", () => {
//			expectNoSchemaIssue(schema, ["", "foo", "#$%", null]);
//		});
//	});
//
//	describe("should return dataset with issues", () => {
//		const schema = nonOptional(nullish(string()), "message");
//		const baseIssue: Omit<NonOptionalIssue, "input" | "received"> = {
//			kind: "schema",
//			type: "non_optional",
//			expected: "!undefined",
//			message: "message",
//		};
//
//		test("for undefined", () => {
//			expectSchemaIssue(schema, baseIssue, [undefined]);
//		});
//	});
//});
