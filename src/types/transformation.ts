import type { Config } from "./config";
import type { Dataset, TypedDataset } from "./dataset";
import type { BaseIssue } from "./issue";

/**
 * Base transformation type.
 */
export interface BaseTransformation<TInput, TOutput, TIssue extends BaseIssue<unknown>> {
	/**
	 * The object kind.
	 */
	readonly kind: "transformation";
	/**
	 * The transformation type.
	 */
	readonly type: string;
	/**
	 * The transformation reference.
	 */
	readonly reference: (...args: any[]) => BaseTransformation<any, any, BaseIssue<unknown>>;
	/**
	 * Whether it's async.
	 */
	readonly async: false;
	/**
	 * Transforms known input.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly _run: (dataset: TypedDataset<TInput, never>, config: Config<TIssue>) => Dataset<TOutput, TIssue>;
	/**
	 * Input, output and issue type.
	 *
	 * @internal
	 */
	readonly _types?: {
		readonly input: TInput;
		readonly output: TOutput;
		readonly issue: TIssue;
	};
}

/**
 * Base transformation async type.
 */
export interface BaseTransformationAsync<TInput, TOutput, TIssue extends BaseIssue<unknown>>
	extends Omit<BaseTransformation<TInput, TOutput, TIssue>, "reference" | "async" | "_run"> {
	/**
	 * The transformation reference.
	 */
	readonly reference: (
		...args: any[]
	) => BaseTransformation<any, any, BaseIssue<unknown>> | BaseTransformationAsync<any, any, BaseIssue<unknown>>;
	/**
	 * Whether it's async.
	 */
	readonly async: true;
	/**
	 * Transforms known input.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly _run: (dataset: TypedDataset<TInput, never>, config: Config<TIssue>) => Promise<Dataset<TOutput, TIssue>>;
}

/**
 * Generic transformation type.
 */
export interface GenericTransformation<
	TInput = any,
	TOutput = TInput,
	TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseTransformation<TInput, TOutput, TIssue> {}

/**
 * Generic transformation async type.
 */
export interface GenericTransformationAsync<
	TInput = any,
	TOutput = TInput,
	TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseTransformationAsync<TInput, TOutput, TIssue> {}
