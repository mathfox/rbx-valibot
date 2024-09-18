import { describe, expect, test } from "@rbxts/jest-globals";
import { transform } from "../../actions";
import { boolean, number, union } from "../../schemas";
import { pipe } from "../pipe";
import { type SchemaWithFallback, fallback } from "./fallback";

describe("fallback", () => {
	describe("should return schema object", () => {
		const schema = pipe(
			number(),
			transform((value) => tostring(value)),
		);
		type Schema = typeof schema;
		const baseSchema: Omit<SchemaWithFallback<Schema, never>, "fallback"> = {
			...schema,
			_run: expect.any("function"),
		};

		test("with value fallback", () => {
			expect(fallback(schema, "123")).toStrictEqual({
				...baseSchema,
				fallback: "123",
			} satisfies SchemaWithFallback<Schema, "123">);
		});

		test("with function fallback", () => {
			const fallbackArg = () => "123";
			expect(fallback(schema, fallbackArg)).toStrictEqual({
				...baseSchema,
				fallback: fallbackArg,
			} satisfies SchemaWithFallback<Schema, typeof fallbackArg>);
		});
	});

	const schema = fallback(
		pipe(
			union([number(), boolean()]),
			transform((value) => tostring(value)),
		),
		"123",
	);

	describe("should return default dataset", () => {
		test("for valid input", () => {
			expect(schema._run({ typed: false, value: 789 }, {})).toStrictEqual({
				typed: true,
				value: "789",
			});
		});
	});

	describe("should return dataset with fallback", () => {
		test("for invalid input", () => {
			expect(schema._run({ typed: false, value: "foo" }, {})).toStrictEqual({
				typed: true,
				value: "123",
			});
		});
	});
});
