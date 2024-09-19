//import { describe, expect, test } from "@rbxts/jest-globals";
//import type { EmailIssue } from "../../../../actions";
//import type { TypedDataset } from "../../../../types";
//import { _subIssues } from "./_subIssues";
//import RegExp from "@rbxts/regexp";
//
//describe("_subIssues", () => {
//	describe("should return undefined", () => {
//		test("for undefined", () => {
//			expect(_subIssues(undefined)).toBeUndefined();
//		});
//
//		test("for empty array", () => {
//			expect(_subIssues([])).toBeUndefined();
//		});
//
//		test("for undefined issues", () => {
//			expect(_subIssues([{ typed: true, value: "foo" }])).toBeUndefined();
//		});
//	});
//
//	describe("should return subissues", () => {
//		const baseInfo = {
//			message: expect.any("string"),
//			requirement: undefined,
//			path: undefined,
//			issues: undefined,
//			lang: undefined,
//			abortEarly: undefined,
//			abortPipeEarly: undefined,
//		};
//
//		const emailIssue: EmailIssue<string> = {
//			...baseInfo,
//			kind: "validation",
//			type: "email",
//			input: "foo",
//			expected: undefined,
//			received: '"foo"',
//			requirement: expect.any(RegExp),
//		};
//
//		test("for single dataset with single issue", () => {
//			expect(
//				_subIssues([
//					{
//						typed: true,
//						value: "foo",
//						issues: [emailIssue],
//					} satisfies TypedDataset<string, EmailIssue<string>>,
//				]),
//			).toEqual([emailIssue]);
//		});
//
//		test("for single dataset with multiple issues", () => {
//			expect(
//				_subIssues([
//					{
//						typed: true,
//						value: "foo",
//						issues: [emailIssue],
//					} satisfies TypedDataset<string, EmailIssue<string>>,
//				]),
//			).toEqual([emailIssue]);
//		});
//
//		test("for multiple datasets with single issue", () => {
//			expect(
//				_subIssues([
//					{
//						typed: true,
//						value: "foo",
//						issues: [emailIssue],
//					},
//				] satisfies TypedDataset<string, EmailIssue<string>>[]),
//			).toEqual([emailIssue]);
//		});
//
//		test("for multiple datasets with multiple issues", () => {
//			expect(
//				_subIssues([
//					{
//						typed: true,
//						value: "foo",
//						issues: [emailIssue],
//					},
//					{
//						typed: true,
//						value: "foo",
//						issues: [emailIssue],
//					},
//				] satisfies TypedDataset<string, EmailIssue<string>>[]),
//			).toEqual([emailIssue, emailIssue]);
//		});
//	});
//});
