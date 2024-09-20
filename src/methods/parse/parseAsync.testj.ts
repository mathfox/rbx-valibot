//import { describe, expect, test } from "@rbxts/jest-globals";
//import { transform } from "../../actions";
//import { number, objectAsync, string } from "../../schemas";
//import { pipe } from "../pipe";
//import { parseAsync } from "./parseAsync";
//
//describe("parseAsync", () => {
//	const entries = {
//		key: pipe(
//			string(),
//			transform((input) => input.length),
//		),
//	};
//
//	test("should return output for valid input", async () => {
//		expect(await parseAsync(string(), "hello")).toBe("hello");
//		expect(await parseAsync(number(), 123)).toBe(123);
//		expect(await parseAsync(objectAsync(entries), { key: "foo" })).toEqual({
//			key: 3,
//		});
//	});
//
//	test("should throw error for invalid input", async () => {
//		await expect(() => parseAsync(string(), 123)).rejects.toThrowError();
//		await expect(() => parseAsync(number(), "foo")).rejects.toThrowError();
//		await expect(() => parseAsync(objectAsync(entries), undefined)).rejects.toThrowError();
//	});
//});
