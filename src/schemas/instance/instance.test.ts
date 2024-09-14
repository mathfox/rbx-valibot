import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue, expectSchemaIssue } from "../../tests";
import { type InstanceIssue, type InstanceSchema, instance } from "./instance";

describe("instance", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<InstanceSchema<DateConstructor, never>, "message"> = {
			kind: "schema",
			type: "instance",
			reference: instance,
			expects: "Date",
			class: Date,
			async: false,
			_run: expect.any(Function),
		};

		test("with undefined message", () => {
			const schema: InstanceSchema<DateConstructor, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(instance(Date)).toStrictEqual(schema);
			expect(instance(Date, undefined)).toStrictEqual(schema);
		});

		test("with string message", () => {
			expect(instance(Date, "message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies InstanceSchema<DateConstructor, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(instance(Date, message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies InstanceSchema<DateConstructor, typeof message>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = instance(Date);

		test("for valid instances", () => {
			expectNoSchemaIssue(schema, [new Date(), new Date(123456789)]);
		});
	});

	describe("should return dataset with issues", () => {
		const schema = instance(Date, "message");
		const baseIssue: Omit<InstanceIssue, "input" | "received"> = {
			kind: "schema",
			type: "instance",
			expected: "Date",
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
