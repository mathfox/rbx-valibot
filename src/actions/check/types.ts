import type { BaseIssue, MaybePromise } from "../../types";

/**
 * Check issue type.
 */
export interface CheckIssue<TInput> extends BaseIssue<TInput> {
	/**
	 * The issue kind.
	 */
	readonly kind: "validation";
	/**
	 * The issue type.
	 */
	readonly type: "check";
	/**
	 * The expected property.
	 */
	readonly expected: undefined;
	/**
	 * The validation function.
	 */
	readonly requirement: (input: TInput) => MaybePromise<boolean>;
}
