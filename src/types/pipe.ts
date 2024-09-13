import type { BaseIssue } from "./issue";
import type { BaseMetadata } from "./metadata";
import type { BaseSchema, BaseSchemaAsync } from "./schema";
import type { BaseTransformation, BaseTransformationAsync } from "./transformation";
import type { BaseValidation, BaseValidationAsync } from "./validation";

/**
 * Pipe action type.
 */
export type PipeAction<TInput, TOutput, TIssue extends BaseIssue<unknown>> =
	| BaseValidation<TInput, TOutput, TIssue>
	| BaseTransformation<TInput, TOutput, TIssue>
	| BaseMetadata<TInput>;

/**
 * Pipe action async type.
 */
export type PipeActionAsync<TInput, TOutput, TIssue extends BaseIssue<unknown>> =
	| BaseValidationAsync<TInput, TOutput, TIssue>
	| BaseTransformationAsync<TInput, TOutput, TIssue>;

/**
 * Pipe item type.
 */
export type PipeItem<TInput, TOutput, TIssue extends BaseIssue<unknown>> =
	| BaseSchema<TInput, TOutput, TIssue>
	| PipeAction<TInput, TOutput, TIssue>;

/**
 * Pipe item async type.
 */
export type PipeItemAsync<TInput, TOutput, TIssue extends BaseIssue<unknown>> =
	| BaseSchemaAsync<TInput, TOutput, TIssue>
	| PipeActionAsync<TInput, TOutput, TIssue>;

/**
 * Schema without pipe type.
 */
export type SchemaWithoutPipe<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = TSchema & { pipe?: never };
