import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssueAsync } from "../../tests";
import { string } from "../string";
import { undefinedableAsync } from "./undefinedableAsync";

describe("undefinedableAsync", () => {
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
