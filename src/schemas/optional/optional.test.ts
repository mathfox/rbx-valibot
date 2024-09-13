import { describe, expect, test } from "vitest";
import { expectNoSchemaIssue } from "../../vitest/index.ts";
import { type StringSchema, string } from "../string/index.ts";
import { type OptionalSchema, optional } from "./optional.ts";

describe("optional", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<OptionalSchema<StringSchema<undefined>, string>, "default"> = {
			kind: "schema",
			type: "optional",
			reference: optional,
			expects: "(string | undefined)",
			wrapped: { ...string(), _run: expect.any(Function) },
			async: false,
			_run: expect.any(Function),
		};

		test("with never default", () => {
			expect(optional(string())).toStrictEqual(baseSchema);
		});

		test("with undefined default", () => {
			expect(optional(string(), undefined)).toStrictEqual({
				...baseSchema,
				default: undefined,
			} satisfies OptionalSchema<StringSchema<undefined>, undefined>);
		});

		test("with undefined getter default", () => {
			const getter = () => undefined;
			expect(optional(string(), getter)).toStrictEqual({
				...baseSchema,
				default: getter,
			} satisfies OptionalSchema<StringSchema<undefined>, typeof getter>);
		});

		test("with value default", () => {
			expect(optional(string(), "foo")).toStrictEqual({
				...baseSchema,
				default: "foo",
			} satisfies OptionalSchema<StringSchema<undefined>, "foo">);
		});

		test("with value getter default", () => {
			const getter = () => "foo";
			expect(optional(string(), getter)).toStrictEqual({
				...baseSchema,
				default: getter,
			} satisfies OptionalSchema<StringSchema<undefined>, typeof getter>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = optional(string());

		test("for wrapper type", () => {
			expectNoSchemaIssue(schema, ["", "foo", "#$%"]);
		});

		test("for undefined", () => {
			expectNoSchemaIssue(schema, [undefined]);
		});
	});

	describe("should return dataset without default", () => {
		const schema = optional(string(), "foo");

		test("for wrapper type", () => {
			expectNoSchemaIssue(schema, ["", "bar", "#$%"]);
		});
	});

	describe("should return dataset with default", () => {
		const schema1 = optional(string(), undefined);
		const schema2 = optional(string(), "foo");
		const schema3 = optional(string(), () => undefined);
		const schema4 = optional(string(), () => "foo");

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
