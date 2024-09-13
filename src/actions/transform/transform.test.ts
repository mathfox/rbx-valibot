import { describe, expect, test } from "@rbxts/jest-globals";
import { type TransformAction, transform } from "./transform";

describe("transform", () => {
	test("should return action object", () => {
		const operation = (input: string) => input.size();
		const action = transform(operation);
		expect(action).toStrictEqual({
			kind: "transformation",
			type: "transform",
			reference: transform,
			async: false,
			operation,
			//_run: expect.any(Function),
			_run: expect.any(() => {}),
		} satisfies TransformAction<string, number>);
	});

	describe("should transform input", () => {
		test("to length of string", () => {
			const action = transform((input: string) => input.size());
			expect(action._run({ typed: true, value: "123456" }, {})).toStrictEqual({
				typed: true,
				value: 6,
			});
		});

		test("to object with new key", () => {
			const action = transform((input: { key1: string }) => ({
				...input,
				key2: 123,
			}));
			expect(action._run({ typed: true, value: { key1: "foo" } }, {})).toStrictEqual({
				typed: true,
				value: { key1: "foo", key2: 123 },
			});
		});
	});
});
