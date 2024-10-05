import { describe, expect, test } from "@rbxts/jest-globals";
import { minLength, transform } from "../../actions";
import { object, string_ } from "../../schemas";
import { pipe } from "../pipe";
import { safeParse } from "./safeParse";

describe("safeParse", () => {
	test("should return successful output", () => {
		expect(
			safeParse(
				object({
					key: pipe(
						string_(),
						minLength(5),
						transform((input) => input.size()),
					),
				}),
				{ key: "foobar" },
			),
		).toEqual({
			typed: true,
			success: true,
			output: { key: 6 },
			issues: undefined,
		});
	});

	test("should return typed output with issues", () => {
		expect(safeParse(object({ key: pipe(string_(), minLength(5)) }), { key: "foo" })).toEqual({
			typed: true,
			success: false,
			output: { key: "foo" },
			issues: [
				{
					kind: "validation",
					type: "min_length",
					input: "foo",
					expected: ">=5",
					received: "3",
					message: "Invalid length: Expected >=5 but received 3",
					requirement: 5,
					issues: undefined,
					lang: undefined,
					abortEarly: undefined,
					abortPipeEarly: undefined,
				},
			],
		});
	});

	test("should return untyped output with issues", () => {
		expect(safeParse(object({ key: string_() }), { key: 123 })).toEqual({
			typed: false,
			success: false,
			output: { key: 123 },
			issues: [
				{
					kind: "schema",
					type: "string",
					input: 123,
					expected: "string",
					received: "123",
					message: "Invalid type: Expected string but received 123",
					requirement: undefined,
					issues: undefined,
					lang: undefined,
					abortEarly: undefined,
					abortPipeEarly: undefined,
				},
			],
		});
	});
});
