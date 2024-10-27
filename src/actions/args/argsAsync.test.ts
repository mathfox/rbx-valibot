import { describe, expect, test } from "@rbxts/jest-globals";
import { boolean, number, string_, tupleWithRestAsync } from "../../schemas";

import { argsAsync } from "./argsAsync";

describe("argsAsync", () => {
	const schema = tupleWithRestAsync([string_(), number()], boolean());
	const action = argsAsync(schema);

	const func = async () => 123;
	const dataset = action._run({ typed: true, value: func }, {});

	test("should return new function", () => {
		expect(dataset).toStrictEqual({
			typed: true,
			value: expect.any("function"),
		});
		expect(dataset.value).never.toBe(func);
	});

	test("should not throw error for valid args", async () => {
		if (dataset.typed) {
			await expect(dataset.value("foo", 123)).resolves.never.toThrowError();
			await expect(dataset.value("foo", 123, true)).resolves.never.toThrowError();
			await expect(dataset.value("foo", 123, true, false)).resolves.never.toThrowError();
			await expect(dataset.value("foo", 123, true, false, true)).resolves.never.toThrowError();
		}
	});

	test("should throw error for invalid args", async () => {
		if (dataset.typed) {
			expect((dataset as { value: (...args: any[]) => Promise<unknown> }).value().awaitStatus()[0] === "Rejected").toBe(
				true,
			);
			expect(
				(dataset as { value: (...args: any[]) => Promise<unknown> }).value("foo").awaitStatus()[0] === "Rejected",
			).toBe(true);
			expect(
				(dataset as { value: (...args: any[]) => Promise<unknown> }).value(undefined, 123).awaitStatus()[0] ===
					"Rejected",
			).toBe(true);
			expect(
				(dataset as { value: (...args: any[]) => Promise<unknown> }).value("foo", undefined).awaitStatus()[0] ===
					"Rejected",
			).toBe(true);
			expect(
				(dataset as { value: (...args: any[]) => Promise<unknown> }).value(123, "foo").awaitStatus()[0] === "Rejected",
			).toBe(true);
		}
	});
});
