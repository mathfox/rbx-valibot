import {
	type LooseObjectIssue,
	type LooseObjectSchema,
	type LooseObjectSchemaAsync,
	type ObjectIssue,
	type ObjectSchema,
	type ObjectSchemaAsync,
	type ObjectWithRestIssue,
	type ObjectWithRestSchema,
	type ObjectWithRestSchemaAsync,
	type PicklistIssue,
	type PicklistSchema,
	type StrictObjectIssue,
	type StrictObjectSchema,
	type StrictObjectSchemaAsync,
	picklist,
} from "../../schemas";
import type { BaseIssue, BaseSchema, ErrorMessage, ObjectEntries, ObjectEntriesAsync, UnionToTuple } from "../../types";

/**
 * Schema type.
 */
type Schema =
	| LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined>
	| LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined>
	| ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>
	| ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined>
	| ObjectWithRestSchema<
			ObjectEntries,
			BaseSchema<unknown, unknown, BaseIssue<unknown>>,
			ErrorMessage<ObjectWithRestIssue> | undefined
	  >
	| ObjectWithRestSchemaAsync<
			ObjectEntriesAsync,
			BaseSchema<unknown, unknown, BaseIssue<unknown>>,
			ErrorMessage<ObjectWithRestIssue> | undefined
	  >
	| StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined>
	| StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>;

/**
 * Force tuple type.
 */
type ForceTuple<T> = T extends [string, ...string[]] ? T : [];

/**
 * Object keys type.
 */
type ObjectKeys<TSchema extends Schema> = ForceTuple<UnionToTuple<keyof TSchema["entries"]>>;

/**
 * Creates a picklist schema of object keys.
 *
 * @param schema The object schema.
 *
 * @returns A picklist schema.
 */
export function keyof<const TSchema extends Schema>(schema: TSchema): PicklistSchema<ObjectKeys<TSchema>, undefined>;

/**
 * Creates a picklist schema of object keys.
 *
 * @param schema The object schema.
 * @param message The error message.
 *
 * @returns A picklist schema.
 */
export function keyof<const TSchema extends Schema, const TMessage extends ErrorMessage<PicklistIssue> | undefined>(
	schema: TSchema,
	message: TMessage,
): PicklistSchema<ObjectKeys<TSchema>, TMessage>;

export function keyof(
	schema: Schema,
	message?: ErrorMessage<PicklistIssue>,
): PicklistSchema<ObjectKeys<Schema>, ErrorMessage<PicklistIssue> | undefined> {
	const keys = new Array<defined>();

	for (const [key] of schema.entries as unknown as Map<defined, unknown>) {
		keys.push(key);
	}

	return picklist(keys as ObjectKeys<Schema>, message);
}
