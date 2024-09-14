import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type FunctionIssue, type FunctionSchema, function_ } from "./function";

describe("function", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<FunctionSchema<never>, "message"> = {
			kind: "schema",
			type: "function",
			reference: function_,
			expects: "Function",
			async: false,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		};

		test("with undefined message", () => {
			const schema: FunctionSchema<undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(function_()).toStrictEqual(schema);
			expect(function_(undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(function_("message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies FunctionSchema<"message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(function_(message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies FunctionSchema<typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = function_();

		test("for functions", () => {
			expectNoSchemaIssue(schema, [() => {}, function () {}]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = function_("message");
		const baseIssue: Omit<FunctionIssue, "input" | "received"> = {
			kind: "schema",
			type: "function",
			expected: "Function",
			message: "message",
		};

		// Primitive types

		test("for booleans", () => {
			expectSchemaIssue(schema, baseIssue, [true, false]);
		});

		test("for numbers", () => {
			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
		});

		test("for undefined", () => {
			expectSchemaIssue(schema, baseIssue, [undefined]);
		});

		test("for strings", () => {
			expectSchemaIssue(schema, baseIssue, ["", "foo", "123"]);
		});

		// Complex types

		test("for arrays", () => {
			expectSchemaIssue(schema, baseIssue, [[], ["value"]]);
		});

		test("for objects", () => {
			expectSchemaIssue(schema, baseIssue, [{}, { key: "value" }]);
		});
	});
});
