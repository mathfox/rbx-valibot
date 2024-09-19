import { describe, expect, test } from "@rbxts/jest-globals";
import { transform } from "../../actions";
import { number, object, string_ } from "../../schemas";
import { fallback, fallbackAsync } from "../fallback";
import { pipe } from "../pipe";
import { getFallback } from "./getFallback";

describe("getFallback", () => {
	test("should return undefined", () => {
		expect(getFallback(string_())).toBeUndefined();
		expect(getFallback(number())).toBeUndefined();
		expect(getFallback(object({}))).toBeUndefined();
	});

	describe("should return fallback fallback", () => {
		const schema = pipe(
			string_(),
			transform((value) => tonumber(value)!),
		);

		test("for direct value", () => {
			expect(getFallback(fallback(schema, 123))).toBe(123);
			expect(getFallback(fallbackAsync(schema, 123))).toBe(123);
		});

		test("for value getter", () => {
			expect(getFallback(fallback(schema, () => 123))).toBe(123);
			expect(getFallback(fallbackAsync(schema, () => 123))).toBe(123);
		});

		test("for asycn value getter", async () => {
			expect(await getFallback(fallbackAsync(schema, async () => 123))).toBe(123);
		});
	});
});
