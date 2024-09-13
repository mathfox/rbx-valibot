import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssueAsync } from "../../vitest/index.ts";
import { type StringSchema, string } from "../string/index.ts";
import { type UndefinedableSchemaAsync, undefinedableAsync } from "./undefinedableAsync.ts";

describe("undefinedableAsync", () => {
	describe("should return schema object", () => {
		const baseSchema: Omit<UndefinedableSchemaAsync<StringSchema<undefined>, string>, "default"> = {
			kind: "schema",
			type: "undefinedable",
			reference: undefinedableAsync,
			expects: "(string | undefined)",
			wrapped: { ...string(), _run: expect.any(Function) },
			async: true,
			_run: expect.any(Function),
		};

		test("with never default", () => {
			expect(undefinedableAsync(string())).toStrictEqual(baseSchema);
		});

		test("with undefined default", () => {
			expect(undefinedableAsync(string(), undefined)).toStrictEqual({
				...baseSchema,
				default: undefined,
			} satisfies UndefinedableSchemaAsync<StringSchema<undefined>, undefined>);
		});

		test("with undefined getter default", () => {
			const getter = () => undefined;
			expect(undefinedableAsync(string(), getter)).toStrictEqual({
				...baseSchema,
				default: getter,
			} satisfies UndefinedableSchemaAsync<StringSchema<undefined>, typeof getter>);
		});

		test("with async undefined getter default", () => {
			const getter = async () => undefined;
			expect(undefinedableAsync(string(), getter)).toStrictEqual({
				...baseSchema,
				default: getter,
			} satisfies UndefinedableSchemaAsync<StringSchema<undefined>, typeof getter>);
		});

		test("with value default", () => {
			expect(undefinedableAsync(string(), "foo")).toStrictEqual({
				...baseSchema,
				default: "foo",
			} satisfies UndefinedableSchemaAsync<StringSchema<undefined>, "foo">);
		});

		test("with value getter default", () => {
			const getter = () => "foo";
			expect(undefinedableAsync(string(), getter)).toStrictEqual({
				...baseSchema,
				default: getter,
			} satisfies UndefinedableSchemaAsync<StringSchema<undefined>, typeof getter>);
		});

		test("with async value getter default", () => {
			const getter = async () => "foo";
			expect(undefinedableAsync(string(), getter)).toStrictEqual({
				...baseSchema,
				default: getter,
			} satisfies UndefinedableSchemaAsync<StringSchema<undefined>, typeof getter>);
		});
	});

	describe("should return dataset without issues", () => {
		const schema = undefinedableAsync(string());

		test("for wrapper type", async () => {
			await expectNoSchemaIssueAsync(schema, ["", "foo", "#$%"]);
		});

		test("for undefined", async () => {
			await expectNoSchemaIssueAsync(schema, [undefined]);
		});
	});

	describe("should return dataset without default", () => {
		const schema = undefinedableAsync(string(), "foo");

		test("for wrapper type", async () => {
			await expectNoSchemaIssueAsync(schema, ["", "bar", "#$%"]);
		});
	});

	describe("should return dataset with default", () => {
		const schema1 = undefinedableAsync(string(), undefined);
		const schema2 = undefinedableAsync(string(), "foo");
		const schema3 = undefinedableAsync(string(), () => undefined);
		const schema4 = undefinedableAsync(string(), () => "foo");
		const schema5 = undefinedableAsync(string(), async () => undefined);
		const schema6 = undefinedableAsync(string(), async () => "foo");

		test("for undefined", async () => {
			expect(await schema1._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: true,
				value: undefined,
			});
			expect(await schema2._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: true,
				value: "foo",
			});
			expect(await schema3._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: true,
				value: undefined,
			});
			expect(await schema4._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: true,
				value: "foo",
			});
			expect(await schema5._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: true,
				value: undefined,
			});
			expect(await schema6._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: true,
				value: "foo",
			});
		});
	});
});
