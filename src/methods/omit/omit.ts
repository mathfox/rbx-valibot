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
	StrictObjectIssue,
	StrictObjectSchema,
	StrictObjectSchemaAsync,
} from "../../schemas";
import type {
	BaseIssue,
	BaseSchema,
	BaseSchemaAsync,
	Config,
	ErrorMessage,
	InferInput,
	InferIssue,
	InferObjectInput,
	InferObjectIssue,
	InferObjectOutput,
	InferOutput,
	ObjectEntries,
	ObjectEntriesAsync,
	ObjectKeys,
	OutputDataset,
	SchemaWithoutPipe,
	UnknownDataset,
} from "../../types";

/**
 * Schema type.
 */
type Schema = SchemaWithoutPipe<
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
	| StrictObjectSchemaAsync<ObjectEntriesAsync, ErrorMessage<StrictObjectIssue> | undefined>
>;

/**
 * Schema with omit type.
 */
export type SchemaWithOmit<TSchema extends Schema, TKeys extends ObjectKeys<TSchema>> = TSchema extends
	| ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined>
	| StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined>
	? Omit<TSchema, "entries" | "_run" | "_types"> & {
			/**
			 * The object entries.
			 */
			readonly entries: Omit<TEntries, TKeys[number]>;
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
				dataset: UnknownDataset,
				config: Config<BaseIssue<unknown>>,
			) => OutputDataset<
				InferObjectOutput<Omit<TEntries, TKeys[number]>>,
				Extract<InferIssue<TSchema>, { type: TSchema["type"] }> | InferObjectIssue<Omit<TEntries, TKeys[number]>>
			>;
			/**
			 * Input, output and issue type.
			 *
			 * @internal
			 */
			readonly _types?:
				| {
						readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>>;
						readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>>;
						readonly issue:
							| Extract<InferIssue<TSchema>, { type: TSchema["type"] }>
							| InferObjectIssue<Omit<TEntries, TKeys[number]>>;
				  }
				| undefined;
		}
	: TSchema extends
				| ObjectSchemaAsync<infer TEntries, ErrorMessage<ObjectIssue> | undefined>
				| StrictObjectSchemaAsync<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined>
		? Omit<TSchema, "entries" | "_run" | "_types"> & {
				/**
				 * The object entries.
				 */
				readonly entries: Omit<TEntries, TKeys[number]>;
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
					dataset: UnknownDataset,
					config: Config<BaseIssue<unknown>>,
				) => Promise<
					OutputDataset<
						InferObjectOutput<Omit<TEntries, TKeys[number]>>,
						Extract<InferIssue<TSchema>, { type: TSchema["type"] }> | InferObjectIssue<Omit<TEntries, TKeys[number]>>
					>
				>;
				/**
				 * Input, output and issue type.
				 *
				 * @internal
				 */
				readonly _types?:
					| {
							readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>>;
							readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>>;
							readonly issue:
								| Extract<InferIssue<TSchema>, { type: TSchema["type"] }>
								| InferObjectIssue<Omit<TEntries, TKeys[number]>>;
					  }
					| undefined;
			}
		: TSchema extends LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined>
			? Omit<TSchema, "entries" | "_run" | "_types"> & {
					/**
					 * The object entries.
					 */
					readonly entries: Omit<TEntries, TKeys[number]>;
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
						dataset: UnknownDataset,
						config: Config<BaseIssue<unknown>>,
					) => OutputDataset<
						InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
							[key: string]: unknown;
						},
						Extract<InferIssue<TSchema>, { type: TSchema["type"] }> | InferObjectIssue<Omit<TEntries, TKeys[number]>>
					>;
					/**
					 * Input, output and issue type.
					 *
					 * @internal
					 */
					readonly _types?:
						| {
								readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>> & {
									[key: string]: unknown;
								};
								readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
									[key: string]: unknown;
								};
								readonly issue:
									| Extract<InferIssue<TSchema>, { type: TSchema["type"] }>
									| InferObjectIssue<Omit<TEntries, TKeys[number]>>;
						  }
						| undefined;
				}
			: TSchema extends LooseObjectSchemaAsync<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined>
				? Omit<TSchema, "entries" | "_run" | "_types"> & {
						/**
						 * The object entries.
						 */
						readonly entries: Omit<TEntries, TKeys[number]>;
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
							dataset: UnknownDataset,
							config: Config<BaseIssue<unknown>>,
						) => Promise<
							OutputDataset<
								InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
									[key: string]: unknown;
								},
								| Extract<InferIssue<TSchema>, { type: TSchema["type"] }>
								| InferObjectIssue<Omit<TEntries, TKeys[number]>>
							>
						>;
						/**
						 * Input, output and issue type.
						 *
						 * @internal
						 */
						readonly _types?:
							| {
									readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>> & {
										[key: string]: unknown;
									};
									readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
										[key: string]: unknown;
									};
									readonly issue:
										| Extract<InferIssue<TSchema>, { type: TSchema["type"] }>
										| InferObjectIssue<Omit<TEntries, TKeys[number]>>;
							  }
							| undefined;
					}
				: TSchema extends ObjectWithRestSchema<
							infer TEntries,
							BaseSchema<unknown, unknown, BaseIssue<unknown>>,
							ErrorMessage<ObjectWithRestIssue> | undefined
						>
					? Omit<TSchema, "entries" | "_run" | "_types"> & {
							/**
							 * The object entries.
							 */
							readonly entries: Omit<TEntries, TKeys[number]>;
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
								dataset: UnknownDataset,
								config: Config<BaseIssue<unknown>>,
							) => OutputDataset<
								InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
									[key: string]: InferOutput<TSchema["rest"]>;
								},
								| Extract<InferIssue<TSchema>, { type: TSchema["type"] }>
								| InferObjectIssue<Omit<TEntries, TKeys[number]>>
								| InferIssue<TSchema["rest"]>
							>;
							/**
							 * Input, output and issue type.
							 *
							 * @internal
							 */
							readonly _types?:
								| {
										readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>> & {
											[key: string]: InferInput<TSchema["rest"]>;
										};
										readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
											[key: string]: InferOutput<TSchema["rest"]>;
										};
										readonly issue:
											| Extract<InferIssue<TSchema>, { type: TSchema["type"] }>
											| InferObjectIssue<Omit<TEntries, TKeys[number]>>
											| InferIssue<TSchema["rest"]>;
								  }
								| undefined;
						}
					: TSchema extends ObjectWithRestSchemaAsync<
								infer TEntries,
								BaseSchema<unknown, unknown, BaseIssue<unknown>>,
								ErrorMessage<ObjectWithRestIssue> | undefined
							>
						? Omit<TSchema, "entries" | "_run" | "_types"> & {
								/**
								 * The object entries.
								 */
								readonly entries: Omit<TEntries, TKeys[number]>;
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
									dataset: UnknownDataset,
									config: Config<BaseIssue<unknown>>,
								) => Promise<
									OutputDataset<
										InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
											[key: string]: InferOutput<TSchema["rest"]>;
										},
										| Extract<InferIssue<TSchema>, { type: TSchema["type"] }>
										| InferObjectIssue<Omit<TEntries, TKeys[number]>>
										| InferIssue<TSchema["rest"]>
									>
								>;
								/**
								 * Input, output and issue type.
								 *
								 * @internal
								 */
								readonly _types?:
									| {
											readonly input: InferObjectInput<Omit<TEntries, TKeys[number]>> & {
												[key: string]: InferInput<TSchema["rest"]>;
											};
											readonly output: InferObjectOutput<Omit<TEntries, TKeys[number]>> & {
												[key: string]: InferOutput<TSchema["rest"]>;
											};
											readonly issue:
												| Extract<InferIssue<TSchema>, { type: TSchema["type"] }>
												| InferObjectIssue<Omit<TEntries, TKeys[number]>>
												| InferIssue<TSchema["rest"]>;
									  }
									| undefined;
							}
						: never;

/**
 * Creates a modified copy of an object schema that does not contain the
 * selected entries.
 *
 * @param schema The schema to omit from.
 * @param keys The selected entries.
 *
 * @returns An object schema.
 */
export function omit<const TSchema extends Schema, const TKeys extends ObjectKeys<TSchema>>(
	schema: TSchema,
	keys: TKeys,
): SchemaWithOmit<TSchema, TKeys> {
	// Create modified object entries
	const entries = table.clone(schema.entries) as unknown as Map<string, unknown>;

	for (const key of keys) {
		entries.delete(key as string);
	}

	// Return modified copy of schema
	return { ...schema, entries } as unknown as SchemaWithOmit<TSchema, TKeys>;
}
