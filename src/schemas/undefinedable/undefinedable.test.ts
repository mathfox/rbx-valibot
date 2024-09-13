import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue } from "../../vitest/index.ts";
import { type StringSchema, string } from "../string/index.ts";
import { type UndefinedableSchema, undefinedable } from "./undefinedable.ts";

describe("undefinedable", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<UndefinedableSchema<StringSchema<undefined>, string>, "default"> = {
			kind: "schema",
			type: "undefinedable",
			reference: undefinedable,
			expects: "(string | undefined)",
			wrapped: { ...string(), _run: expect.any(Function) },
			async: false,
			_run: expect.any(Function),
		};

		test("with never default", () => {
			expect(undefinedable(string())).toStrictEqual(baseSchema);
		});

		test("with undefined default", () => {
			expect(undefinedable(string(), undefined)).toStrictEqual({
				...baseSchema,
				default: undefined,
			} satisfies UndefinedableSchema<StringSchema<undefined>, undefined>);
		});

		test("with undefined getter default", () => {
			const getter = () => undefined;
			expect(undefinedable(string(), getter)).toStrictEqual({
				...baseSchema,
				default: getter,
			} satisfies UndefinedableSchema<StringSchema<undefined>, typeof getter>);
		});

		test("with value default", () => {
			expect(undefinedable(string(), "foo")).toStrictEqual({
				...baseSchema,
				default: "foo",
			} satisfies UndefinedableSchema<StringSchema<undefined>, "foo">);
		});

		test("with value getter default", () => {
			const getter = () => "foo";
			expect(undefinedable(string(), getter)).toStrictEqual({
				...baseSchema,
				default: getter,
			} satisfies UndefinedableSchema<StringSchema<undefined>, typeof getter>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = undefinedable(string());

		test("for wrapper type", () => {
			expectNoSchemaIssue(schema, ["", "foo", "#$%"]);
		});

		test("for undefined", () => {
			expectNoSchemaIssue(schema, [undefined]);
		});
	});

	describe("should return dataset without default", () => {
		const schema = undefinedable(string(), "foo");

		test("for wrapper type", () => {
			expectNoSchemaIssue(schema, ["", "bar", "#$%"]);
		});
	});

	describe("should return dataset with default", () => {
		const schema1 = undefinedable(string(), undefined);
		const schema2 = undefinedable(string(), "foo");
		const schema3 = undefinedable(string(), () => undefined);
		const schema4 = undefinedable(string(), () => "foo");

		test("for undefined", () => {
			expect(schema1._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: true,
				value: undefined,
			});
			expect(schema2._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: true,
				value: "foo",
			});
			expect(schema3._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: true,
				value: undefined,
			});
			expect(schema4._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: true,
				value: "foo",
			});
		});
	});
});
