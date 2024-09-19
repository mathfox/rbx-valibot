import { describe, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type LiteralIssue, literal } from "./literal";

describe("literal", () => {
	describe("should return dataset without issues", () => {
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
				//"",
				"foo",
				{},
				[],
				() => {},
			]);
		});
	});
});
