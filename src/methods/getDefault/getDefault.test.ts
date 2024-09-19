import { describe, expect, test } from "@rbxts/jest-globals";
import { number, object, optional, optionalAsync, string_ } from "../../schemas";
import { getDefault } from "./getDefault";

describe("getDefault", () => {
	test("should return undefined", () => {
		expect(getDefault(string_())).toBeUndefined();
		expect(getDefault(number())).toBeUndefined();
		expect(getDefault(object({}))).toBeUndefined();
	});

	describe("should return optional default", () => {
		test("for undefined value", async () => {
			expect(getDefault(optional(string_()))).toBeUndefined();
			expect(getDefault(optional(string_(), undefined))).toBeUndefined();
			expect(getDefault(optional(string_(), () => undefined))).toBeUndefined();
			expect(await getDefault(optionalAsync(string_(), async () => undefined))).toBeUndefined();
		});

		test("for direct value", () => {
			expect(getDefault(optional(string_(), "foo"))).toBe("foo");
			expect(getDefault(optionalAsync(string_(), "foo"))).toBe("foo");
		});

		test("for value getter", () => {
			expect(getDefault(optional(string_(), () => "foo"))).toBe("foo");
			expect(getDefault(optionalAsync(string_(), () => "foo"))).toBe("foo");
		});

		test("for asycn value getter", async () => {
			expect(await getDefault(optionalAsync(string_(), async () => "foo"))).toBe("foo");
		});
	});
});
