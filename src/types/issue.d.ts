import type { Config } from "./config";

/**
 * Base issue type.
 */
export interface BaseIssue<TInput> extends Config<BaseIssue<TInput>> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema" | "validation" | "transformation";
	/**
	 * The issue type.
	 */
	readonly type: string;
	/**
	 * The raw input data.
	 */
	readonly input: TInput;
	/**
	 * The expected property.
	 */
	readonly expected: string | undefined;
	/**
	 * The received property.
	 */
	readonly received: string;
	/**
	 * The error message.
	 */
	readonly message: string;
	/**
	 * The input requirement.
	 */
	readonly requirement?: unknown | undefined;
	/**
	 * The sub issues.
	 */
	readonly issues?: [BaseIssue<TInput>, ...BaseIssue<TInput>[]] | undefined;
}

/**
 * Generic issue type.
 */
export interface GenericIssue<TInput = unknown> extends BaseIssue<TInput> {}
