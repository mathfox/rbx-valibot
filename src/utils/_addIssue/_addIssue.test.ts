//import { afterEach, describe, expect, test } from "@rbxts/jest-globals";
//import { type MinLengthIssue, minLength } from "../../actions";
//import { type NumberIssue, type StringIssue, number, string } from "../../schemas";
//import {
//	deleteGlobalMessage,
//	deleteSchemaMessage,
//	deleteSpecificMessage,
//	setGlobalMessage,
//	setSchemaMessage,
//	setSpecificMessage,
//} from "../../storages";
//import type { BaseIssue, Dataset, IssuePathItem, TypedDataset, UntypedDataset } from "../../types";
//import { _addIssue } from "./_addIssue";
//
//describe("_addIssue", () => {
//	describe("should add issue to dataset", () => {
//		const baseInfo = {
//			path: undefined,
//			issues: undefined,
//			lang: undefined,
//			abortEarly: undefined,
//			abortPipeEarly: undefined,
//		};
//
//		type MinLength1Issue = MinLengthIssue<string, 1>;
//		const minLengthIssue: MinLength1Issue = {
//			...baseInfo,
//			kind: "validation",
//			type: "min_length",
//			input: "",
//			expected: ">=1",
//			received: "0",
//			message: "Invalid length: Expected >=1 but received 0",
//			requirement: 1,
//		};
//	});
//
//	describe("should generate default message", () => {
//		test("with expected and received", () => {
//			const dataset: UntypedDataset<StringIssue> = {
//				typed: false,
//				value: null,
//			};
//			_addIssue(string(), "type", dataset, {});
//			expect(dataset.issues?.[0].message).toBe("Invalid type: Expected string but received null");
//		});
//	});
//
//	describe("should include custom message", () => {
//		const contextMessage = "context message";
//		const configMessage = "config message";
//		const specificMessage = "specific message";
//		const schemaMessage = "schema message";
//		const globalMessage = "global message";
//
//		afterEach(() => {
//			deleteGlobalMessage();
//			deleteSchemaMessage();
//			deleteSpecificMessage(string);
//		});
//
//		test("from context object", () => {
//			setSpecificMessage(string, specificMessage);
//			setSchemaMessage(() => schemaMessage);
//			setGlobalMessage(globalMessage);
//			const dataset: UntypedDataset<StringIssue> = {
//				typed: false,
//				value: null,
//			};
//			_addIssue(string(contextMessage), "type", dataset, {
//				message: () => configMessage,
//			});
//			expect(dataset.issues?.[0].message).toBe(contextMessage);
//		});
//
//		test("from specific storage", () => {
//			setSpecificMessage(string, specificMessage);
//			setSchemaMessage(() => schemaMessage);
//			setGlobalMessage(globalMessage);
//			const dataset: UntypedDataset<StringIssue> = {
//				typed: false,
//				value: null,
//			};
//			_addIssue(string(), "type", dataset, {
//				message: () => configMessage,
//			});
//			expect(dataset.issues?.[0].message).toBe(specificMessage);
//		});
//
//		test("from schema storage", () => {
//			setSchemaMessage(() => schemaMessage);
//			setGlobalMessage(globalMessage);
//			const dataset: UntypedDataset<StringIssue> = {
//				typed: false,
//				value: null,
//			};
//			_addIssue(string(), "type", dataset, {
//				message: () => configMessage,
//			});
//			expect(dataset.issues?.[0].message).toBe(schemaMessage);
//		});
//
//		test("from config object", () => {
//			setGlobalMessage(globalMessage);
//			const dataset: UntypedDataset<StringIssue> = {
//				typed: false,
//				value: null,
//			};
//			_addIssue(string(), "type", dataset, {
//				message: () => configMessage,
//			});
//			expect(dataset.issues?.[0].message).toBe(configMessage);
//		});
//
//		test("from global storage", () => {
//			setGlobalMessage(globalMessage);
//			const dataset: UntypedDataset<StringIssue> = {
//				typed: false,
//				value: null,
//			};
//			_addIssue(string(), "type", dataset, {});
//			expect(dataset.issues?.[0].message).toBe(globalMessage);
//		});
//	});
//
//	test("should include configuration", () => {
//		const dataset: UntypedDataset<StringIssue> = {
//			typed: false,
//			value: null,
//		};
//		const config = {
//			lang: "en",
//			abortEarly: true,
//			abortPipeEarly: true,
//		};
//		_addIssue(string(), "type", dataset, config);
//		expect(dataset.issues?.[0]).toMatchObject(config);
//	});
//
//	test("should include other information", () => {
//		const dataset: UntypedDataset<StringIssue> = {
//			typed: false,
//			value: null,
//		};
//		const other = {
//			received: '"foo"',
//			expected: '"bar"',
//			path: [
//				{
//					type: "object",
//					origin: "value",
//					input: { key: "foo" },
//					key: "key",
//					value: "foo",
//				},
//			] satisfies [IssuePathItem],
//			issues: [
//				{
//					kind: "schema",
//					type: "special",
//					input: "foo",
//					expected: '"baz"',
//					received: '"foo"',
//					message: "Custom messsage",
//				},
//			] satisfies [BaseIssue<string>],
//		};
//		_addIssue(string(), "type", dataset, {}, other);
//		expect(dataset.issues?.[0]).toMatchObject({
//			...other,
//			message: 'Invalid type: Expected "bar" but received "foo"',
//		});
//	});
//});
