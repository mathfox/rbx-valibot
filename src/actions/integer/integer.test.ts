import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type IntegerIssue, integer } from "./integer";

describe("integer", () => {
	describe("should return dataset without issues", () => {
		const action = integer();

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for integer numbers", () => {
			expectNoActionIssue(action, [0, 123456789, -123456789, 9007199254740991, -9007199254740991]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = integer("message");
		const baseIssue: Omit<IntegerIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "integer",
			expected: undefined,
			message: "message",
			requirement: expect.any("function"),
		};

		test("for floating point numbers", () => {
			expectActionIssue(action, baseIssue, [0.1, 12.34, -1 / 3, math.pi]);
		});

		test("for infinite numbers", () => {
			expectActionIssue(action, baseIssue, [math.huge, -math.huge]);
		});

		test("for not a number", () => {
			expectActionIssue(action, baseIssue, [0 / 0]);
		});
	});
});
