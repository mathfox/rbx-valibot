import { describe, expect, test } from "@rbxts/jest-globals";
import { number } from "../../schemas";
import { returns } from "./returns";

describe("returns", () => {
	const schema = number();
	const action = returns(schema);
	const func = (arg1: unknown) => arg1;
	const dataset = action._run({ typed: true, value: func }, {});

	test("should return new function", () => {
		expect(dataset).toStrictEqual({
			typed: true,
			value: expect.any("function"),
		});
		expect(dataset.value).never.toBe(func);
	});

	test("should not throw error for valid returns", () => {
		if (dataset.typed) {
			expect(() => dataset.value(123)).never.toThrowError();
			expect(dataset.value(123)).toBe(123);
		}
	});

	test("should throw error for invalid returns", () => {
		if (dataset.typed) {
			expect(() => dataset.value("123")).toThrowError();
		}
	});
});
