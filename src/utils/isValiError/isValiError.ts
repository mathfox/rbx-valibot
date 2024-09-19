import type { BaseIssue, BaseSchema, BaseSchemaAsync } from "../../types";
import { ValiError } from "../../utils";

/**
 * A type guard to check if an error is a ValiError.
 *
 * @param error The error to check.
 *
 * @returns Whether its a ValiError.
 */
export function isValiError<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(errorValue: unknown): errorValue is ValiError<TSchema> {
	return errorValue instanceof ValiError;
}
