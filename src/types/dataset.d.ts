import type { BaseIssue } from "./issue.ts";

/**
 * Unknown dataset type.
 *
 * The narrowing is required to distinguish between variants of the dataset.
 */
export type UnknownDataset =
	| UntypedDataset
	| SuccessDataset<unknown>
	| PartialDataset<unknown, BaseIssue<unknown>>
	| FailureDataset<BaseIssue<unknown>>;

/**
 * Untyped dataset type.
 *
 * The `issues` property should never be present.
 */
export interface UntypedDataset {
	/**
	 * Whether is's typed.
	 */
	//typed?: false;
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
	| SuccessDataset<TValue>
	| PartialDataset<TValue, TIssue>
	| FailureDataset<TIssue>;
