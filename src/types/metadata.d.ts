/**
 * Base metadata type.
 */
export interface BaseMetadata<TInput> {
	/**
	 * The object kind.
	 */
	readonly kind: "metadata";
	/**
	 * The metadata type.
	 */
	readonly type: string;
	/**
	 * The metadata reference.
	 */
	readonly reference: (...args: any[]) => BaseMetadata<any>;
	/**
	 * Input, output and issue type.
	 *
	 * @internal
	 */
	readonly _types?: {
		readonly input: TInput;
		readonly output: TInput;
		readonly issue: never;
	};
}

/**
 * Generic metadata type.
 */
export interface GenericMetadata<TInput = any> extends BaseMetadata<TInput> {}
