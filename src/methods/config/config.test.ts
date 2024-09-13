import { describe, expect, test } from "@rbxts/jest-globals";
import { objectAsync, string } from "../../schemas";
import type { BaseIssue, Config } from "../../types";
import { config } from "./config";

describe("config", () => {
	test("should override config of schema", () => {
		const schema = string();
		//// @ts-expect-error
		//schema._run = vi.fn(schema._run);
		const dataset = { typed: false, value: "foo" };
		const globalConfig: Config<BaseIssue<unknown>> = {
			lang: "de",
		};
		const localConfig: Config<BaseIssue<unknown>> = {
			abortPipeEarly: true,
		};
		config(schema, localConfig)._run(dataset, globalConfig);
		expect(schema._run).toHaveBeenCalledWith(dataset, {
			...globalConfig,
			...localConfig,
		});
	});

	test("should override config of async schema", () => {
		const schema = objectAsync({ key: string() });
		//// @ts-expect-error
		//schema._run = vi.fn(schema._run);
		const dataset = { typed: false, value: { key: "foo" } };
		const globalConfig: Config<BaseIssue<unknown>> = {
			lang: "de",
		};
		const localConfig: Config<BaseIssue<unknown>> = {
			abortEarly: true,
			lang: "en",
		};
		config(schema, localConfig)._run(dataset, globalConfig);
		expect(schema._run).toHaveBeenCalledWith(dataset, {
			...globalConfig,
			...localConfig,
		});
	});
});
