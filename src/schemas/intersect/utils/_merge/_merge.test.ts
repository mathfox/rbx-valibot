import { describe, expect, test } from "@rbxts/jest-globals";
import { _merge } from "./_merge";

describe("_merge", () => {
	describe("should return dataset with value", () => {
		test("for valid primitives", () => {
			expect(_merge(1, 1)).toEqual({ value: 1 });
			expect(_merge("foo", "foo")).toEqual({ value: "foo" });
		});

		test("for valid objects", () => {
			expect(_merge({ key: 1 }, { key: 1 })).toEqual({
				value: { key: 1 },
			});
			expect(_merge({ a: 1 }, { b: 2 })).toEqual({
				value: { a: 1, b: 2 },
			});
			expect(_merge({ key: { a: 1 } }, { key: { b: 2 } })).toEqual({
				value: { key: { a: 1, b: 2 } },
			});
		});

		test("for valid arrays", () => {
			expect(_merge([1, 2, 3], [1, 2, 3])).toEqual({ value: [1, 2, 3] });
			expect(_merge([{ a: 1 }, { a: 1 }], [{ b: 2 }, { b: 2 }])).toEqual({
				value: [
					{ a: 1, b: 2 },
					{ a: 1, b: 2 },
				],
			});
		});
	});

	describe("should return dataset with issue", () => {
		test("for invalid primitives", () => {
			expect(_merge(1, 2)).toEqual({ issue: true });
			expect(_merge("foo", "bar")).toEqual({ issue: true });
			expect(_merge(1, "foo")).toEqual({ issue: true });
		});

		test("for invalid objects", () => {
			expect(_merge({ key: 1 }, { key: "1" })).toEqual({ issue: true });
		});

		test("for invalid arrays", () => {
			expect(_merge([1], [1, 2])).toEqual({ issue: true });
			expect(_merge([1], ["1"])).toEqual({ issue: true });
		});
	});
});
