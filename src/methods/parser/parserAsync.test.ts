import { describe, expect, test } from "@rbxts/jest-globals";
import { transform } from "../../actions";
import { number, objectAsync, string_ } from "../../schemas";
import type { Config, InferIssue } from "../../types";
import { pipe } from "../pipe";
import { parserAsync } from "./parserAsync";

describe("parserAsync", () => {
	const entries = {
		key: pipe(
			string_(),
			transform((input) => input.size()),
		),
	};

	describe("should return function object", () => {
		const schema = objectAsync(entries);

		test("without config", () => {
			const func1 = parserAsync(schema);
			expect(func1).toBeInstanceOf("table");
			expect(func1.schema).toBe(schema);
			expect(func1.config).toBeUndefined();
			const func2 = parserAsync(schema, undefined);
			expect(func2).toBeInstanceOf("table");
			expect(func2.schema).toBe(schema);
			expect(func2.config).toBeUndefined();
		});

		test("with config", () => {
			const config: Config<InferIssue<typeof schema>> = {
				abortEarly: true,
			};
			const func = parserAsync(schema, config);
			expect(func).toBeInstanceOf("table");
			expect(func.schema).toBe(schema);
			expect(func.config).toBe(config);
		});
	});

	test("should return output for valid input", async () => {
		expect(await parserAsync(string_())("hello")).toBe("hello");
		expect(await parserAsync(number())(123)).toBe(123);
		expect(await parserAsync(objectAsync(entries))({ key: "foo" })).toEqual({
			key: 3,
		});
	});

	test("should throw error for invalid input", async () => {
		await expect(() => parserAsync(string_())(123)).rejects.toThrowError();
		await expect(() => parserAsync(number())("foo")).rejects.toThrowError();
		await expect(() => parserAsync(objectAsync(entries))(undefined)).rejects.toThrowError();
	});
});
