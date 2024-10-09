import type { Prettify } from "valibot";
import type { ReadonlyAction } from "../actions";
import type { SchemaWithPipe, SchemaWithPipeAsync } from "../methods";
import type {
	LooseObjectIssue,
	LooseObjectSchema,
	LooseObjectSchemaAsync,
	ObjectIssue,
	ObjectSchema,
	ObjectSchemaAsync,
	ObjectWithRestIssue,
	ObjectWithRestSchema,
	ObjectWithRestSchemaAsync,
	OptionalSchema,
	OptionalSchemaAsync,
	StrictObjectIssue,
	StrictObjectSchema,
	StrictObjectSchemaAsync,
} from "../schemas";
import type { InferInput, InferIssue, InferOutput } from "./infer";
import type { BaseIssue } from "./issue";
import type { ErrorMessage } from "./other";
import type { BaseSchema, BaseSchemaAsync } from "./schema";
import type { MarkOptional, MaybeReadonly } from "./utils";

/**
 * Object entries type.
 */
export interface ObjectEntries {
	[key: string]: BaseSchema<unknown, unknown, BaseIssue<unknown>>;
}

/**
 * Object entries async type.
 */
export interface ObjectEntriesAsync {
	[key: string]:
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>;
}

/**
 * Object keys type.
 */
export type ObjectKeys<
	TSchema extends
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
				BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
				ErrorMessage<ObjectWithRestIssue> | undefined
		  >
		| StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined>
		| StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>,
> = MaybeReadonly<[keyof TSchema["entries"], ...(keyof TSchema["entries"])[]]>;

/**
 * Question mark schema type.
 *
 * TODO: Document that for simplicity and bundle size, we currently do not
 * distinguish between `undefined` and missing keys when using `optional` and
 * `nullish`.
 */
type QuestionMarkSchema =
	| OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, unknown>
	| OptionalSchemaAsync<
			BaseSchema<unknown, unknown, BaseIssue<unknown>> | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
			unknown
	  >;

/**
 * Has default type.
 */
type HasDefault<TSchema extends QuestionMarkSchema> = [TSchema["default"]] extends [never] ? false : true;

/**
 * Exact optional input type.
 */
type ExactOptionalInput<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = TSchema extends OptionalSchema<infer TWrapped, never> | OptionalSchemaAsync<infer TWrapped, never>
	? ExactOptionalInput<TWrapped>
	: InferInput<TSchema>;

/**
 * Exact optional output type.
 */
type ExactOptionalOutput<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = TSchema extends OptionalSchema<infer TWrapped, never> | OptionalSchemaAsync<infer TWrapped, never>
	? HasDefault<TSchema> extends true
		? InferOutput<TSchema>
		: ExactOptionalOutput<TWrapped>
	: InferOutput<TSchema>;

/**
 * Infer entries input type.
 */
type InferEntriesInput<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
	-readonly [TKey in keyof TEntries]: ExactOptionalInput<TEntries[TKey]>;
};

/**
 * Infer entries output type.
 */
type InferEntriesOutput<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
	-readonly [TKey in keyof TEntries]: ExactOptionalOutput<TEntries[TKey]>;
};

/**
 * Optional input keys type.
 */
type OptionalInputKeys<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
	[TKey in keyof TEntries]: TEntries[TKey] extends QuestionMarkSchema ? TKey : never;
}[keyof TEntries];

/**
 * Optional output keys type.
 */
type OptionalOutputKeys<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
	[TKey in keyof TEntries]: TEntries[TKey] extends QuestionMarkSchema
		? undefined extends InferOutput<TEntries[TKey]>
			? HasDefault<TEntries[TKey]> extends false
				? TKey
				: never
			: never
		: never;
}[keyof TEntries];

/**
 * Input with question marks type.
 */
type InputWithQuestionMarks<
	TEntries extends ObjectEntries | ObjectEntriesAsync,
	TObject extends InferEntriesInput<TEntries> | InferEntriesOutput<TEntries>,
> = MarkOptional<TObject, OptionalInputKeys<TEntries>>;

/**
 * Output with question marks type.
 */
type OutputWithQuestionMarks<
	TEntries extends ObjectEntries | ObjectEntriesAsync,
	TObject extends InferEntriesInput<TEntries> | InferEntriesOutput<TEntries>,
> = MarkOptional<TObject, OptionalOutputKeys<TEntries>>;

/**
 * Readonly output keys type.
 */
type ReadonlyOutputKeys<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
	[TKey in keyof TEntries]: TEntries[TKey] extends SchemaWithPipe<infer TPipe> | SchemaWithPipeAsync<infer TPipe>
		? ReadonlyAction<any> extends TPipe[number]
			? TKey
			: never
		: never;
}[keyof TEntries];

/**
 * Output with readonly type.
 */
type OutputWithReadonly<
	TEntries extends ObjectEntries | ObjectEntriesAsync,
	TObject extends OutputWithQuestionMarks<TEntries, InferEntriesOutput<TEntries>>,
> = Readonly<TObject> & Pick<TObject, Exclude<keyof TObject, ReadonlyOutputKeys<TEntries>>>;

/**
 * Infer object input type.
 */
export type InferObjectInput<TEntries extends ObjectEntries | ObjectEntriesAsync> = Prettify<
	InputWithQuestionMarks<TEntries, InferEntriesInput<TEntries>>
>;

/**
 * Infer object output type.
 */
export type InferObjectOutput<TEntries extends ObjectEntries | ObjectEntriesAsync> = Prettify<
	OutputWithReadonly<TEntries, OutputWithQuestionMarks<TEntries, InferEntriesOutput<TEntries>>>
>;

/**
 * Infer object issue type.
 */
export type InferObjectIssue<TEntries extends ObjectEntries | ObjectEntriesAsync> = InferIssue<
	TEntries[keyof TEntries]
>;
