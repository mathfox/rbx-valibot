import { describe, expect, test } from "@rbxts/jest-globals";
import { type TransformActionAsync, transformAsync } from "./transformAsync";

describe("transformAsync", () => {
	test("should return action object", () => {
		const operation = async (input: string) => input.size();
		const action = transformAsync(operation);
		expect(action).toStrictEqual({
			kind: "transformation",
			type: "transform",
			reference: transformAsync,
			async: true,
			operation,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		} satisfies TransformActionAsync<string, number>);
	});

	describe("should transform input", () => {
		test("to length of string", async () => {
			const action = transformAsync(async (input: string) => input.size());
			expect(await action._run({ typed: true, value: "123456" }, {})).toStrictEqual({
				typed: true,
				value: 6,
			});
		});

		test("to object with new key", async () => {
			const action = transformAsync(async (input: { key1: string }) => ({
				...input,
				key2: 123,
			}));
			expect(await action._run({ typed: true, value: { key1: "foo" } }, {})).toStrictEqual({
				typed: true,
				value: { key1: "foo", key2: 123 },
			});
		});
	});
});
