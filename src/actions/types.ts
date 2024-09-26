import type { MaybeReadonly } from "../types";

/**
 * Array input type.
 */
export type ArrayInput = MaybeReadonly<unknown[]>;

/**
 * Array requirement type.
 */
export type ArrayRequirement<TInput extends ArrayInput> = (
	item: TInput[number],
	index: number,
	array: TInput,
) => boolean;

/**
 * Content input type.
 */
export type ContentInput = string | MaybeReadonly<unknown[]>;

/**
 * Content requirement type.
 */
export type ContentRequirement<TInput extends ContentInput> = TInput extends readonly unknown[]
	? TInput[number]
	: TInput;

/**
 * Length input type.
 */
export type LengthInput = string | ArrayLike<any>;

/**
 * Size input type.
 */
export type SizeInput = Map<unknown, unknown> | Set<unknown>;
