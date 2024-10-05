import { describe, expect, test } from "@rbxts/jest-globals";
import type { FailureDataset, InferIssue } from "../../types";
import { expectNoSchemaIssueAsync } from "../../tests";
import { boolean } from "../boolean";
import { literal } from "../literal/literal";
import { number } from "../number";
import { object, objectAsync } from "../object";
import { string_ } from "../string";
import { variantAsync } from "./variantAsync";

// TODO: Add test for invalid type inputs

describe("variantAsync", () => {
	describe("should return dataset without issues", () => {
		test("for simple variants", async () => {
			await expectNoSchemaIssueAsync(
				variantAsync("type", [object({ type: literal("foo") }), object({ type: literal("bar") })]),
				[{ type: "foo" }, { type: "bar" }],
			);
		});

		test("for same discriminators", async () => {
			await expectNoSchemaIssueAsync(
				variantAsync("type", [
					object({ type: literal("foo"), other: string_() }),
					object({ type: literal("foo"), other: number() }),
					objectAsync({ type: literal("foo"), other: boolean() }),
				]),
				[
					{ type: "foo", other: "hello" },
					{ type: "foo", other: 123 },
					{ type: "foo", other: true },
				],
			);
		});

		test("for nested variants", async () => {
			await expectNoSchemaIssueAsync(
				variantAsync("type", [
					object({ type: literal("foo") }),
					variantAsync("type", [object({ type: literal("bar") })]),
				]),
				[{ type: "foo" }, { type: "bar" }],
			);
		});

		test("for deeply nested variants", async () => {
			await expectNoSchemaIssueAsync(
				variantAsync("type", [
					object({ type: literal("foo") }),
					variantAsync("type", [object({ type: literal("bar") })]),
				]),
				[{ type: "foo" }, { type: "bar" }],
			);
		});
	});

	describe("should return dataset with issues", () => {
		const baseInfo = {
			message: expect.any("string"),
			requirement: undefined,
			issues: undefined,
			lang: undefined,
			abortEarly: undefined,
			abortPipeEarly: undefined,
		};

		test("for invalid base type", async () => {
			const schema = variantAsync("type", [object({ type: literal("foo") }), objectAsync({ type: literal("bar") })]);
			expect(await schema._run({ typed: false, value: "foo" }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for empty options", async () => {
			const schema = variantAsync("type", []);
			const input = { type: "foo" };
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for missing discriminator", async () => {
			const schema = variantAsync("type", [object({ type: literal("foo") }), objectAsync({ type: literal("bar") })]);
			const input = { other: 123 };
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for invalid discriminator", async () => {
			const schema = variantAsync("type", [object({ type: literal("foo") }), objectAsync({ type: literal("bar") })]);
			const input = { type: "baz" };
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for nested missing discriminator", async () => {
			const schema = variantAsync("type", [
				object({ type: literal("foo") }),
				variantAsync("other", [
					object({ type: literal("bar"), other: string_() }),
					object({ type: literal("bar"), other: boolean() }),
					object({ type: literal("baz"), other: number() }),
				]),
			]);
			const input = { type: "bar" };
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for nested invalid discriminator", async () => {
			const schema = variantAsync("type", [
				object({ type: literal("foo") }),
				variantAsync("other", [
					object({ type: literal("bar"), other: string_() }),
					object({ type: literal("bar"), other: boolean() }),
					object({ type: literal("baz"), other: number() }),
				]),
			]);
			const input = { type: "bar", other: 123 };
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for first missing invalid discriminator", async () => {
			const schema = variantAsync("type", [
				variantAsync("subType1", [
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
				variantAsync("subType2", [
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
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for first nested missing discriminator", async () => {
			const schema = variantAsync("type", [
				variantAsync("subType1", [
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
				variantAsync("subType2", [
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
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for first nested invalid discriminator", async () => {
			const schema = variantAsync("type", [
				variantAsync("subType1", [
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
				variantAsync("subType2", [
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
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for first nested invalid discriminator", async () => {
			const schema = variantAsync("type", [
				variantAsync("subType1", [
					variantAsync("subType2", [
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
				variantAsync("subType2", [
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
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for first nested invalid discriminator", async () => {
			const schema = variantAsync("type", [
				variantAsync("subType2", [
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
				variantAsync("subType1", [
					variantAsync("subType2", [
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

			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for first nested invalid discriminator", async () => {
			const schema = variantAsync("type", [
				variantAsync("subType1", [
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
					variantAsync("subType2", [
						object({
							type: literal("bar"),
							subType1: literal("baz-1"),
							subType2: literal("baz-2"),
							other5: string_(),
						}),
					]),
				]),
				variantAsync("subType2", [
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
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for untyped object", async () => {
			const schema = variantAsync("type", [
				object({ type: literal("bar"), other: string_() }),
				objectAsync({ type: literal("baz"), other: number() }),
			]);
			const input = { type: "bar", other: 3 };
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for nested untyped object", async () => {
			const schema = variantAsync("type", [
				object({ type: literal("foo") }),
				variantAsync("type", [
					object({ type: literal("bar"), other: string_() }),
					objectAsync({ type: literal("baz"), other: number() }),
				]),
			]);
			const input = { type: "bar", other: 3 };
			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});

		test("for multiple untyped objects", async () => {
			const schema = variantAsync("type", [
				object({ type: literal("bar"), other: string_() }),
				object({ type: literal("bar"), other: number() }),
				objectAsync({ type: literal("bar"), other: boolean() }),
			]);

			const input = { type: "bar", other: undefined };

			expect(await schema._run({ typed: false, value: input }, {})).toEqual({
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
			} satisfies FailureDataset<InferIssue<typeof schema>>);
		});
	});
});
