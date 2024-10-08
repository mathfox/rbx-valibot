import type { BaseIssue } from "../../types";

/**
 * Strict tuple issue type.
 */
export interface StrictTupleIssue extends BaseIssue<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "strict_tuple";
	/**
	 * The expected property.
	 */
	readonly expected: "Array" | "never";
}
