import type {
	LooseObjectIssue,
	LooseObjectSchema,
	NonOptionalIssue,
	NonOptionalSchema,
	ObjectIssue,
	ObjectSchema,
	ObjectWithRestIssue,
	ObjectWithRestSchema,
	StrictObjectIssue,
	StrictObjectSchema,
} from "../../schemas";
import { nonOptional } from "../../schemas/nonOptional";
import type {
	BaseIssue,
	BaseSchema,
	Config,
	Dataset,
	ErrorMessage,
	InferInput,
	InferIssue,
	InferObjectInput,
	InferObjectOutput,
	InferOutput,
	ObjectEntries,
	ObjectKeys,
	SchemaWithoutPipe,
} from "../../types";
import isArray from "../../utils/isArray";

/**
 * Schema type.
 */
type Schema = SchemaWithoutPipe<
	| LooseObjectSchema<ObjectEntries, ErrorMessage<LooseObjectIssue> | undefined>
	| ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>
	| ObjectWithRestSchema<
			ObjectEntries,
			BaseSchema<unknown, unknown, BaseIssue<unknown>>,
			ErrorMessage<ObjectWithRestIssue> | undefined
	  >
	| StrictObjectSchema<ObjectEntries, ErrorMessage<StrictObjectIssue> | undefined>
>;

/**
 * Required entries type.
 */
type RequiredEntries<
	TEntries extends ObjectEntries,
	TKeys extends readonly (keyof TEntries)[] | undefined,
	TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
> = {
	[TKey in keyof TEntries]: TKeys extends readonly (keyof TEntries)[]
		? TKey extends TKeys[number]
			? NonOptionalSchema<TEntries[TKey], TMessage>
			: TEntries[TKey]
		: NonOptionalSchema<TEntries[TKey], TMessage>;
};

/**
 * Schema with required type.
 */
export type SchemaWithRequired<
	TSchema extends Schema,
	TKeys extends ObjectKeys<TSchema> | undefined,
	TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
> = TSchema extends
	| ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined>
	| StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined>
	? Omit<TSchema, "entries" | "_run" | "_types"> & {
			/**
			 * The object entries.
			 */
			readonly entries: RequiredEntries<TEntries, TKeys, TMessage>;
			/**
			 * Parses unknown input.
			 *
			 * @param dataset The input dataset.
			 * @param config The configuration.
			 *
			 * @returns The output dataset.
			 *
			 * @internal
			 */
			_run(
				this: unknown,
				dataset: Dataset<unknown, never>,
				config: Config<InferIssue<TSchema>>,
			): Dataset<InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>>, NonOptionalIssue | InferIssue<TSchema>>;
			/**
			 * Input, output and issue type.
			 *
			 * @internal
			 */
			readonly _types?: {
				readonly input: InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>>;
				readonly output: InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>>;
				readonly issue: NonOptionalIssue | InferIssue<TSchema>;
			};
		}
	: TSchema extends LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined>
		? Omit<TSchema, "entries" | "_run" | "_types"> & {
				/**
				 * The object entries.
				 */
				readonly entries: RequiredEntries<TEntries, TKeys, TMessage>;
				/**
				 * Parses unknown input.
				 *
				 * @param dataset The input dataset.
				 * @param config The configuration.
				 *
				 * @returns The output dataset.
				 *
				 * @internal
				 */
				_run(
					this: unknown,
					dataset: Dataset<unknown, never>,
					config: Config<InferIssue<TSchema>>,
				): Dataset<
					InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
						[key: string]: unknown;
					},
					NonOptionalIssue | InferIssue<TSchema>
				>;
				/**
				 * Input, output and issue type.
				 *
				 * @internal
				 */
				readonly _types?: {
					readonly input: InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>> & {
						[key: string]: unknown;
					};
					readonly output: InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
						[key: string]: unknown;
					};
					readonly issue: NonOptionalIssue | InferIssue<TSchema>;
				};
			}
		: TSchema extends ObjectWithRestSchema<infer TEntries, infer TRest, ErrorMessage<ObjectWithRestIssue> | undefined>
			? Omit<TSchema, "entries" | "_run" | "_types"> & {
					/**
					 * The object entries.
					 */
					readonly entries: RequiredEntries<TEntries, TKeys, TMessage>;
					/**
					 * Parses unknown input.
					 *
					 * @param dataset The input dataset.
					 * @param config The configuration.
					 *
					 * @returns The output dataset.
					 *
					 * @internal
					 */
					_run(
						this: unknown,
						dataset: Dataset<unknown, never>,
						config: Config<InferIssue<TSchema>>,
					): Dataset<
						InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
							[key: string]: InferOutput<TRest>;
						},
						NonOptionalIssue | InferIssue<TSchema>
					>;
					/**
					 * Input, output and issue type.
					 *
					 * @internalgg
					 */
					readonly _types?: {
						readonly input: InferObjectInput<RequiredEntries<TEntries, TKeys, TMessage>> & {
							[key: string]: InferInput<TRest>;
						};
						readonly output: InferObjectOutput<RequiredEntries<TEntries, TKeys, TMessage>> & {
							[key: string]: InferOutput<TRest>;
						};
						readonly issue: NonOptionalIssue | InferIssue<TSchema>;
					};
				}
			: never;

/**
 * Creates a modified copy of an object schema that marks all entries as required.
 *
 * @param schema The schema to modify.
 *
 * @returns An object schema.
 */
export function required<const TSchema extends Schema>(
	schema: TSchema,
): SchemaWithRequired<TSchema, undefined, undefined>;

/**
 * Creates a modified copy of an object schema that marks all entries as required.
 *
 * @param schema The schema to modify.
 * @param message The error message.
 *
 * @returns An object schema.
 */
export function required<
	const TSchema extends Schema,
	const TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
>(schema: TSchema, message: TMessage): SchemaWithRequired<TSchema, undefined, TMessage>;

/**
 * Creates a modified copy of an object schema that marks the selected entries
 * as required.
 *
 * @param schema The schema to modify.
 * @param keys The selected entries.
 *
 * @returns An object schema.
 */
export function required<const TSchema extends Schema, const TKeys extends ObjectKeys<TSchema>>(
	schema: TSchema,
	keys: TKeys,
): SchemaWithRequired<TSchema, TKeys, undefined>;

/**
 * Creates a modified copy of an object schema that marks the selected entries
 * as required.
 *
 * @param schema The schema to modify.
 * @param keys The selected entries.
 * @param message The error message.
 *
 * @returns An object schema.
 */
export function required<
	const TSchema extends Schema,
	const TKeys extends ObjectKeys<TSchema>,
	const TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
>(schema: TSchema, keys: TKeys, message: TMessage): SchemaWithRequired<TSchema, TKeys, TMessage>;

export function required(
	schema: Schema,
	arg2?: ErrorMessage<NonOptionalIssue> | ObjectKeys<Schema>,
	arg3?: ErrorMessage<NonOptionalIssue>,
): unknown {
	// Get keys and message from arguments
	const keys = isArray(arg2) ? arg2 : undefined;
	const message = (isArray(arg2) ? arg3 : arg2) as ErrorMessage<NonOptionalIssue> | undefined;

	// Create modified object entries
	const entries: RequiredEntries<ObjectEntries, ObjectKeys<Schema>, ErrorMessage<NonOptionalIssue> | undefined> = {};
	for (const [key] of schema.entries as unknown as Map<string, unknown>) {
		(entries as Record<string, unknown>)[key] =
			!keys || keys.includes(key) ? nonOptional(schema.entries[key], message) : schema.entries[key];
	}

	// Return modified copy of schema
	return { ...schema, entries };
}
