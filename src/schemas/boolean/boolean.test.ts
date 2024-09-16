import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type BooleanIssue, type BooleanSchema, boolean } from "./boolean";

describe("boolean", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<BooleanSchema<never>, "message"> = {
			kind: "schema",
			type: "boolean",
			reference: boolean,
			expects: "boolean",
			async: false,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		};

		test("with undefined message", () => {
			const schema: BooleanSchema<undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(boolean()).toStrictEqual(schema);
			expect(boolean(undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(boolean("message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies BooleanSchema<"message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(boolean(message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies BooleanSchema<typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = boolean();

		test("for true boolean", () => {
			expectNoSchemaIssue(schema, [true]);
		});

		test("for false boolean", () => {
			expectNoSchemaIssue(schema, [false]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = boolean("message");
		const baseIssue: Omit<BooleanIssue, "input" | "received"> = {
			kind: "schema",
			type: "boolean",
			expected: "boolean",
			message: "message",
		};

		// Primitive types

		test("for numbers", () => {
			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
		});

		test("for undefined", () => {
			expectSchemaIssue(schema, baseIssue, [undefined]);
		});

		test("for strings", () => {
			expectSchemaIssue(schema, baseIssue, ["", "0", "true", "false"]);
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
