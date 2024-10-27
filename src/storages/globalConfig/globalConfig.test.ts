import { describe, expect, test } from "@rbxts/jest-globals";
import { type GlobalConfig, deleteGlobalConfig, getGlobalConfig, setGlobalConfig } from "./globalConfig";
import { Config } from "../../types";

describe("config", () => {
	const initialConfig: Config<never> = {
		lang: undefined,
		message: undefined,
		abortEarly: undefined,
		abortPipeEarly: undefined,
	};

	const customConfig: GlobalConfig = {
		lang: "en",
		abortEarly: true,
		abortPipeEarly: false,
	};

	test("should be undefined initially", () => {
		expect(getGlobalConfig()).toEqual(initialConfig);
	});

	test("should set and get global config", () => {
		setGlobalConfig(customConfig);
		expect(getGlobalConfig()).toEqual({
			...initialConfig,
			...customConfig,
		});
	});

	test("should merge config argument", () => {
		expect(getGlobalConfig({ lang: "de" })).toEqual({ ...initialConfig, ...customConfig, lang: "de" });
	});

	test("should delete global config", () => {
		deleteGlobalConfig();
		expect(getGlobalConfig()).toEqual(initialConfig);
	});
});
