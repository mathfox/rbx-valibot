import type { BaseIssue } from "./issue.ts";

/**
 * Untyped dataset type.
 *
 * The `issues` property should never be present.
 */
export interface UntypedDataset {
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
	 */
	issues?: never;
}

/**
 * Success dataset type.
 */
export interface SuccessDataset<TValue> {
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
	 */
	issues?: undefined;
}

/**
 * Partial dataset type.
 */
export interface PartialDataset<TValue, TIssue extends BaseIssue<unknown>> {
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
	 */
	issues: [TIssue, ...TIssue[]];
}

/**
 * Failure dataset type.
 */
export interface FailureDataset<TIssue extends BaseIssue<unknown>> {
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
	 */
	issues: [TIssue, ...TIssue[]];
}

/**
 * Output dataset type.
 */
export type OutputDataset<TValue, TIssue extends BaseIssue<unknown>> =
	| UntypedDataset
	| SuccessDataset<TValue>
	| PartialDataset<TValue, TIssue>
	| FailureDataset<TIssue>;

/**
 * Unknown dataset type.
 *
 * The narrowing is required to distinguish between variants of the dataset.
 */
export type UnknownDataset = OutputDataset<unknown, BaseIssue<unknown>>;
