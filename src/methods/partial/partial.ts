import type {
	LooseObjectIssue,
	LooseObjectSchema,
	ObjectIssue,
	ObjectSchema,
	ObjectWithRestIssue,
	ObjectWithRestSchema,
	OptionalSchema,
	StrictObjectIssue,
	StrictObjectSchema,
} from "../../schemas";
import { optional } from "../../schemas/optional";
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
 * Partial entries type.
 */
type PartialEntries<TEntries extends ObjectEntries, TKeys extends readonly (keyof TEntries)[] | undefined> = {
	[TKey in keyof TEntries]: TKeys extends readonly (keyof TEntries)[]
		? TKey extends TKeys[number]
			? OptionalSchema<TEntries[TKey], never>
			: TEntries[TKey]
		: OptionalSchema<TEntries[TKey], never>;
};

/**
 * Schema with partial type.
 */
export type SchemaWithPartial<TSchema extends Schema, TKeys extends ObjectKeys<TSchema> | undefined> = TSchema extends
	| ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined>
	| StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined>
	? Omit<TSchema, "entries" | "_run" | "_types"> & {
			/**
			 * The object entries.
			 */
			readonly entries: PartialEntries<TEntries, TKeys>;
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
			readonly _run: (
				this: unknown,
				dataset: Dataset<unknown, never>,
				config: Config<BaseIssue<unknown>>,
			) => Dataset<InferObjectOutput<PartialEntries<TEntries, TKeys>>, InferIssue<TSchema>>;
			/**
			 * Input, output and issue type.
			 *
			 * @internal
			 */
			readonly _types?: {
				readonly input: InferObjectInput<PartialEntries<TEntries, TKeys>>;
				readonly output: InferObjectOutput<PartialEntries<TEntries, TKeys>>;
				readonly issue: InferIssue<TSchema>;
			};
		}
	: TSchema extends LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined>
		? Omit<TSchema, "entries" | "_run" | "_types"> & {
				/**
				 * The object entries.
				 */
				readonly entries: PartialEntries<TEntries, TKeys>;
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
				readonly _run: (
					this: unknown,
					dataset: Dataset<unknown, never>,
					config: Config<BaseIssue<unknown>>,
				) => Dataset<
					InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
						[key: string]: unknown;
					},
					InferIssue<TSchema>
				>;
				/**
				 * Input, output and issue type.
				 *
				 * @internal
				 */
				readonly _types?: {
					readonly input: InferObjectInput<PartialEntries<TEntries, TKeys>> & {
						[key: string]: unknown;
					};
					readonly output: InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
						[key: string]: unknown;
					};
					readonly issue: InferIssue<TSchema>;
				};
			}
		: TSchema extends ObjectWithRestSchema<infer TEntries, infer TRest, ErrorMessage<ObjectWithRestIssue> | undefined>
			? Omit<TSchema, "entries" | "_run" | "_types"> & {
					/**
					 * The object entries.
					 */
					readonly entries: PartialEntries<TEntries, TKeys>;
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
					readonly _run: (
						this: unknown,
						dataset: Dataset<unknown, never>,
						config: Config<BaseIssue<unknown>>,
					) => Dataset<
						InferObjectOutput<PartialEntries<TEntries, TKeys>> & {
							[key: string]: InferOutput<TRest>;
						},
						InferIssue<TSchema>
					>;
					/**
					 * Input, output and issue type.
					 *
					 * @internal
					 */
					readonly _types?: {
						readonly input: InferObjectInput<PartialEntries<TEntries, TKeys>> & {
							[key: string]: InferInput<TRest>;
						};
						readonly output: InferObjectOutput<PartialEntries<TEntries, TKeys>> & { [key: string]: InferOutput<TRest> };
						readonly issue: InferIssue<TSchema>;
					};
				}
			: never;

/**
 * Creates a modified copy of an object schema that marks all entries as optional.
 *
 * @param schema The schema to modify.
 *
 * @returns An object schema.
 */
export function partial<const TSchema extends Schema>(schema: TSchema): SchemaWithPartial<TSchema, undefined>;

/**
 * Creates a modified copy of an object schema that marks the selected entries
 * as optional.
 *
 * @param schema The schema to modify.
 * @param keys The selected entries.
 *
 * @returns An object schema.
 */
export function partial<const TSchema extends Schema, const TKeys extends ObjectKeys<TSchema>>(
	schema: TSchema,
	keys: TKeys,
): SchemaWithPartial<TSchema, TKeys>;

export function partial(
	schema: Schema,
	keys?: ObjectKeys<Schema>,
): SchemaWithPartial<Schema, ObjectKeys<Schema> | undefined> {
	// Create modified object entries
	const entries: PartialEntries<ObjectEntries, ObjectKeys<Schema>> = {};

	for (const [key] of schema.entries as unknown as Map<string, unknown>) {
		(entries as Record<string, unknown>)[key] =
			!keys || keys.includes(key) ? optional(schema.entries[key]) : schema.entries[key];
	}

	// Return modified copy of schema
	return { ...schema, entries } as SchemaWithPartial<Schema, ObjectKeys<Schema> | undefined>;
}
