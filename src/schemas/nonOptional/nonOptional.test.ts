import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type StringSchema, string } from "../string";
import { type NonOptionalSchema, nonOptional } from "./nonOptional";
import type { NonOptionalIssue } from "./types";

describe("nonOptional", () => {
	//	describe("should return schema object", () => {
	//		const wrapped = nullish(string());
	//		const baseSchema: Omit<NonOptionalSchema<NullishSchema<StringSchema<undefined>, undefined>, never>, "message"> = {
	//			kind: "schema",
	//			type: "non_optional",
	//			reference: nonOptional,
	//			expects: "!undefined",
	//			wrapped,
	//			async: false,
	//			_run: expect.any("function"),
	//		};
	//
	//		test("with undefined message", () => {
	//			const schema: NonOptionalSchema<NullishSchema<StringSchema<undefined>, undefined>, undefined> = {
	//				...baseSchema,
	//				message: undefined,
	//			};
	//			expect(nonOptional(wrapped)).toStrictEqual(schema);
	//			expect(nonOptional(wrapped, undefined)).toStrictEqual(schema);
	//		});
	//
	//		test("with string message", () => {
	//			expect(nonOptional(wrapped, "message")).toStrictEqual({
	//				...baseSchema,
	//				message: "message",
	//			} satisfies NonOptionalSchema<NullishSchema<StringSchema<undefined>, undefined>, "message">);
	//		});
	//
	//		test("with function message", () => {
	//			const message = () => "message";
	//			expect(nonOptional(wrapped, message)).toStrictEqual({
	//				...baseSchema,
	//				message,
	//			} satisfies NonOptionalSchema<NullishSchema<StringSchema<undefined>, undefined>, typeof message>);
	//		});
	//	});
	//
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
});
