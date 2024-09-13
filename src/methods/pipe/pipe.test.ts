import { describe, expect, test } from "@rbxts/jest-globals";
import {
	type DecimalIssue,
	type MinLengthIssue,
	decimal,
	description,
	minLength,
	minValue,
	transform,
	trim,
} from "../../actions";
import { DECIMAL_REGEX } from "../../regex";
import { string } from "../../schemas";
import { pipe } from "./pipe";

describe("pipe", () => {
	const schema = pipe(string(), description("text"), trim(), minLength(1), decimal());

	test("should return schema object", () => {
		expect(schema).toStrictEqual({
			kind: "schema",
			type: "string",
			reference: string,
			expects: "string",
			message: undefined,
			pipe: [
				{ ...string(), _run: expect.any(Function) },
				{ ...description("text") },
				{ ...trim(), _run: expect.any(Function) },
				{ ...minLength(1), _run: expect.any(Function) },
				{ ...decimal(), _run: expect.any(Function) },
			],
			async: false,
			_run: expect.any(Function),
		} satisfies typeof schema);
	});

	test("should return dataset without issues", () => {
		expect(schema._run({ typed: false, value: " 123 " }, {})).toStrictEqual({
			typed: true,
			value: "123",
		});
	});

	const baseInfo = {
		message: expect.any(String),
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

	const decimalIssue: DecimalIssue<string> = {
		...baseInfo,
		kind: "validation",
		type: "decimal",
		input: "",
		expected: null,
		received: '""',
		requirement: DECIMAL_REGEX,
	};

	test("should return dataset with issues", () => {
		expect(schema._run({ typed: false, value: "  " }, {})).toStrictEqual({
			typed: true,
			value: "",
			issues: [minLengthIssue, decimalIssue],
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

		test("if next action is schema", () => {
			expect(pipe(schema, string(), minLength(10))._run({ typed: false, value: "  " }, {})).toStrictEqual({
				typed: false,
				value: "",
				issues: [minLengthIssue, decimalIssue],
			});
		});

		test("if next action is transformation", () => {
			expect(pipe(schema, transform(parseInt), minValue(999))._run({ typed: false, value: "  " }, {})).toStrictEqual({
				typed: false,
				value: "",
				issues: [minLengthIssue, decimalIssue],
			});
		});
	});
});
