import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue } from "../../vitest/index.ts";
import { type StringSchema, string } from "../string/index.ts";
import { type NullableSchema, nullable } from "./nullable.ts";

describe("nullable", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<NullableSchema<StringSchema<undefined>, string>, "default"> = {
			kind: "schema",
			type: "nullable",
			reference: nullable,
			expects: "(string | null)",
			wrapped: { ...string(), _run: expect.any(Function) },
			async: false,
			_run: expect.any(Function),
		};

		test("with never default", () => {
			expect(nullable(string())).toStrictEqual(baseSchema);
		});

		test("with null default", () => {
			expect(nullable(string(), null)).toStrictEqual({
				...baseSchema,
				default: null,
			} satisfies NullableSchema<StringSchema<undefined>, null>);
		});

		test("with null getter default", () => {
			const getter = () => null;
			expect(nullable(string(), getter)).toStrictEqual({
				...baseSchema,
				default: getter,
			} satisfies NullableSchema<StringSchema<undefined>, typeof getter>);
		});

		test("with value default", () => {
			expect(nullable(string(), "foo")).toStrictEqual({
				...baseSchema,
				default: "foo",
			} satisfies NullableSchema<StringSchema<undefined>, "foo">);
		});

		test("with value getter default", () => {
			const getter = () => "foo";
			expect(nullable(string(), getter)).toStrictEqual({
				...baseSchema,
				default: getter,
			} satisfies NullableSchema<StringSchema<undefined>, typeof getter>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = nullable(string());

		test("for wrapper type", () => {
			expectNoSchemaIssue(schema, ["", "foo", "#$%"]);
		});

		test("for null", () => {
			expectNoSchemaIssue(schema, [null]);
		});
	});

	describe("should return dataset without default", () => {
		const schema = nullable(string(), "foo");

		test("for wrapper type", () => {
			expectNoSchemaIssue(schema, ["", "bar", "#$%"]);
		});
	});

	describe("should return dataset with default", () => {
		const schema1 = nullable(string(), null);
		const schema2 = nullable(string(), "foo");
		const schema3 = nullable(string(), () => null);
		const schema4 = nullable(string(), () => "foo");

		test("for null", () => {
			expect(schema1._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: true,
				value: null,
			});
			expect(schema2._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: true,
				value: "foo",
			});
			expect(schema3._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: true,
				value: null,
			});
			expect(schema4._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: true,
				value: "foo",
			});
		});
	});
});
