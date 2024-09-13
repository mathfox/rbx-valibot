import type { BaseIssue } from "../../types";

/**
 * Loose tuple issue type.
 */
export interface LooseTupleIssue extends BaseIssue<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "loose_tuple";
	/**
	 * The expected property.
	 */
	readonly expected: "Array";
}
