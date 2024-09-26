import entries from "@rbxts/phantom/src/Shared/entries";
import type {
	LooseObjectIssue,
	LooseObjectSchema,
	LooseObjectSchemaAsync,
	LooseTupleIssue,
	LooseTupleSchema,
	LooseTupleSchemaAsync,
	ObjectIssue,
	ObjectSchema,
	ObjectSchemaAsync,
	ObjectWithRestIssue,
	ObjectWithRestSchema,
	ObjectWithRestSchemaAsync,
	StrictObjectIssue,
	StrictObjectSchema,
	StrictObjectSchemaAsync,
	StrictTupleIssue,
	StrictTupleSchema,
	StrictTupleSchemaAsync,
	TupleIssue,
	TupleSchema,
	TupleSchemaAsync,
	TupleWithRestIssue,
	TupleWithRestSchema,
	TupleWithRestSchemaAsync,
} from "../../schemas";
import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	ErrorMessage,
	ObjectEntries,
	ObjectEntriesAsync,
	TupleItems,
	TupleItemsAsync,
} from "../../types";
import { getFallback } from "../getFallback";
import type { InferFallbacks } from "./types";

/**
 * Returns the fallback values of the schema.
 *
 * Hint: The difference to `getFallback` is that for object and tuple schemas
 * this function recursively returns the fallback values of the subschemas
 * instead of `undefined`.
 *
 * @param schema The schema to get them from.
 *
 * @returns The fallback values.
 */
export async function getFallbacksAsync<
	const TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
		| LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined>
		| LooseObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<LooseObjectIssue> | undefined>
		| LooseTupleSchema<TupleItems, ErrorMessage<LooseTupleIssue> | undefined>
		| LooseTupleSchemaAsync<TupleItemsAsync, ErrorMessage<LooseTupleIssue> | undefined>
		| ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>
		| ObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<ObjectIssue> | undefined>
		| ObjectWithRestSchema<
				ObjectEntries,
				BaseSchema<unknown, unknown, BaseIssue<unknown>>,
				ErrorMessage<ObjectWithRestIssue> | undefined
		  >
		| ObjectWithRestSchemaAsync<
				ObjectEntriesAsync,
				BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
				ErrorMessage<ObjectWithRestIssue> | undefined
		  >
		| StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined>
		| StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>
		| StrictTupleSchema<TupleItems, ErrorMessage<StrictTupleIssue> | undefined>
		| StrictTupleSchemaAsync<TupleItemsAsync, ErrorMessage<StrictTupleIssue> | undefined>
		| TupleSchema<TupleItems, ErrorMessage<TupleIssue> | undefined>
		| TupleSchemaAsync<TupleItemsAsync, ErrorMessage<TupleIssue> | undefined>
		| TupleWithRestSchema<
				TupleItems,
				BaseSchema<unknown, unknown, BaseIssue<unknown>>,
				ErrorMessage<TupleWithRestIssue> | undefined
		  >
		| TupleWithRestSchemaAsync<
				TupleItemsAsync,
				BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
				ErrorMessage<TupleWithRestIssue> | undefined
		  >,
>(schema: TSchema): Promise<InferFallbacks<TSchema>> {
	// If it is an object schema, return fallbacks of entries
	if ("entries" in schema) {
		const object: Record<string, unknown> = {};

		for (const [key, value] of (await Promise.all(
			entries(schema.entries).map(async ([key, value]) => [key, await getFallbacksAsync(value)]),
		)) as unknown as Map<string, unknown>) {
		}

		return object as InferFallbacks<TSchema>;
	}

	// If it is a tuple schema, return fallbacks of items
	if ("items" in schema) {
		return Promise.all(schema.items.map(getFallbacksAsync)) as Promise<InferFallbacks<TSchema>>;
	}

	// Otherwise, return fallback or `undefined`
	return getFallback(schema) as Promise<InferFallbacks<TSchema>>;
}
