import type { SchemaWithPipe, SchemaWithPipeAsync } from "../methods";
import type {
	ArrayIssue,
	ArraySchema,
	ArraySchemaAsync,
	IntersectIssue,
	IntersectSchema,
	IntersectSchemaAsync,
	LazySchema,
	LazySchemaAsync,
	LooseObjectIssue,
	LooseObjectSchema,
	LooseObjectSchemaAsync,
	LooseTupleIssue,
	LooseTupleSchema,
	LooseTupleSchemaAsync,
	MapIssue,
	MapSchema,
	MapSchemaAsync,
	NonOptionalIssue,
	NonOptionalSchema,
	NonOptionalSchemaAsync,
	ObjectIssue,
	ObjectSchema,
	ObjectSchemaAsync,
	ObjectWithRestIssue,
	ObjectWithRestSchema,
	ObjectWithRestSchemaAsync,
	OptionalSchema,
	OptionalSchemaAsync,
	RecordIssue,
	RecordSchema,
	RecordSchemaAsync,
	SetIssue,
	SetSchema,
	SetSchemaAsync,
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
	UndefinedableSchema,
	UndefinedableSchemaAsync,
	UnionIssue,
	UnionSchema,
	UnionSchemaAsync,
	VariantIssue,
	VariantSchema,
	VariantSchemaAsync,
} from "../schemas";
import type { Config } from "./config";
import type { InferInput } from "./infer";
import type { ObjectEntries, ObjectEntriesAsync } from "./object";
import type { Default, DefaultAsync, ErrorMessage } from "./other";
import type { BaseSchema, BaseSchemaAsync } from "./schema";
import type { TupleItems, TupleItemsAsync } from "./tuple";
import type { FirstTupleItem, MaybeReadonly } from "./utils";

/**
 * Array path item type.
 */
export interface ArrayPathItem {
	/**
	 * The path item type.
	 */
	readonly type: "array";
	/**
	 * The path item origin.
	 */
	readonly origin: "value";
	/**
	 * The path item input.
	 */
	readonly input: MaybeReadonly<unknown[]>;
	/**
	 * The path item key.
	 */
	readonly key: number;
	/**
	 * The path item value.
	 */
	readonly value: unknown;
}

/**
 * Map path item type.
 */
export interface MapPathItem {
	/**
	 * The path item type.
	 */
	readonly type: "map";
	/**
	 * The path item origin.
	 */
	readonly origin: "key" | "value";
	/**
	 * The path item input.
	 */
	readonly input: Map<unknown, unknown>;
	/**
	 * The path item key.
	 */
	readonly key: unknown;
	/**
	 * The path item value.
	 */
	readonly value: unknown;
}

/**
 * Object path item type.
 */
export interface ObjectPathItem {
	/**
	 * The path item type.
	 */
	readonly type: "object";
	/**
	 * The path item origin.
	 */
	readonly origin: "key" | "value";
	/**
	 * The path item input.
	 */
	readonly input: Record<string, unknown>;
	/**
	 * The path item key.
	 */
	readonly key: string;
	/**
	 * The path item value.
	 */
	readonly value: unknown;
}

/**
 * Set path item type.
 */
export interface SetPathItem {
	/**
	 * The path item type.
	 */
	readonly type: "set";
	/**
	 * The path item origin.
	 */
	readonly origin: "value";
	/**
	 * The path item input.
	 */
	readonly input: Set<unknown>;
	/**
	 * The path item key.
	 */
	readonly key: undefined;
	/**
	 * The path item key.
	 */
	readonly value: unknown;
}

/**
 * Unknown path item type.
 */
export interface UnknownPathItem {
	/**
	 * The path item type.
	 */
	readonly type: "unknown";
	/**
	 * The path item origin.
	 */
	readonly origin: "key" | "value";
	/**
	 * The path item input.
	 */
	readonly input: unknown;
	/**
	 * The path item key.
	 */
	readonly key: unknown;
	/**
	 * The path item value.
	 */
	readonly value: unknown;
}

/**
 * Issue path item type.
 *
 * TODO: Document that the input of the path may be different from the input of
 * the issue.
 */
export type IssuePathItem = ArrayPathItem | MapPathItem | ObjectPathItem | SetPathItem | UnknownPathItem;

/**
 * Base issue type.
 */
