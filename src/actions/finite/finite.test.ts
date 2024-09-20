import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { type FiniteIssue, finite } from "./finite";

describe("finite", () => {
	describe("should return dataset without issues", () => {
		const action = finite();

		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for finite numbers", () => {
			expectNoActionIssue(action, [0, 1234, 12.34, 9007199254740991, -9007199254740991]);
		});
	});

	describe("should return dataset with issues", () => {
		const action = finite("message");
		const baseIssue: Omit<FiniteIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "finite",
			expected: undefined,
			message: "message",
			requirement: expect.any("function"),
		};

		test("for infinite numbers", () => {
			expectActionIssue(action, baseIssue, [math.huge, -math.huge]);
		});

		test("for not a number", () => {
			expectActionIssue(action, baseIssue, [0 / 0]);
		});
	});
});
