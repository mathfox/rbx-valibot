import { describe, expect, test } from "@rbxts/jest-globals";
import { pipe } from "../../methods";
import type { InferIssue, InferOutput, TypedDataset, UntypedDataset } from "../../types";
import { expectNoSchemaIssue } from "../../tests";
import { boolean } from "../boolean";
import { literal } from "../literal/literal";
import { number } from "../number";
import { object } from "../object";
import { string_ } from "../string";
import { variant } from "./variant";
import { custom } from "../custom";

// TODO: Add test for invalid type inputs

describe("variant", () => {
	describe("should return dataset without issues", () => {
		test("for simple variants", () => {
			expectNoSchemaIssue(variant("type", [object({ type: literal("foo") }), object({ type: literal("bar") })]), [
				{ type: "foo" },
				{ type: "bar" },
			]);
		});

		test("for same discriminators", () => {
			expectNoSchemaIssue(
				variant("type", [
					object({ type: literal("foo"), other: string_() }),
					object({ type: literal("foo"), other: number() }),
					object({ type: literal("foo"), other: boolean() }),
				]),
				[
					{ type: "foo", other: "hello" },
					{ type: "foo", other: 123 },
					{ type: "foo", other: true },
				],
			);
		});

		test("for nested variants", () => {
			expectNoSchemaIssue(
				variant("type", [object({ type: literal("foo") }), variant("type", [object({ type: literal("bar") })])]),
				[{ type: "foo" }, { type: "bar" }],
			);
		});

		test("for deeply nested variants", () => {
			expectNoSchemaIssue(
				variant("type", [object({ type: literal("foo") }), variant("type", [object({ type: literal("bar") })])]),
				[{ type: "foo" }, { type: "bar" }],
			);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			message: expect.any("string"),
			requirement: undefined,
			path: undefined,
			issues: undefined,
			lang: undefined,
			abortEarly: undefined,
			abortPipeEarly: undefined,
		};

		test("for invalid base type", () => {
			const schema = variant("type", [object({ type: literal("foo") }), object({ type: literal("bar") })]);
			expect(schema._run({ typed: false, value: "foo" }, {})).toStrictEqual({
				typed: false,
				value: "foo",
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: "foo",
						expected: "Object",
						received: '"foo"',
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for empty options", () => {
			const schema = variant("type", []);
			const input = { type: "foo" };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: input.type,
						expected: "never",
						received: `"${input.type}"`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for missing discriminator", () => {
			const schema = variant("type", [object({ type: literal("foo") }), object({ type: literal("bar") })]);
			const input = { other: 123 };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: undefined,
						expected: '("foo" | "bar")',
						received: "undefined",
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for invalid discriminator", () => {
			const schema = variant("type", [object({ type: literal("foo") }), object({ type: literal("bar") })]);
			const input = { type: "baz" };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: input.type,
						expected: '("foo" | "bar")',
						received: `"${input.type}"`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for nested missing discriminator", () => {
			const schema = variant("type", [
				object({ type: literal("foo") }),
				variant("other", [
					object({ type: literal("bar"), other: string_() }),
					object({ type: literal("bar"), other: boolean() }),
					object({ type: literal("baz"), other: number() }),
				]),
			]);
			const input = { type: "bar" };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: undefined,
						expected: "(string | boolean)",
						received: "undefined",
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for nested invalid discriminator", () => {
			const schema = variant("type", [
				object({ type: literal("foo") }),
				variant("other", [
					object({ type: literal("bar"), other: string_() }),
					object({ type: literal("bar"), other: boolean() }),
					object({ type: literal("baz"), other: number() }),
				]),
			]);
			const input = { type: "bar", other: 123 };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: input.other,
						expected: "(string | boolean)",
						received: `${input.other}`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for first missing invalid discriminator", () => {
			const schema = variant("type", [
				variant("subType1", [
					object({
						type: literal("foo"),
						subType1: literal("foo-1"),
						other1: string_(),
					}),
					object({
						type: literal("bar"),
						subType1: literal("bar-1"),
						other2: string_(),
					}),
				]),
				variant("subType2", [
					object({
						type: literal("foo"),
						subType2: literal("foo-2"),
						other3: string_(),
					}),
					object({
						type: literal("bar"),
						subType2: literal("bar-2"),
						other4: string_(),
					}),
				]),
			]);
			const input = {};
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: undefined,
						expected: '("foo" | "bar")',
						received: "undefined",
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for first nested missing discriminator", () => {
			const schema = variant("type", [
				variant("subType1", [
					object({
						type: literal("foo"),
						subType1: literal("foo-1"),
						other1: string_(),
					}),
					object({
						type: literal("bar"),
						subType1: literal("bar-1"),
						other2: string_(),
					}),
				]),
				variant("subType2", [
					object({
						type: literal("foo"),
						subType2: literal("foo-2"),
						other3: string_(),
					}),
					object({
						type: literal("bar"),
						subType2: literal("bar-2"),
						other4: string_(),
					}),
				]),
			]);
			const input = { type: "bar" };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: undefined,
						expected: '"bar-1"',
						received: "undefined",
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for first nested invalid discriminator", () => {
			const schema = variant("type", [
				variant("subType1", [
					object({
						type: literal("foo"),
						subType1: literal("foo-1"),
						other1: string_(),
					}),
					object({
						type: literal("bar"),
						subType1: literal("bar-1"),
						other2: string_(),
					}),
				]),
				variant("subType2", [
					object({
						type: literal("foo"),
						subType2: literal("foo-2"),
						other3: string_(),
					}),
					object({
						type: literal("bar"),
						subType2: literal("bar-2"),
						other4: string_(),
					}),
				]),
			]);
			const input = { type: "bar", subType2: "baz-2" };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: input.subType2,
						expected: '"bar-2"',
						received: `"${input.subType2}"`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for first nested invalid discriminator", () => {
			const schema = variant("type", [
				variant("subType1", [
					object({
						type: literal("foo"),
						subType1: literal("foo-1"),
						other1: string_(),
					}),
					object({
						type: literal("bar"),
						subType1: literal("bar-1"),
						other2: string_(),
					}),
				]),
				variant("subType2", [
					object({
						type: literal("foo"),
						subType2: literal("foo-2"),
						other3: string_(),
					}),
					object({
						type: literal("bar"),
						subType2: literal("bar-2"),
						other4: string_(),
					}),
				]),
			]);
			const input = { type: "bar", subType1: "invalid", subType2: "invalid" };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: input.subType1,
						expected: '"bar-1"',
						received: `"${input.subType1}"`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for first nested invalid discriminator", () => {
			const schema = variant("type", [
				variant("subType1", [
					variant("subType2", [
						object({
							type: literal("foo"),
							subType1: literal("foo-1"),
							subType2: literal("foo-2"),
							other1: string_(),
						}),
						object({
							type: literal("bar"),
							subType1: literal("bar-1"),
							subType2: literal("bar-2"),
							other2: string_(),
						}),
					]),
				]),
				variant("subType2", [
					object({
						type: literal("foo"),
						subType2: literal("foz-2"),
						other3: string_(),
					}),
					object({
						type: literal("bar"),
						subType2: literal("baz-2"),
						other4: string_(),
					}),
				]),
			]);
			const input = { type: "bar", subType1: "bar-1", subType2: "invalid" };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: input.subType2,
						expected: '("bar-2" | "baz-2")',
						received: `"${input.subType2}"`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for first nested invalid discriminator", () => {
			const schema = variant("type", [
				variant("subType2", [
					object({
						type: literal("foo"),
						subType2: literal("foz-2"),
						other3: string_(),
					}),
					object({
						type: literal("bar"),
						subType2: literal("baz-2"),
						other4: string_(),
					}),
				]),
				variant("subType1", [
					variant("subType2", [
						object({
							type: literal("foo"),
							subType1: literal("foo-1"),
							subType2: literal("foo-2"),
							other1: string_(),
						}),
						object({
							type: literal("bar"),
							subType1: literal("bar-1"),
							subType2: literal("bar-2"),
							other2: string_(),
						}),
					]),
				]),
			]);
			const input = { type: "bar", subType1: "bar-1", subType2: "invalid" };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: input.subType2,
						expected: '("baz-2" | "bar-2")',
						received: `"${input.subType2}"`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for first nested invalid discriminator", () => {
			const schema = variant("type", [
				variant("subType1", [
					object({
						type: literal("foo"),
						subType1: literal("foo-1"),
						other1: string_(),
					}),
					object({
						type: literal("bar"),
						subType1: literal("bar-1"),
						other2: string_(),
					}),
					variant("subType2", [
						object({
							type: literal("bar"),
							subType1: literal("baz-1"),
							subType2: literal("baz-2"),
							other5: string_(),
						}),
					]),
				]),
				variant("subType2", [
					object({
						type: literal("foo"),
						subType2: literal("foo-2"),
						other3: string_(),
					}),
					object({
						type: literal("bar"),
						subType2: literal("bar-2"),
						other4: string_(),
					}),
				]),
			]);
			const input = { type: "bar", subType2: "baz-2" };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "variant",
						input: input.subType2,
						expected: '"bar-2"',
						received: `"${input.subType2}"`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for untyped object", () => {
			const schema = variant("type", [
				object({ type: literal("bar"), other: string_() }),
				object({ type: literal("baz"), other: number() }),
			]);
			const input = { type: "bar", other: undefined };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "string",
						input: input.other,
						expected: "string",
						received: `${input.other}`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for nested untyped object", () => {
			const schema = variant("type", [
				object({ type: literal("foo") }),
				variant("type", [
					object({ type: literal("bar"), other: string_() }),
					object({ type: literal("baz"), other: number() }),
				]),
			]);
			const input = { type: "bar", other: undefined };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "string",
						input: input.other,
						expected: "string",
						received: `${input.other}`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});

		test("for multiple untyped objects", () => {
			const schema = variant("type", [
				object({ type: literal("bar"), other: string_() }),
				object({ type: literal("bar"), other: number() }),
				object({ type: literal("bar"), other: boolean() }),
			]);
			const input = { type: "bar", other: undefined };
			expect(schema._run({ typed: false, value: input }, {})).toStrictEqual({
				typed: false,
				value: input,
				issues: [
					{
						...baseInfo,
						kind: "schema",
						type: "string",
						input: input.other,
						expected: "string",
						received: `${input.other}`,
					},
				],
			} satisfies UntypedDataset<InferIssue<typeof schema>>);
		});
	});
});
