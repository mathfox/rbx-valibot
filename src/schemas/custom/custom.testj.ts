import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type CustomSchema, custom } from "./custom";
import type { CustomIssue } from "./types";

describe("custom", () => {
	//	type PixelString = `${number}px`;
	//	const isPixelString = (input: unknown) => typeof input === "string" && /^\d+px$/u.test(input);
	//
	//	describe("should return schema object", () => {
	//		const baseSchema: Omit<CustomSchema<PixelString, never>, "message"> = {
	//			kind: "schema",
	//			type: "custom",
	//			reference: custom,
	//			expects: "unknown",
	//			check: isPixelString,
	//			async: false,
	//			_run: expect.any("function"),
	//		};
	//
	//		test("with undefined message", () => {
	//			const schema: CustomSchema<PixelString, undefined> = {
	//				...baseSchema,
	//				message: undefined,
	//			};
	//			expect(custom(isPixelString)).toEqual(schema);
	//			expect(custom(isPixelString, undefined)).toEqual(schema);
	//		});
	//
	//		test("with string message", () => {
	//			expect(custom(isPixelString, "message")).toEqual({
	//				...baseSchema,
	//				message: "message",
	//			} satisfies CustomSchema<PixelString, "message">);
	//		});
	//
	//		test("with function message", () => {
	//			const message = () => "message";
	//			expect(custom(isPixelString, message)).toEqual({
	//				...baseSchema,
	//				message,
	//			} satisfies CustomSchema<PixelString, typeof message>);
	//		});
	//	});
	//
	//	describe("should return dataset without issues", () => {
	//		const schema = custom<PixelString>(isPixelString);
	//
	//		test("for pixel strings", () => {
	//			expectNoSchemaIssue(schema, ["0px", "123px", "456789px"]);
	//		});
	//	});
	//
	//	describe("should return dataset with issues", () => {
	//		const schema = custom<PixelString>(isPixelString, "message");
	//		const baseIssue: Omit<CustomIssue, "input" | "received"> = {
	//			kind: "schema",
	//			type: "custom",
	//			expected: "unknown",
	//			message: "message",
	//		};
	//
	//		// Special values
	//
	//		test("for invalid pixel strings", () => {
	//			expectSchemaIssue(schema, baseIssue, ["0", "0p", "0pxl", "px", "px0"]);
	//		});
	//
	//		// Primitive types
	//
	//		test("for booleans", () => {
	//			expectSchemaIssue(schema, baseIssue, [true, false]);
	//		});
	//
	//		test("for numbers", () => {
	//			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
	//		});
	//
	//		test("for undefined", () => {
	//			expectSchemaIssue(schema, baseIssue, [undefined]);
	//		});
	//
	//		test("for strings", () => {
	//			expectSchemaIssue(schema, baseIssue, ["", "foo", "123"]);
	//		});
	//
	//		// Complex types
	//
	//		test("for arrays", () => {
	//			expectSchemaIssue(schema, baseIssue, [[], ["value"]]);
	//		});
	//
	//		test("for functions", () => {
	//			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
	//		});
	//
	//		test("for objects", () => {
	//			expectSchemaIssue(schema, baseIssue, [{}, { key: "value" }]);
	//		});
	//	});
});
