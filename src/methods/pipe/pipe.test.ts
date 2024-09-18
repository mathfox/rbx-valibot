import { describe, expect, test } from "@rbxts/jest-globals";
import { type MinLengthIssue, description, minLength, trim } from "../../actions";
import { string } from "../../schemas";
import { pipe } from "./pipe";

describe("pipe", () => {
	const schema = pipe(string(), description("text"), trim(), minLength(1));

	test("should return schema object", () => {
		expect(schema).toStrictEqual({
			kind: "schema",
			type: "string",
			reference: string,
			expects: "string",
			message: undefined,
			pipe: [
				{ ...string(), _run: expect.any("function") },
				{ ...description("text") },
				{ ...trim(), _run: expect.any("function") },
				{ ...minLength(1), _run: expect.any("function") },
			],
			async: false,
			_run: expect.any("function"),
		} satisfies typeof schema);
	});

	test("should return dataset without issues", () => {
		expect(schema._run({ typed: false, value: " 123 " }, {})).toStrictEqual({
			typed: true,
			value: "123",
		});
	});

	const baseInfo = {
		message: expect.any("string"),
		path: undefined,
		issues: undefined,
		lang: undefined,
		abortEarly: undefined,
		abortPipeEarly: undefined,
	};

	const minLengthIssue: MinLengthIssue<string, 1> = {
		...baseInfo,
		kind: "validation",
		type: "min_length",
		input: "",
		expected: ">=1",
		received: "0",
		requirement: 1,
	};

	test("should return dataset with issues", () => {
		expect(schema._run({ typed: false, value: "  " }, {})).toStrictEqual({
			typed: true,
			value: "",
			issues: [minLengthIssue],
		});
	});

	describe("should break pipe if necessary", () => {
		test("for abort early config", () => {
			expect(schema._run({ typed: false, value: "  " }, { abortEarly: true })).toStrictEqual({
				typed: true,
				value: "",
				issues: [{ ...minLengthIssue, abortEarly: true }],
			});
		});

		test("for abort pipe early config", () => {
			expect(schema._run({ typed: false, value: "  " }, { abortPipeEarly: true })).toStrictEqual({
				typed: true,
				value: "",
				issues: [{ ...minLengthIssue, abortPipeEarly: true }],
			});
		});
	});
});
