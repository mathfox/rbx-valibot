import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../vitest/index.ts";
import { type PromiseIssue, type PromiseSchema, promise } from "./promise.ts";

describe("promise", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<PromiseSchema<never>, "message"> = {
			kind: "schema",
			type: "promise",
			reference: promise,
			expects: "Promise",
			async: false,
			_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const schema: PromiseSchema<undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(promise()).toStrictEqual(schema);
			expect(promise(undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(promise("message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies PromiseSchema<"message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(promise(message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies PromiseSchema<typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = promise();

		test("for Promise objects", () => {
			expectNoSchemaIssue(schema, [Promise.resolve(), Promise.resolve("foo"), Promise.all([])]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = promise("message");
		const baseIssue: Omit<PromiseIssue, "input" | "received"> = {
			kind: "schema",
			type: "promise",
			expected: "Promise",
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

		test("for functions", () => {
			expectSchemaIssue(schema, baseIssue, [() => {}, function () {}]);
		});

		test("for objects", () => {
			expectSchemaIssue(schema, baseIssue, [{}, { key: "value" }]);
		});
	});
});
