import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssueAsync } from "../../tests";
import { string_ } from "../string";
import { optionalAsync } from "./optionalAsync";

describe("optionalAsync", () => {
	describe("should return dataset without issues", () => {
		const schema = optionalAsync(string_());

		test("for wrapper type", async () => {
			await expectNoSchemaIssueAsync(schema, ["", "foo", "#$%"]);
		});

		test("for undefined", async () => {
			await expectNoSchemaIssueAsync(schema, [undefined]);
		});
	});

	describe("should return dataset without default", () => {
		const schema = optionalAsync(string_(), "foo");

		test("for wrapper type", async () => {
			await expectNoSchemaIssueAsync(schema, ["", "bar", "#$%"]);
		});
	});

	describe("should return dataset with default", () => {
		const schema1 = optionalAsync(string_(), undefined);
		const schema2 = optionalAsync(string_(), "foo");
		const schema3 = optionalAsync(string_(), () => undefined);
		const schema4 = optionalAsync(string_(), () => "foo");
		const schema5 = optionalAsync(string_(), async () => undefined);
		const schema6 = optionalAsync(string_(), async () => "foo");

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
