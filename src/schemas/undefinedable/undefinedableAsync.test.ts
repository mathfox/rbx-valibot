import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssueAsync } from "../../tests";
import { string_ } from "../string";
import { undefinedableAsync } from "./undefinedableAsync";

describe("undefinedableAsync", () => {
	describe("should return dataset without issues", () => {
		const schema = undefinedableAsync(string_());

		test("for wrapper type", async () => {
			await expectNoSchemaIssueAsync(schema, ["", "foo", "#$%"]);
		});

		test("for undefined", async () => {
			await expectNoSchemaIssueAsync(schema, [undefined]);
		});
	});

	describe("should return dataset without default", () => {
		const schema = undefinedableAsync(string_(), "foo");

		test("for wrapper type", async () => {
			await expectNoSchemaIssueAsync(schema, ["", "bar", "#$%"]);
		});
	});

	describe("should return dataset with default", () => {
		const schema1 = undefinedableAsync(string_(), undefined);
		const schema2 = undefinedableAsync(string_(), "foo");
		const schema3 = undefinedableAsync(string_(), () => undefined);
		const schema4 = undefinedableAsync(string_(), () => "foo");
		const schema5 = undefinedableAsync(string_(), async () => undefined);
		const schema6 = undefinedableAsync(string_(), async () => "foo");

		test("for undefined", async () => {
			expect(await schema1._run({ typed: false, value: undefined }, {})).toEqual({
				typed: true,
				value: undefined,
			});
			expect(await schema2._run({ typed: false, value: undefined }, {})).toEqual({
				typed: true,
				value: "foo",
			});
			expect(await schema3._run({ typed: false, value: undefined }, {})).toEqual({
				typed: true,
				value: undefined,
			});
			expect(await schema4._run({ typed: false, value: undefined }, {})).toEqual({
				typed: true,
				value: "foo",
			});
			expect(await schema5._run({ typed: false, value: undefined }, {})).toEqual({
				typed: true,
				value: undefined,
			});
			expect(await schema6._run({ typed: false, value: undefined }, {})).toEqual({
				typed: true,
				value: "foo",
			});
		});
	});
});
