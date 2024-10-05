import type { Config } from "./config";
import type { OutputDataset, SuccessDataset } from "./dataset";
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
	readonly _run: (
		this: BaseTransformation<any, any, BaseIssue<unknown>>,
		dataset: SuccessDataset<TInput>,
		config?: Config<BaseIssue<unknown>>,
	) => OutputDataset<TOutput, BaseIssue<unknown> | TIssue>;
	/**
	 * Input, output and issue type.
	 *
	 * @internal
	 */
	readonly _types?:
		| {
				readonly input: TInput;
				readonly output: TOutput;
				readonly issue: TIssue;
		  }
		| undefined;
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
	readonly _run: (
		this: BaseTransformationAsync<any, any, BaseIssue<unknown>>,
		dataset: SuccessDataset<TInput>,
		config?: Config<BaseIssue<unknown>>,
	) => Promise<OutputDataset<TOutput, BaseIssue<unknown> | TIssue>>;
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
