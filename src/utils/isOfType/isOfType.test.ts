import { describe, expect, test } from "@rbxts/jest-globals";
import { number, object, string } from "../../schemas";
import { isOfType } from "./isOfType";

describe("isOfType", () => {
	test("should check string schema", () => {
		const schema = string();
		expect(isOfType("string", schema)).toBe(true);
		expect(isOfType("number" as any, schema)).toBe(false);
		expect(isOfType("object" as any, schema)).toBe(false);
	});

	test("should check number schema", () => {
		const schema = number();
		expect(isOfType("number", schema)).toBe(true);
		expect(isOfType("string" as any, schema)).toBe(false);
		expect(isOfType("object" as any, schema)).toBe(false);
	});

	test("should check object schema", () => {
		const schema = object({ key: string() });
		expect(isOfType("object", schema)).toBe(true);
		expect(isOfType("string" as any, schema)).toBe(false);
		expect(isOfType("number" as any, schema)).toBe(false);
	});
});
