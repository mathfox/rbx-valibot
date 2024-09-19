import type {
	NonOptionalIssue,
	NonOptionalSchema,
	NonOptionalSchemaAsync,
	OptionalSchema,
	OptionalSchemaAsync,
	UndefinedableSchema,
	UndefinedableSchemaAsync,
} from "../../schemas";
import type { BaseIssue, BaseSchema, BaseSchemaAsync, ErrorMessage } from "../../types";

/**
 * Unwraps the wrapped schema.
 *
 * @param schema The schema to be unwrapped.
 *
 * @returns The unwrapped schema.
 */
export function unwrap<
	TSchema extends
		| NonOptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, ErrorMessage<NonOptionalIssue> | undefined>
		| NonOptionalSchemaAsync<
				BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
				ErrorMessage<NonOptionalIssue> | undefined
		  >
		| OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>
		| OptionalSchemaAsync<
				BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
				unknown
		  >
		| UndefinedableSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>
		| UndefinedableSchemaAsync<
				BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
				unknown
		  >,
>(schema: TSchema): TSchema["wrapped"] {
	return schema.wrapped;
}