export interface BaseIssue<TInput> extends Config<BaseIssue<TInput>> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema" | "validation" | "transformation";
	/**
	 * The issue type.
	 */
	readonly type: string;
	/**
	 * The raw input data.
	 */
	readonly input: TInput;
	/**
	 * The expected property.
	 */
	readonly expected: string | undefined;
	/**
	 * The received property.
	 */
	readonly received: string;
	/**
	 * The error message.
	 */
	readonly message: string;
	/**
	 * The input requirement.
	 */
	readonly requirement?: unknown | undefined;
	/**
	 * The issue path.
	 *
	 * TODO: Investigate if it is possible to make the path type safe based on the
	 * input.
	 */
	readonly path?: [IssuePathItem, ...IssuePathItem[]] | undefined;
	/**
	 * The sub issues.
	 */
	readonly issues?: [BaseIssue<TInput>, ...BaseIssue<TInput>[]] | undefined;
}

/**
 * Generic issue type.
 */
export interface GenericIssue<TInput = unknown> extends BaseIssue<TInput> {}

/**
 * Dot path type.
 */
type DotPath<
	TKey extends string | number | symbol,
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> = TKey extends string | number ? `${TKey}` | `${TKey}.${IssueDotPath<TSchema>}` : never;

/**
 * Object path type.
 */
type ObjectPath<TEntries extends ObjectEntries | ObjectEntriesAsync> = {
	[TKey in keyof TEntries]: DotPath<TKey, TEntries[TKey]>;
}[keyof TEntries];

/**
 * Tuple keys type.
 */
type TupleKeys<TItems extends TupleItems | TupleItemsAsync> = Exclude<keyof TItems, keyof []>;

/**
 * Tuple path type.
 */
type TuplePath<TItems extends TupleItems | TupleItemsAsync> = {
	[TKey in TupleKeys<TItems>]: TItems[TKey] extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>
		? DotPath<TKey, TItems[TKey]>
		: never;
}[TupleKeys<TItems>];

/**
 * Issue dot path type.
 */
export type IssueDotPath<
	TSchema extends
		| BaseSchema<unknown, unknown, BaseIssue<unknown>>
		| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
