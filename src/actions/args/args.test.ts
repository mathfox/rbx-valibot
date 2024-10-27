import { describe, expect, test } from "@rbxts/jest-globals";
import { boolean, number, string_, tupleWithRest } from "../../schemas";
import { args } from "./args";

describe("args", () => {
	const schema = tupleWithRest([string_(), number()], boolean());
	const action = args(schema);

	const func = () => 123;
	const dataset = action._run({ typed: true, value: func }, {});

	test("should return new function", () => {
		expect(dataset).toStrictEqual({
			typed: true,
			value: expect.any("function"),
		});
		expect(dataset.value).never.toBe(func);
	});

	test("should not throw error for valid args", () => {
		if (dataset.typed) {
			expect(() => dataset.value("foo", 123)).never.toThrowError();
			expect(() => dataset.value("foo", 123, true)).never.toThrowError();
			expect(() => dataset.value("foo", 123, true, false)).never.toThrowError();
			expect(() => dataset.value("foo", 123, true, false, true)).never.toThrowError();
		}
	});

	test("should throw error for invalid args", () => {
		if (dataset.typed) {
			expect(() => (dataset as { value: Callback }).value()).toThrowError();
			expect(() => (dataset as { value: Callback }).value("foo")).toThrowError();
			expect(() => (dataset as { value: Callback }).value(undefined, 123)).toThrowError();
			expect(() => (dataset as { value: Callback }).value("foo", undefined)).toThrowError();
			expect(() => (dataset as { value: Callback }).value(123, "foo")).toThrowError();
		}
	});
});
