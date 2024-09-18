import { describe, expect, test } from "@rbxts/jest-globals";
import { type PicklistSchema, number, object, picklist, string } from "../../schemas";
import { keyof } from "./keyof";

describe("keyof", () => {
	const objectSchema = object({ foo: string(), bar: number() });
	const options = ["foo", "bar"] as const;
	type Options = typeof options;

	describe("should return objectSchema object", () => {
		const baseSchema: Omit<PicklistSchema<Options, never>, "message"> = {
			kind: "schema",
			type: "picklist",
			reference: picklist,
			expects: '("foo" | "bar")',
			options,
			async: false,
			_run: expect.any("function"),
		};

		test("with undefined message", () => {
			const picklistSchema: PicklistSchema<Options, undefined> = {
				...baseSchema,
				message: undefined,
			};
			expect(keyof(objectSchema)).toStrictEqual(picklistSchema);
			expect(keyof(objectSchema, undefined)).toStrictEqual(picklistSchema);
		});

		test("with string message", () => {
			expect(keyof(objectSchema, "message")).toStrictEqual({
				...baseSchema,
				message: "message",
			} satisfies PicklistSchema<Options, "message">);
		});

		test("with function message", () => {
			const message = () => "message";
			expect(keyof(objectSchema, message)).toStrictEqual({
				...baseSchema,
				message,
			} satisfies PicklistSchema<Options, typeof message>);
		});
	});
});
