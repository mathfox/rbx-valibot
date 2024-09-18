import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type LiteralIssue, type LiteralSchema, literal } from "./literal";

describe("literal", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<LiteralSchema<123, never>, "message"> = {
			kind: "schema",
			type: "literal",
			reference: literal,
			literal: 123,
			expects: "123",
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const schema: LiteralSchema<123, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(literal(123)).toStrictEqual(schema);
			expect(literal(123, undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(literal(123, "message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies LiteralSchema<123, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(literal(123, message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies LiteralSchema<123, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		test("for valid bigint literal", () => {
			expectNoSchemaIssue(literal(-1n), [-1n]);
			expectNoSchemaIssue(literal(0n), [0n]);
			expectNoSchemaIssue(literal(123n), [123n]);
		});

		test("for valid boolean literal", () => {
			expectNoSchemaIssue(literal(true), [true]);
			expectNoSchemaIssue(literal(false), [false]);
		});

		test("for valid number literal", () => {
			expectNoSchemaIssue(literal(-1), [-1]);
			expectNoSchemaIssue(literal(0), [0]);
			expectNoSchemaIssue(literal(123), [123]);
			expectNoSchemaIssue(literal(45.67), [45.67]);
		});

		test("for valid string literal", () => {
			expectNoSchemaIssue(literal(""), [""]);
			expectNoSchemaIssue(literal("foo"), ["foo"]);
			expectNoSchemaIssue(literal("123"), ["123"]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseIssue: Omit<LiteralIssue, "input" | "expected" | "received"> = {
			kind: "schema",
			type: "literal",
			message: "message",
		};

		test("for invalid bigint literal", () => {
			expectSchemaIssue(literal(123n, "message"), { ...baseIssue, expected: "123" }, [
				true,
				false,
				123,
				undefined,
				"123",
				{},
				[],
				() => {},
			]);
		});

		test("for invalid boolean literal", () => {
			expectSchemaIssue(literal(false, "message"), { ...baseIssue, expected: "false" }, [
				true,
				0,
				undefined,
				"",
				{},
				[],
				() => {},
			]);
		});

		test("for invalid number literal", () => {
			expectSchemaIssue(literal(123, "message"), { ...baseIssue, expected: "123" }, [
				true,
				false,
				null,
				-123,
				0,
				45.67,
				undefined,
				"123",
				{},
				[],
				() => {},
			]);
		});

		test("for invalid string literal", () => {
			expectSchemaIssue(literal("123", "message"), { ...baseIssue, expected: '"123"' }, [
				true,
				false,
				-123,
				undefined,
				"",
				"foo",
				{},
				[],
				() => {},
			]);
		});
	});
});
