import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssue, expectNoActionIssue } from "../../tests";
import { rawCheck } from "./rawCheck";
import type { RawCheckIssue } from "./types";

describe("rawCheck", () => {
	const action = rawCheck<number>(({ dataset, addIssue }) => {
		if (dataset.typed && dataset.value <= 0) {
			addIssue({ message: "message" });
		}
	});

	describe("should return dataset without issues", () => {
		test("for untyped inputs", () => {
			expect(action._run({ typed: false, value: undefined }, {})).toStrictEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid inputs", () => {
			expectNoActionIssue(action, [1, 12345, math.huge]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseIssue: Omit<RawCheckIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "raw_check",
			expected: undefined,
			message: "message",
		};

		test("for invalid inputs", () => {
			expectActionIssue(action, baseIssue, [0, -1, -12345, -math.huge]);
		});
	});
});
