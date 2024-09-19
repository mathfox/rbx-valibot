import { describe, expect, test } from "@rbxts/jest-globals";
import { transform } from "./transform";

describe("transform", () => {
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
