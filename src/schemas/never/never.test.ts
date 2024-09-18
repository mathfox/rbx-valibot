import { describe, expect, test } from "@rbxts/jest-globals";
import { expectSchemaIssue } from "../../tests";
import { type NeverIssue, type NeverSchema, never } from "./never";

describe("never", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<NeverSchema<never>, "message"> = {
			kind: "schema",
			type: "never",
			reference: never,
			expects: "never",
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const schema: NeverSchema<undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(never()).toStrictEqual(schema);
			expect(never(undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(never("message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies NeverSchema<"message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(never(message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies NeverSchema<typeof message>);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = never("message");
		const baseIssue: Omit<NeverIssue, "input" | "received"> = {
			kind: "schema",
			type: "never",
			expected: "never",
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
