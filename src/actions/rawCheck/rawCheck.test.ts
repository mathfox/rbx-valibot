import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../vitest";
import { type RawCheckAction, rawCheck } from "./rawCheck";
import type { RawCheckIssue } from "./types";

describe("rawCheck", () => {
	const action = rawCheck<number>(({ dataset, addIssue }) => {
		if (dataset.typed && dataset.value <= 0) {
			addIssue({ message: "message" });
		}
	});

	test("should return action object", () => {
		expect(action).toStrictEqual({
			kind: "validation",
			type: "raw_check",
			reference: rawCheck,
			expects: null,
			async: false,
			_run: expect.any(Function),
		} satisfies RawCheckAction<number>);
	});

	describe("should return dataset without issues", () => {
		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: null }, {})).toStrictEqual({
				typed: false,
				value: null,
			});
		});

		test("for valid inputs", () => {
			expectNoActionIssue(action, [1, 12345, Infinity]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseIssue: Omit<RawCheckIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "raw_check",
			expected: null,
			message: "message",
		};

		test("for invalid inputs", () => {
			expectActionIssue(action, baseIssue, [0, -1, -12345, -Infinity]);
		});
	});
});
