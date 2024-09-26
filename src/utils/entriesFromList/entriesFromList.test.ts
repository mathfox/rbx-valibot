import { describe, expect, test } from "@rbxts/jest-globals";
import { arrayAsync, string_ } from "../../schemas";
import { entriesFromList } from "./entriesFromList";

describe("entriesFromList", () => {
	describe("should return object entries", () => {
		test("for sync schemas", () => {
			const schema = string_();
			expect(entriesFromList(["foo", 123, 3], schema)).toEqual({
				foo: schema,
				[123]: schema,
				[3]: schema,
			});
		});

		test("for async schemas", () => {
			const schema = arrayAsync(string_());
			expect(entriesFromList(["foo", 123, 3], schema)).toEqual({
				foo: schema,
				[123]: schema,
				[3]: schema,
			});
		});
	});
});
