//import { describe, expect, test } from "@rbxts/jest-globals";
//import { arrayAsync, string } from "../../schemas";
//import { entriesFromList } from "./entriesFromList";
//
//describe("entriesFromList", () => {
//	describe("should return object entries", () => {
//		const symbol = Symbol();
//
//		test("for sync schemas", () => {
//			const schema = string();
//			expect(entriesFromList(["foo", 123, symbol], schema)).toEqual({
//				foo: schema,
//				[123]: schema,
//				[symbol]: schema,
//			});
//		});
//
//		test("for async schemas", () => {
//			const schema = arrayAsync(string());
//			expect(entriesFromList(["foo", 123, symbol], schema)).toEqual({
//				foo: schema,
//				[123]: schema,
//				[symbol]: schema,
//			});
//		});
//	});
//});
