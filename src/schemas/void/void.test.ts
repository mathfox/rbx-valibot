import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type VoidIssue, type VoidSchema, void_ } from "./void";

describe("void", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<VoidSchema<never>, "message"> = {
			kind: "schema",
			type: "void",
			reference: void_,
			expects: "void",
			async: false,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		};

		test("with undefined message", () => {
			const schema: VoidSchema<undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(void_()).toStrictEqual(schema);
			expect(void_(undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(void_("message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies VoidSchema<"message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(void_(message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies VoidSchema<typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = void_();

		test("for undefined", () => {
			expectNoSchemaIssue(schema, [undefined]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = void_("message");
		const baseIssue: Omit<VoidIssue, "input" | "received"> = {
			kind: "schema",
			type: "void",
			expected: "void",
			message: "message",
		};

		// Primitive types

		test("for booleans", () => {
			expectSchemaIssue(schema, baseIssue, [true, false]);
		});

		test("for numbers", () => {
			expectSchemaIssue(schema, baseIssue, [-1, 0, 123, 45.67]);
		});

		test("for strings", () => {
			expectSchemaIssue(schema, baseIssue, ["", "foo", "123"]);
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
