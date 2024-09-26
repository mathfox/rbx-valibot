import type { Config } from "./config";
import type { Dataset } from "./dataset";
import type { BaseIssue } from "./issue";

/**
 * Base validation type.
 */
export interface BaseValidation<TInput, TOutput, TIssue extends BaseIssue<unknown>> {
	/**
	 * The object kind.
	 */
	readonly kind: "validation";
	/**
	 * The validation type.
	 */
	readonly type: string;
	/**
	 * The validation reference.
	 */
	readonly reference: (...args: any[]) => BaseValidation<any, any, BaseIssue<unknown>>;
	/**
	 * The expected property.
	 */
	readonly expects: string | undefined;
	/**
	 * Whether it's async.
	 */
	readonly async: false;
	/**
	 * Validates known input.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly _run: (
		this: BaseValidation<any, any, BaseIssue<unknown>>,
		dataset: Dataset<TInput, BaseIssue<unknown>>,
		config: Config<BaseIssue<unknown>>,
	) => Dataset<TOutput, BaseIssue<unknown> | TIssue>;
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
 * Base validation async type.
 */
export interface BaseValidationAsync<TInput, TOutput, TIssue extends BaseIssue<unknown>>
	extends Omit<BaseValidation<TInput, TOutput, TIssue>, "reference" | "async" | "_run"> {
	/**
	 * The validation reference.
	 */
	readonly reference: (
		...args: any[]
	) => BaseValidation<any, any, BaseIssue<unknown>> | BaseValidationAsync<any, any, BaseIssue<unknown>>;
	/**
	 * Whether it's async.
	 */
	readonly async: true;
	/**
	 * Validates known input.
	 *
	 * @param dataset The input dataset.
	 * @param config The configuration.
	 *
	 * @returns The output dataset.
	 *
	 * @internal
	 */
	readonly _run: (
		this: BaseValidation<any, any, BaseIssue<unknown>> | BaseValidationAsync<any, any, BaseIssue<unknown>>,
		dataset: Dataset<TInput, BaseIssue<unknown>>,
		config: Config<BaseIssue<unknown>>,
	) => Promise<Dataset<TOutput, BaseIssue<unknown> | TIssue>>;
}

/**
 * Generic validation type.
 */
export interface GenericValidation<
	TInput = any,
	TOutput = TInput,
	TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseValidation<TInput, TOutput, TIssue> {}

/**
 * Generic validation async type.
 */
export interface GenericValidationAsync<
	TInput = any,
	TOutput = TInput,
	TIssue extends BaseIssue<unknown> = BaseIssue<unknown>,
> extends BaseValidationAsync<TInput, TOutput, TIssue> {}
