/**
 * Extracts `undefined` from a type.
 */
export type NonOptional<TValue> = TValue extends undefined ? never : TValue;

/**
 * Constructs a type that is maybe readonly.
 */
export type MaybeReadonly<TValue> = TValue | Readonly<TValue>;

/**
 * Constructs a type that is maybe a promise.
 */
export type MaybePromise<TValue> = TValue | Promise<TValue>;

/**
 * Marks specific keys as optional.
 */
export type MarkOptional<TObject, TKeys extends keyof TObject> = Omit<TObject, TKeys> & Partial<Pick<TObject, TKeys>>;

/**
 * Extracts first tuple item.
 */
export type FirstTupleItem<TTuple extends [unknown, ...unknown[]]> = TTuple[0];

/**
 * Extracts last tuple item.
 */
export type LastTupleItem<TTuple extends [unknown, ...unknown[]]> = TTuple extends [
	...infer _ extends unknown[],
	infer TLast,
]
	? TLast
	: TTuple[never];

/**
 * Converts union to intersection type.
 */
export type UnionToIntersect<TUnion> = (TUnion extends any ? (arg: TUnion) => void : never) extends (
	arg: infer TIntersect,
) => void
	? TIntersect
	: never;

/**
 * Converts union to tuple type.
 */
export type UnionToTuple<TUnion> = UnionToIntersect<
	TUnion extends never ? never : () => TUnion
> extends () => infer TLast
	? [...UnionToTuple<Exclude<TUnion, TLast>>, TLast]
	: [];

/**
 * Extracts tuples with path keys.
 */
export type PathKeys<TValue> = MaybeReadonly<
	TValue extends readonly unknown[]
		? readonly any[] extends TValue
			? [number] | [number, ...PathKeys<TValue[number]>]
			: {
					[TKey in keyof TValue]: TKey extends `${infer TIndex extends number}`
						? [TIndex] | [TIndex, ...PathKeys<TValue[TKey]>]
						: never;
				}[keyof TValue & number]
		: TValue extends Record<string, unknown>
			? {
					[TKey in keyof TValue]: [TKey] | [TKey, ...PathKeys<TValue[TKey]>];
				}[keyof TValue]
			: never
>;

/**
 * Deeply picks specific keys.
 *
 * Hint: If this type is ever exported and accessible from the outside, it must
 * be wrapped in `UnionToIntersect` to avoid invalid results.
 */
type DeepPick<TValue, TPathKeys extends PathKeys<TValue>> = TPathKeys extends readonly [
	infer TPathKey,
	...infer TPathRest,
]
	? TValue extends readonly unknown[]
		? readonly any[] extends TValue
			? TPathRest extends PathKeys<TValue[number]>
				? DeepPick<TValue[number], TPathRest>[]
				: TValue
			: TPathKey extends string | number
				? {
						[TKey in keyof TValue]: TKey extends `${TPathKey}`
							? TPathRest extends PathKeys<TValue[TKey]>
								? DeepPick<TValue[TKey], TPathRest>
								: TValue[TKey]
							: unknown;
					}
				: never
		: {
				[TKey in keyof TValue as TKey extends TPathKey ? TKey : never]: TPathRest extends PathKeys<TValue[TKey]>
					? DeepPick<TValue[TKey], TPathRest>
					: TValue[TKey];
			}
	: never;

/**
 * Deeply merges two types.
 */
type DeepMerge<TValue1, TValue2> = TValue1 extends readonly unknown[]
	? TValue2 extends readonly unknown[]
		? readonly any[] extends TValue1 | TValue2
			? DeepMerge<TValue1[number], TValue2[number]>[]
			: {
					[TKey in keyof TValue1]: TKey extends keyof TValue2
						? unknown extends TValue1[TKey]
							? TValue2[TKey]
							: TValue1[TKey]
						: never;
				}
		: never
	: TValue1 extends Record<string, unknown>
		? TValue2 extends Record<string, unknown>
			? {
					[TKey in keyof (TValue1 & TValue2)]: TKey extends keyof TValue1
						? TKey extends keyof TValue2
							? DeepMerge<TValue1[TKey], TValue2[TKey]>
							: TValue1[TKey]
						: TKey extends keyof TValue2
							? TValue2[TKey]
							: never;
				}
			: never
		: TValue1 & TValue2;

/**
 * Deeply picks N specific keys.
 */
export type DeepPickN<TInput, TPathList extends readonly PathKeys<TInput>[]> = TPathList extends readonly [
	infer TPathKeys extends PathKeys<TInput>,
	...infer TRest extends PathKeys<TInput>[],
]
	? TRest extends readonly [unknown, ...(readonly unknown[])]
		? DeepMerge<DeepPick<TInput, TPathKeys>, DeepPickN<TInput, TRest>>
		: DeepPick<TInput, TPathKeys>
	: TInput;
