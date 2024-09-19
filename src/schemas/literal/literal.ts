import type { BaseIssue, BaseSchema, Dataset, ErrorMessage } from "../../types";
import { _addIssue } from "../../utils";

/**
 * Literal issue type.
 */
export interface LiteralIssue extends BaseIssue<unknown> {
	/**
	 * The issue kind.
	 */
	readonly kind: "schema";
	/**
	 * The issue type.
	 */
	readonly type: "literal";
	/**
	 * The expected property.
	 */
	readonly expected: string;
}

/**
 * Literal schema type.
 */
export interface LiteralSchema<TLiteral, TMessage extends ErrorMessage<LiteralIssue> | undefined>
	extends BaseSchema<TLiteral, TLiteral, LiteralIssue> {
	/**
	 * The schema type.
	 */
	readonly type: "literal";
	/**
	 * The schema reference.
	 */
	readonly reference: typeof literal;
	/**
	 * The literal value.
	 */
	readonly literal: TLiteral;
	/**
	 * The error message.
	 */
	readonly message: TMessage;
}

/**
 * Creates a literal schema.
 *
 * @param literal_ The literal value.
 *
 * @returns A literal schema.
 */
export function literal<const TLiteral>(literal_: TLiteral): LiteralSchema<TLiteral, undefined>;

/**
 * Creates a literal schema.
 *
 * @param literal_ The literal value.
 * @param message The error message.
 *
 * @returns A literal schema.
 */
export function literal<const TLiteral, const TMessage extends ErrorMessage<LiteralIssue> | undefined>(
	literal_: TLiteral,
	message: TMessage,
): LiteralSchema<TLiteral, TMessage>;

export function literal(
	literal_: unknown,
	message?: ErrorMessage<LiteralIssue>,
): LiteralSchema<unknown, ErrorMessage<LiteralIssue> | undefined> {
	return {
		kind: "schema",
		type: "literal",
		reference: literal,
		expects: tostring(literal_),
		async: false,
		literal: literal_,
		message,
		_run(dataset, config) {
			// roblox-ts macro system requires manual cast.
			if (dataset.value === (this as LiteralSchema<unknown, ErrorMessage<LiteralIssue> | undefined>).literal) {
				dataset.typed = true;
			} else {
				_addIssue(this, "type", dataset, config);
			}
			return dataset;
		},
	};
}
