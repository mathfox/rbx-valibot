import { describe, expect, test } from "@rbxts/jest-globals";
import { transform } from "../../actions";
import { number, object, string_ } from "../../schemas";
import type { Config, InferIssue } from "../../types";
import { pipe } from "../pipe";
import { parser } from "./parser";

describe("parser", () => {
	const entries = {
		key: pipe(
			string_(),
			transform((input) => input.size()),
		),
	};

	describe("should return function object", () => {
		const schema = object(entries);

		test("without config", () => {
			const func1 = parser(schema);
			expect(func1).toBeInstanceOf("table");
			expect(func1.schema).toBe(schema);
			expect(func1.config).toBeUndefined();
			const func2 = parser(schema, undefined);
			expect(func2).toBeInstanceOf("table");
			expect(func2.schema).toBe(schema);
			expect(func2.config).toBeUndefined();
		});

		test("with config", () => {
			const config: Config<InferIssue<typeof schema>> = {
				abortEarly: true,
			};
			const func = parser(schema, config);
			expect(func).toBeInstanceOf("table");
			expect(func.schema).toBe(schema);
			expect(func.config).toBe(config);
		});
	});

	test("should return output for valid input", () => {
		expect(parser(string_())("hello")).toBe("hello");
		expect(parser(number())(123)).toBe(123);
		expect(parser(object(entries))({ key: "foo" })).toEqual({
			key: 3,
		});
	});

	test("should throw error for invalid input", () => {
		expect(() => parser(string_())(123)).toThrowError();
		expect(() => parser(number())("foo")).toThrowError();
		expect(() => parser(object(entries))(undefined)).toThrowError();
	});
});
