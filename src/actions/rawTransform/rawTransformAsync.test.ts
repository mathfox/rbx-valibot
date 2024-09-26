import { describe, expect, test } from "@rbxts/jest-globals";
import { rawTransformAsync } from "./rawTransformAsync";

describe("rawTransformAsync", () => {
	const action = rawTransformAsync<string, number>(async ({ dataset, addIssue, NEVER }) => {
		const length = dataset.value.size();
		if (length < 3) {
			addIssue({ message: "message" });
			return NEVER;
		}
		return length;
	});

	describe("should return dataset without issues", () => {
		test("for valid inputs", async () => {
			expect(await action._run({ typed: true, value: "foo" }, {})).toEqual({
				typed: true,
				value: 3,
			});
			expect(await action._run({ typed: true, value: "123456789" }, {})).toEqual({
				typed: true,
				value: 9,
			});
		});
	});

	describe("should return dataset with issues", () => {
		test("for invalid inputs", async () => {
			expect(await action._run({ typed: true, value: "fo" }, {})).toEqual({
				typed: false,
				value: "fo",
				issues: [
					{
						kind: "transformation",
						type: "raw_transform",
						expected: undefined,
						message: "message",
						input: "fo",
						received: '"fo"',
						requirement: undefined,
						path: undefined,
						issues: undefined,
						lang: undefined,
						abortEarly: undefined,
						abortPipeEarly: undefined,
					},
				],
			});
		});
	});
});
