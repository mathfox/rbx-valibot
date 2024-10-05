import { afterEach, describe, expect, test } from "@rbxts/jest-globals";
import { type MinLengthIssue } from "../../actions";
import { type StringIssue, string_ } from "../../schemas";
import {
	deleteGlobalMessage,
	deleteSchemaMessage,
	deleteSpecificMessage,
	setGlobalMessage,
	setSchemaMessage,
	setSpecificMessage,
} from "../../storages";
import type { BaseIssue, FailureDataset, PartialDataset, UnknownDataset } from "../../types";
import { _addIssue } from "./_addIssue";

describe("_addIssue", () => {
	describe("should add issue to dataset", () => {
		const baseInfo = {
			path: undefined,
			issues: undefined,
			lang: undefined,
			abortEarly: undefined,
			abortPipeEarly: undefined,
		};

		type MinLength1Issue = MinLengthIssue<string, 1>;
		const minLengthIssue: MinLength1Issue = {
			...baseInfo,
			kind: "validation",
			type: "min_length",
			input: "",
			expected: ">=1",
			received: "0",
			message: "Invalid length: Expected >=1 but received 0",
			requirement: 1,
		};
	});

	describe("should generate default message", () => {
		test("with expected and received", () => {
			const dataset: UnknownDataset = { typed: false, value: undefined };
			_addIssue(string_(), "type", dataset, {});
			expect((dataset.issues?.[0] as unknown as { message: string }).message).toBe(
				"Invalid type: Expected string but received nil",
			);
		});
	});

	describe("should include custom message", () => {
		const contextMessage = "context message";
		const configMessage = "config message";
		const specificMessage = "specific message";
		const schemaMessage = "schema message";
		const globalMessage = "global message";

		afterEach(() => {
			deleteGlobalMessage();
			deleteSchemaMessage();
			deleteSpecificMessage(string_);
		});

		test("from context object", () => {
			setSpecificMessage(string_, specificMessage);
			setSchemaMessage(() => schemaMessage);
			setGlobalMessage(globalMessage);
			const dataset: UnknownDataset = {
				typed: false,
				value: undefined,
			};
			_addIssue(string_(contextMessage), "type", dataset, {
				message: () => configMessage,
			});
			expect((dataset.issues?.[0] as unknown as { message: string }).message).toBe(contextMessage);
		});

		test("from specific storage", () => {
			setSpecificMessage(string_, specificMessage);
			setSchemaMessage(() => schemaMessage);
			setGlobalMessage(globalMessage);
			const dataset: UnknownDataset = {
				typed: false,
				value: undefined,
			};
			_addIssue(string_(), "type", dataset, {
				message: () => configMessage,
			});
			expect((dataset.issues?.[0] as unknown as { message: string }).message).toBe(specificMessage);
		});

		test("from schema storage", () => {
			setSchemaMessage(() => schemaMessage);
			setGlobalMessage(globalMessage);
			const dataset: UnknownDataset = {
				typed: false,
				value: undefined,
			};
			_addIssue(string_(), "type", dataset, {
				message: () => configMessage,
			});
			expect((dataset.issues?.[0] as unknown as { message: string }).message).toBe(schemaMessage);
		});

		test("from config object", () => {
			setGlobalMessage(globalMessage);
			const dataset: UnknownDataset = { typed: false, value: undefined };
			_addIssue(string_(), "type", dataset, {
				message: () => configMessage,
			});
			expect((dataset.issues?.[0] as unknown as { message: string }).message).toBe(configMessage);
		});

		test("from global storage", () => {
			setGlobalMessage(globalMessage);
			const dataset: UnknownDataset = { typed: false, value: undefined };
			_addIssue(string_(), "type", dataset, {});
			expect((dataset.issues?.[0] as unknown as { message: string }).message).toBe(globalMessage);
		});
	});

	test("should include configuration", () => {
		const dataset: UnknownDataset = { typed: false, value: undefined };
		const config = {
			lang: "en",
			abortEarly: true,
			abortPipeEarly: true,
		};
		_addIssue(string_(), "type", dataset, config);
		expect(dataset.issues?.[0]).toMatchObject(config);
	});

	test("should include other information", () => {
		const dataset: UnknownDataset = { typed: false, value: undefined };
		const other = {
			received: '"foo"',
			expected: '"bar"',
			issues: [
				{
					kind: "schema",
					type: "special",
					input: "foo",
					expected: '"baz"',
					received: '"foo"',
					message: "Custom messsage",
				},
			] satisfies [BaseIssue<string>],
		};
		_addIssue(string_(), "type", dataset, {}, other);
		expect(dataset.issues?.[0]).toMatchObject({
			...other,
			message: 'Invalid type: Expected "bar" but received "foo"',
		});
	});
});
