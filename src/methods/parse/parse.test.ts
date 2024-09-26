import { describe, expect, test } from "@rbxts/jest-globals";
import { transform } from "../../actions";
import { number, object, string_ } from "../../schemas";
import { pipe } from "../pipe";
import { parse } from "./parse";

describe("parse", () => {
	const entries = {
		key: pipe(
			string_(),
			transform((input) => input.size()),
		),
	};

	test("should return output for valid input", () => {
		expect(parse(string_(), "hello")).toBe("hello");
		expect(parse(number(), 123)).toBe(123);
		expect(parse(object(entries), { key: "foo" })).toEqual({
			key: 3,
		});
	});

	test("should throw error for invalid input", () => {
		expect(() => parse(string_(), 123)).toThrowError();
		expect(() => parse(number(), "foo")).toThrowError();
		expect(() => parse(object(entries), undefined)).toThrowError();
	});
});
