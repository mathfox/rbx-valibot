import type { Config } from "@rbxts/jest";

export = identity<Config>({
	testMatch: ["**/await*.test"],
});
