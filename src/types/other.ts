import type { Config } from "./config";
import type { Dataset } from "./dataset";
import type { InferInput, InferIssue } from "./infer";
import type { BaseIssue } from "./issue";
import type { BaseSchema, BaseSchemaAsync } from "./schema";
import type { MaybePromise, MaybeReadonly } from "./utils";

/**
 * Error message type.
 */
export type ErrorMessage<TIssue extends BaseIssue<unknown>> = ((issue: TIssue) => string) | string;

/**
 * Default type.
 */
export type Default<
	TWrapped extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	TInput extends null | undefined,
> =
	| MaybeReadonly<InferInput<TWrapped> | TInput>
	| ((
			dataset?: Dataset<TInput, never>,
			config?: Config<InferIssue<TWrapped>>,
	  ) => MaybeReadonly<InferInput<TWrapped> | TInput>);

/**
 * Default async type.
 */
export type DefaultAsync<
	TWrapped extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	TInput extends null | undefined,
> =
	| MaybeReadonly<InferInput<TWrapped> | TInput>
	| ((
			dataset?: Dataset<TInput, never>,
			config?: Config<InferIssue<TWrapped>>,
	  ) => MaybePromise<MaybeReadonly<InferInput<TWrapped> | TInput>>);

/**
 * Default value type.
 */
export type DefaultValue<
	TDefault extends
		| Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, null | undefined>
		| DefaultAsync<
				BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
				null | undefined
		  >,
> = TDefault extends DefaultAsync<
	infer TWrapped extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
	infer TInput
>
	? TDefault extends (
			dataset?: Dataset<TInput, never>,
			config?: Config<InferIssue<TWrapped>>,
		) => MaybePromise<InferInput<TWrapped> | TInput>
		? Awaited<ReturnType<TDefault>>
		: TDefault
	: never;
