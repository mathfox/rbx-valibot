import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type NumberIssue, type NumberSchema, number } from "./number";

describe("number", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<NumberSchema<never>, "message"> = {
			kind: "schema",
			type: "number",
			reference: number,
			expects: "number",
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const schema: NumberSchema<undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(number()).toStrictEqual(schema);
			expect(number(undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(number("message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies NumberSchema<"message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(number(message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies NumberSchema<typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = number();

		test("for number zero", () => {
			expectNoSchemaIssue(schema, [0, -0, 0.0, -0.0]);
		});

		test("for positive integers", () => {
			expectNoSchemaIssue(schema, [1, 23, 456]);
		});

		test("for negative integers", () => {
			expectNoSchemaIssue(schema, [-1, -23, -456]);
		});

		test("for positive floats", () => {
			expectNoSchemaIssue(schema, [0.1, 23.456, 1 / 3]);
		});

		test("for negative floats", () => {
			expectNoSchemaIssue(schema, [-0.1, -23.456, -1 / 3]);
		});

		test("for infinity numbers", () => {
			expectNoSchemaIssue(schema, [math.huge, -math.huge]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = number("message");
		const baseIssue: Omit<NumberIssue, "input" | "received"> = {
			kind: "schema",
			type: "number",
			expected: "number",
			message: "message",
		};

		// Special values

		test("for NaN", () => {
			expectSchemaIssue(schema, baseIssue, [0 / 0]);
		});

		// Primitive types

		test("for booleans", () => {
			expectSchemaIssue(schema, baseIssue, [true, false]);
		});

		test("for undefined", () => {
			expectSchemaIssue(schema, baseIssue, [undefined]);
		});

		test("for strings", () => {
			expectSchemaIssue(schema, baseIssue, ["", "0", "-2", "12.34"]);
		});

		// Complex types

		test("for arrays", () => {
			expectSchemaIssue(schema, baseIssue, [[], ["value"]]);
		});

		test("for functions", () => {
			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
		});

		test("for objects", () => {
			expectSchemaIssue(schema, baseIssue, [{}, { key: "value" }]);
		});
	});
});