> =
	// Pipe (sync)
	TSchema extends SchemaWithPipe<infer TPipe>
		? IssueDotPath<FirstTupleItem<TPipe>>
		: // Pipe (async)
			TSchema extends SchemaWithPipeAsync<infer TPipe>
			? IssueDotPath<FirstTupleItem<TPipe>>
			: // Array (sync)
				TSchema extends ArraySchema<infer TItem, ErrorMessage<ArrayIssue> | undefined>
				? DotPath<number, TItem>
				: // Array (async)
					TSchema extends ArraySchemaAsync<infer TItem, ErrorMessage<ArrayIssue> | undefined>
					? DotPath<number, TItem>
					: // Intersect, Union or Variant (sync)
						TSchema extends
								| IntersectSchema<infer TOptions, ErrorMessage<IntersectIssue> | undefined>
								| UnionSchema<infer TOptions, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined>
								| VariantSchema<string, infer TOptions, ErrorMessage<VariantIssue> | undefined>
						? IssueDotPath<TOptions[number]>
						: // Intersect, Union or Variant (async)
							TSchema extends
									| IntersectSchemaAsync<infer TOptions, ErrorMessage<IntersectIssue> | undefined>
									| UnionSchemaAsync<infer TOptions, ErrorMessage<UnionIssue<BaseIssue<unknown>>> | undefined>
									| VariantSchemaAsync<string, infer TOptions, ErrorMessage<VariantIssue> | undefined>
							? IssueDotPath<TOptions[number]>
							: // Map or Record (sync)
								TSchema extends
										| MapSchema<infer TKey, infer TValue, ErrorMessage<MapIssue> | undefined>
										| RecordSchema<infer TKey, infer TValue, ErrorMessage<RecordIssue> | undefined>
								? DotPath<InferInput<TKey>, TValue>
								: // Map or Record (async)
									TSchema extends
											| MapSchemaAsync<infer TKey, infer TValue, ErrorMessage<MapIssue> | undefined>
											| RecordSchemaAsync<infer TKey, infer TValue, ErrorMessage<RecordIssue> | undefined>
									? DotPath<InferInput<TKey>, TValue>
									: // Object (sync)
										TSchema extends
												| LooseObjectSchema<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined>
												| ObjectSchema<infer TEntries, ErrorMessage<ObjectIssue> | undefined>
												| StrictObjectSchema<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined>
										? ObjectPath<TEntries>
										: // Object (async)
											TSchema extends
													| LooseObjectSchemaAsync<infer TEntries, ErrorMessage<LooseObjectIssue> | undefined>
													| ObjectSchemaAsync<infer TEntries, ErrorMessage<ObjectIssue> | undefined>
													| StrictObjectSchemaAsync<infer TEntries, ErrorMessage<StrictObjectIssue> | undefined>
											? ObjectPath<TEntries>
											: // Object with Rest (sync)
												TSchema extends ObjectWithRestSchema<
														ObjectEntries,
														BaseSchema<unknown, unknown, BaseIssue<unknown>>,
														ErrorMessage<ObjectWithRestIssue> | undefined
													>
												? string
												: // Object with Rest (async)
													TSchema extends ObjectWithRestSchemaAsync<
															ObjectEntriesAsync,
															| BaseSchema<unknown, unknown, BaseIssue<unknown>>
															| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
															ErrorMessage<ObjectWithRestIssue> | undefined
														>
													? string
													: // Set (sync)
														TSchema extends SetSchema<infer TValue, ErrorMessage<SetIssue> | undefined>
														? DotPath<number, TValue>
														: // Set (async)
															TSchema extends SetSchemaAsync<infer TValue, ErrorMessage<SetIssue> | undefined>
															? DotPath<number, TValue>
															: // Tuple (sync)
																TSchema extends
																		| LooseTupleSchema<infer TItems, ErrorMessage<LooseTupleIssue> | undefined>
																		| StrictTupleSchema<infer TItems, ErrorMessage<StrictTupleIssue> | undefined>
																		| TupleSchema<infer TItems, ErrorMessage<TupleIssue> | undefined>
																? TuplePath<TItems>
																: // Tuple (async)
																	TSchema extends
																			| LooseTupleSchemaAsync<infer TItems, ErrorMessage<LooseTupleIssue> | undefined>
																			| StrictTupleSchemaAsync<infer TItems, ErrorMessage<StrictTupleIssue> | undefined>
																			| TupleSchemaAsync<infer TItems, ErrorMessage<TupleIssue> | undefined>
																	? TuplePath<TItems>
																	: // Tuple with Rest (sync)
																		TSchema extends TupleWithRestSchema<
																				infer TItems,
																				infer TRest,
																				ErrorMessage<TupleWithRestIssue> | undefined
																			>
																		? TuplePath<TItems> | DotPath<number, TRest>
																		: // Tuple with Rest (async)
																			TSchema extends TupleWithRestSchemaAsync<
																					infer TItems,
																					infer TRest,
																					ErrorMessage<TupleWithRestIssue> | undefined
																				>
																			? TuplePath<TItems> | DotPath<number, TRest>
																			: // Wrapped (sync)
																				TSchema extends
																						| LazySchema<infer TWrapped>
																						| NonOptionalSchema<
																								infer TWrapped,
																								ErrorMessage<NonOptionalIssue> | undefined
																						  >
																						| OptionalSchema<
																								infer TWrapped,
																								Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, undefined>
																						  >
																						| UndefinedableSchema<
																								infer TWrapped,
																								Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, undefined>
																						  >
																				? IssueDotPath<TWrapped>
																				: // Wrapped (async)
																					TSchema extends
																							| LazySchemaAsync<infer TWrapped>
																							| NonOptionalSchemaAsync<
																									infer TWrapped,
																									ErrorMessage<NonOptionalIssue> | undefined
																							  >
																							| OptionalSchemaAsync<
																									infer TWrapped,
																									DefaultAsync<
																										| BaseSchema<unknown, unknown, BaseIssue<unknown>>
																										| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
																										undefined
																									>
																							  >
																							| UndefinedableSchemaAsync<
																									infer TWrapped,
																									DefaultAsync<
																										| BaseSchema<unknown, unknown, BaseIssue<unknown>>
																										| BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
																										undefined
																									>
																							  >
																					? IssueDotPath<TWrapped>
																					: // Otherwise
																						never;
