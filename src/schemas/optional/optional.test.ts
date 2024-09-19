import { describe, expect, test } from "@rbxts/jest-globals";
import { expectNoSchemaIssue } from "../../tests";
import { string } from "../string";
import { optional } from "./optional";

describe("optional", () => {
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
			expect(schema1._run({ typed: false, value: undefined }, {})).toEqual({
				typed: true,
				value: undefined,
			});
			expect(schema2._run({ typed: false, value: undefined }, {})).toEqual({
				typed: true,
				value: "foo",
			});
			expect(schema3._run({ typed: false, value: undefined }, {})).toEqual({
				typed: true,
				value: undefined,
			});
			expect(schema4._run({ typed: false, value: undefined }, {})).toEqual({
				typed: true,
				value: "foo",
			});
		});
	});
});
