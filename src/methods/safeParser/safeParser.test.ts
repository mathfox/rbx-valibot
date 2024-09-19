import { describe, expect, test } from "@rbxts/jest-globals";
import { minLength, transform } from "../../actions";
import { object, string_ } from "../../schemas";
import type { Config, InferIssue } from "../../types";
import { pipe } from "../pipe";
import { safeParser } from "./safeParser";

describe("safeParser", () => {
	describe("should return function object", () => {
		const schema = object({
			key: pipe(
				string_(),
				transform((input) => input.size()),
			),
		});

		test("without config", () => {
			const func1 = safeParser(schema);
			expect(func1).toBeInstanceOf("table");
			expect(func1.schema).toBe(schema);
			expect(func1.config).toBeUndefined();
			const func2 = safeParser(schema, undefined);
			expect(func2).toBeInstanceOf("table");
			expect(func2.schema).toBe(schema);
			expect(func2.config).toBeUndefined();
		});

		test("with config", () => {
			const config: Config<InferIssue<typeof schema>> = {
				abortEarly: true,
			};
			const func = safeParser(schema, config);
			expect(func).toBeInstanceOf("table");
			expect(func.schema).toBe(schema);
			expect(func.config).toBe(config);
		});
	});

	test("should return successful output", () => {
		expect(
			safeParser(
				object({
					key: pipe(
						string_(),
						minLength(5),
						transform((input) => input.size()),
					),
				}),
			)({ key: "foobar" }),
		).toEqual({
			typed: true,
			success: true,
			output: { key: 6 },
			issues: undefined,
		});
	});

	test("should return typed output with issues", () => {
		expect(safeParser(object({ key: pipe(string_(), minLength(5)) }))({ key: "foo" })).toEqual({
			typed: true,
			success: false,
			output: { key: "foo" },
			issues: [
				{
					kind: "validation",
					type: "min_length",
					input: "foo",
					expected: ">=5",
					received: "3",
					message: "Invalid length: Expected >=5 but received 3",
					requirement: 5,
					path: [
						{
							type: "object",
							origin: "value",
							input: { key: "foo" },
							key: "key",
							value: "foo",
						},
					],
					issues: undefined,
					lang: undefined,
					abortEarly: undefined,
					abortPipeEarly: undefined,
				},
			],
		});
	});

	test("should return untyped output with issues", () => {
		expect(safeParser(object({ key: string_() }))({ key: 123 })).toEqual({
			typed: false,
			success: false,
			output: { key: 123 },
			issues: [
				{
					kind: "schema",
					type: "string",
					input: 123,
					expected: "string",
					received: "123",
					message: "Invalid type: Expected string but received 123",
					requirement: undefined,
					path: [
						{
							type: "object",
							origin: "value",
							input: { key: 123 },
							key: "key",
							value: 123,
						},
					],
					issues: undefined,
					lang: undefined,
					abortEarly: undefined,
					abortPipeEarly: undefined,
				},
			],
		});
	});
});
