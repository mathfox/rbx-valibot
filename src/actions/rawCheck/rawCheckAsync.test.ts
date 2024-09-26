import { describe, expect, test } from "@rbxts/jest-globals";
import { expectActionIssueAsync, expectNoActionIssueAsync } from "../../tests";
import { rawCheckAsync } from "./rawCheckAsync";
import type { RawCheckIssue } from "./types";

describe("rawCheckAsync", () => {
	const action = rawCheckAsync<number>(async ({ dataset, addIssue }) => {
		if (dataset.typed && dataset.value <= 0) {
			addIssue({ message: "message" });
		}
	});

	describe("should return dataset without issues", () => {
		test("for untyped inputs", async () => {
			expect(await action._run({ typed: false, value: undefined }, {})).toEqual({
				typed: false,
				value: undefined,
			});
		});

		test("for valid inputs", async () => {
			await expectNoActionIssueAsync(action, [1, 12345, math.huge]);
		});
	});

	describe("should return dataset with issues", () => {
		const baseIssue: Omit<RawCheckIssue<number>, "input" | "received"> = {
			kind: "validation",
			type: "raw_check",
			expected: undefined,
			message: "message",
		};

		test("for invalid inputs", async () => {
			await expectActionIssueAsync(action, baseIssue, [0, -1, -12345, -math.huge]);
		});
	});
});
