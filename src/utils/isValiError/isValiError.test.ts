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
						input: undefined,
						expected: "string",
						received: "nil",
						message: "Invalid type: Expected string but received undefined",
					} satisfies StringIssue,
				]),
			),
		).toBe(true);
	});

	test("should return false if other error", () => {
		expect(isValiError({})).toBe(false);
	});
});
