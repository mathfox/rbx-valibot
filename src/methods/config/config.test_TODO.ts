import { describe, expect, jest, test } from "@rbxts/jest-globals";
import { objectAsync, string_ } from "../../schemas";
import type { BaseIssue, Config } from "../../types";
import { config } from "./config";

describe("config", () => {
	//	test("should override config of schema", () => {
	//		const schema = string_();
	//		(schema as typeof schema & { _run: Callback })._run = jest.fn((dataset, config) => {
	//			return schema._run(dataset, config);
	//		});
	//		const dataset = { typed: false, value: "foo" } as const;
	//		const globalConfig: Config<BaseIssue<unknown>> = {
	//			lang: "de",
	//		};
	//		const localConfig: Config<BaseIssue<unknown>> = {
	//			abortPipeEarly: true,
	//		};
	//		config(schema, localConfig)._run(dataset, globalConfig);
	//		expect(schema._run).toHaveBeenCalledWith(dataset, {
	//			...globalConfig,
	//			...localConfig,
	//		});
	//	});
	//
	//	test("should override config of async schema", () => {
	//		const schema = objectAsync({ key: string_() });
	//		(schema as typeof schema & { _run: Callback })._run = jest.fn((dataset, config) => {
	//			return schema._run(dataset, config);
	//		});
	//		const dataset = { typed: false, value: { key: "foo" } } as const;
	//		const globalConfig: Config<BaseIssue<unknown>> = {
	//			lang: "de",
	//		};
	//		const localConfig: Config<BaseIssue<unknown>> = {
	//			abortEarly: true,
	//			lang: "en",
	//		};
	//		config(schema, localConfig)._run(dataset, globalConfig);
	//		expect(schema._run).toHaveBeenCalledWith(dataset, {
	//			...globalConfig,
	//			...localConfig,
	//		});
	//	});
});
