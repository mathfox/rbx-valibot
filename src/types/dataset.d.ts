import type { BaseIssue } from "./issue";

/**
 * Typed dataset type.
 */
export interface TypedDataset<TValue, TIssue extends BaseIssue<unknown>> {
	/**
	 * Whether is's typed.
	 */
	typed: true;
	/**
	 * The dataset value.
	 */
	value: TValue;
	/**
	 * The dataset issues.
	 * At least one issue is required for the issues array to be considered valid.
	 */
	issues?: [TIssue, ...TIssue[]];
}

/**
 * Untyped dataset type.
 */
export interface UntypedDataset<TIssue extends BaseIssue<unknown>> {
	/**
	 * Whether is's typed.
	 */
	typed: false;
	/**
	 * The dataset value.
	 */
	value: unknown;
	/**
	 * The dataset issues.
	 * At least one issue is required for the issues array to be considered valid.
	 */
	issues?: [TIssue, ...TIssue[]];
}

/**
 * Dataset type.
 */
export type Dataset<TValue, TIssue extends BaseIssue<unknown>> = TypedDataset<TValue, TIssue> | UntypedDataset<TIssue>;
