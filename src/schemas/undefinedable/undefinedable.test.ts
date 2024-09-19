import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue } from "../../tests";
import { string_ } from "../string";
import { undefinedable } from "./undefinedable";

describe("undefinedable", () => {
	describe("should return dataset without issues", () => {
		const schema = undefinedable(string_());

		test("for wrapper type", () => {
			expectNoSchemaIssue(schema, ["", "foo", "#$%"]);
		});

		test("for undefined", () => {
			expectNoSchemaIssue(schema, [undefined]);
		});
	});

	describe("should return dataset without default", () => {
		const schema = undefinedable(string_(), "foo");

		test("for wrapper type", () => {
			expectNoSchemaIssue(schema, ["", "bar", "#$%"]);
		});
	});

	describe("should return dataset with default", () => {
		const schema1 = undefinedable(string_(), undefined);
		const schema2 = undefinedable(string_(), "foo");
		const schema3 = undefinedable(string_(), () => undefined);
		const schema4 = undefinedable(string_(), () => "foo");

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
