import { describe, expect, test } from "@rbxts/jest-globals";
import { pipeAsync } from "../../methods";
import { number } from "../../schemas";
import { minValue } from "../minValue";
import { returnsAsync } from "./returnsAsync";

describe("returnsAsync", () => {
	const schema = pipeAsync(number(), minValue(0));
	const action = returnsAsync(schema);

	const func = async (arg1: unknown) => arg1;
	const dataset = action._run({ typed: true, value: func }, {});

	test("should return new function", () => {
		expect(dataset).toStrictEqual({
			typed: true,
			value: expect.any("function"),
		});
		expect(dataset.value).never.toBe(func);
	});

	test("should not throw error for valid returnsAsync", async () => {
		if (dataset.typed) {
			await expect(dataset.value(123)).resolves.never.toThrowError();
			expect(await dataset.value(123)).toBe(123);
		}
	});

	test("should throw error for invalid returnsAsync", async () => {
		if (dataset.typed) {
			expect(dataset.value(-123).awaitStatus()[0] === "Rejected").toBe(true);
			expect(dataset.value("123").awaitStatus()[0] === "Rejected").toBe(true);
		}
	});
});
