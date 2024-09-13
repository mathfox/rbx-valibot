import type { BaseIssue } from "./issue";
import type { BaseMetadata } from "./metadata";
import type { BaseSchema, BaseSchemaAsync } from "./schema";
import type { BaseTransformation, BaseTransformationAsync } from "./transformation";
import type { BaseValidation, BaseValidationAsync } from "./validation";

/**
 * Infer input type.
 */
export type InferInput<
	TItem extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
		| BaseValidation<any, unknown, BaseIssue<unknown>>
		| BaseValidationAsync<any, unknown, BaseIssue<unknown>>
		| BaseTransformation<any, unknown, BaseIssue<unknown>>
		| BaseTransformationAsync<any, unknown, BaseIssue<unknown>>
		| BaseMetadata<any>,
> = NonNullable<TItem["_types"]>["input"];

/**
 * Infer output type.
 */
export type InferOutput<
	TItem extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
		| BaseValidation<any, unknown, BaseIssue<unknown>>
		| BaseValidationAsync<any, unknown, BaseIssue<unknown>>
		| BaseTransformation<any, unknown, BaseIssue<unknown>>
		| BaseTransformationAsync<any, unknown, BaseIssue<unknown>>
		| BaseMetadata<any>,
> = NonNullable<TItem["_types"]>["output"];

/**
 * Infer issue type.
 */
export type InferIssue<
	TItem extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
		| BaseValidation<any, unknown, BaseIssue<unknown>>
		| BaseValidationAsync<any, unknown, BaseIssue<unknown>>
		| BaseTransformation<any, unknown, BaseIssue<unknown>>
		| BaseTransformationAsync<any, unknown, BaseIssue<unknown>>
		| BaseMetadata<any>,
> = NonNullable<TItem["_types"]>["issue"];
