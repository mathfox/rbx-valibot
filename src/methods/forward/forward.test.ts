import { describe, expect, test } from "vitest";
import { type CheckIssue, type MinLengthIssue, check } from "../../actions/index.ts";
import type { TypedDataset } from "../../types/index.ts";
import { forward } from "./forward.ts";

describe("forward", () => {
	test("should forward issues to end of path list", () => {
		const input = { nested: [{ key: "value_1" }, { key: "value_2" }] };
		type Input = typeof input;
		const requirement = () => false;
		expect(
			forward<Input, CheckIssue<Input>>(check(requirement, "message"), ["nested", 1, "key"])._run(
				{ typed: true, value: input },
				{},
			),
		).toStrictEqual({
			typed: true,
			value: input,
			issues: [
				{
					kind: "validation",
					type: "check",
					input,
					expected: null,
					received: "Object",
					message: "message",
					path: [
						{
							type: "unknown",
							origin: "value",
							input: input,
							key: "nested",
							value: input.nested,
						},
						{
							type: "unknown",
							origin: "value",
							input: input.nested,
							key: 1,
							value: input.nested[1],
						},
						{
							type: "unknown",
							origin: "value",
							input: input.nested[1],
							key: "key",
							value: input.nested[1].key,
						},
					],
					requirement,
					issues: undefined,
					lang: undefined,
					abortEarly: undefined,
					abortPipeEarly: undefined,
				},
			],
		} satisfies TypedDataset<Input, CheckIssue<Input>>);
	});

	test("should stop forwarding if path input is undefined", () => {
		const input = { nested: [{ key: "value_1" }, { key: "value_2" }] };
		type Input = typeof input;
		const requirement = () => false;
		expect(
			forward<Input, CheckIssue<Input>>(check(requirement, "message"), ["nested", 6, "key"])._run(
				{ typed: true, value: input },
				{},
			),
		).toStrictEqual({
			typed: true,
			value: input,
			issues: [
				{
					kind: "validation",
					type: "check",
					input,
					expected: null,
					received: "Object",
					message: "message",
					path: [
						{
							type: "unknown",
							origin: "value",
							input: input,
							key: "nested",
							value: input.nested,
						},
						{
							type: "unknown",
							origin: "value",
							input: input.nested,
							key: 6,
							value: input.nested[6],
						},
					],
					requirement,
					issues: undefined,
					lang: undefined,
					abortEarly: undefined,
					abortPipeEarly: undefined,
				},
			],
		} satisfies TypedDataset<Input, CheckIssue<Input>>);
	});

	test("should only forward issues of wrapped action", () => {
		const input = { nested: [{ key: "value_1" }, { key: "value_2" }] };
		type Input = typeof input;
		const requirement = () => false;
		const prevIssue: MinLengthIssue<Input["nested"], 3> = {
			kind: "validation",
			type: "min_length",
			input: input.nested,
			expected: ">=3",
			received: "2",
			message: "message",
			path: [
				{
					type: "object",
					origin: "value",
					input: input,
					key: "nested",
					value: input.nested,
				},
			],
			requirement: 3,
			issues: undefined,
			lang: undefined,
			abortEarly: undefined,
			abortPipeEarly: undefined,
		};
		expect(
			forward<Input, CheckIssue<Input>>(check(requirement, "message"), ["nested", 1, "key"])._run(
				{
					typed: true,
					value: input,
					// Hint: We pass a copy of the previous issue to avoid accidentally
					// modifying our test data.
					issues: [{ ...prevIssue, path: [...prevIssue.path!] }],
				},
				{},
			),
		).toStrictEqual({
			typed: true,
			value: input,
			issues: [
				prevIssue,
				{
					kind: "validation",
					type: "check",
					input,
					expected: null,
					received: "Object",
					message: "message",
					path: [
						{
							type: "unknown",
							origin: "value",
							input: input,
							key: "nested",
							value: input.nested,
						},
						{
							type: "unknown",
							origin: "value",
							input: input.nested,
							key: 1,
							value: input.nested[1],
						},
						{
							type: "unknown",
							origin: "value",
							input: input.nested[1],
							key: "key",
							value: input.nested[1].key,
						},
					],
					requirement,
					issues: undefined,
					lang: undefined,
					abortEarly: undefined,
					abortPipeEarly: undefined,
				},
			],
		} satisfies TypedDataset<Input, MinLengthIssue<Input["nested"], 3> | CheckIssue<Input>>);
	});

	test("should do nothing if there are no issues", () => {
		const input = { nested: [{ key: "value_1" }, { key: "value_2" }] };
		type Input = typeof input;
		const requirement = () => true;
		expect(
			forward<Input, CheckIssue<Input>>(check(requirement, "message"), ["nested", 6, "key"])._run(
				{ typed: true, value: input },
				{},
			),
		).toStrictEqual({
			typed: true,
			value: input,
		} satisfies TypedDataset<Input, CheckIssue<Input>>);
	});
});
