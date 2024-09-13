import { describe, expect, test } from "@rbxts/jest-globals";
import type { StringIssue } from "../../schemas";
import { ValiError } from "../../utils";
import { isValiError } from "./isValiError";

describe("isValiError", () => {
	test("should return true if ValiError", () => {
		expect(
			isValiError(
				new ValiError([
					{
						kind: "schema",
						type: "string",
						input: null,
						expected: "string",
						received: "null",
						message: "Invalid type: Expected string but received null",
					} satisfies StringIssue,
				]),
			),
		).toBe(true);
	});

	//test("should return false if other error", () => {
	//	expect(isValiError(new Error())).toBe(false);
	//	expect(isValiError(new TypeError())).toBe(false);
	//	expect(isValiError(new RangeError())).toBe(false);
	//});
});
