import type {
  BaseIssue,
  BaseSchema,
  BaseSchemaAsync,
  ErrorMessage,
} from '../../types/index.ts';
import { _addIssue } from '../../utils/index.ts';
import type {
  InferNonOptionalInput,
  InferNonOptionalIssue,
  InferNonOptionalOutput,
  NonOptionalIssue,
} from './types.ts';

/**
 * Non optional schema async type.
 */
export interface NonOptionalSchemaAsync<
  TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
> extends BaseSchemaAsync<
    InferNonOptionalInput<TWrapped>,
    InferNonOptionalOutput<TWrapped>,
    NonOptionalIssue | InferNonOptionalIssue<TWrapped>
  > {
  /**
   * The schema type.
   */
  readonly type: 'non_optional';
  /**
   * The schema reference.
   */
  readonly reference: typeof nonOptionalAsync;
  /**
   * The expected property.
   */
  readonly expects: '!undefined';
  /**
   * The wrapped schema.
   */
  readonly wrapped: TWrapped;
  /**
   * The error message.
   */
  readonly message: TMessage;
}

/**
 * Creates a non optional schema.
 *
 * @param wrapped The wrapped schema.
 *
 * @returns A non optional schema.
 */
export function nonOptionalAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
>(wrapped: TWrapped): NonOptionalSchemaAsync<TWrapped, undefined>;

/**
 * Creates a non optional schema.
 *
 * @param wrapped The wrapped schema.
 * @param message The error message.
 *
 * @returns A non optional schema.
 */
export function nonOptionalAsync<
  const TWrapped extends
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  const TMessage extends ErrorMessage<NonOptionalIssue> | undefined,
>(
  wrapped: TWrapped,
  message: TMessage
): NonOptionalSchemaAsync<TWrapped, TMessage>;

export function nonOptionalAsync(
  wrapped:
    | BaseSchema<unknown, unknown, BaseIssue<unknown>>
    | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  message?: ErrorMessage<NonOptionalIssue> | undefined
): NonOptionalSchemaAsync<
  | BaseSchema<unknown, unknown, BaseIssue<unknown>>
  | BaseSchemaAsync<unknown, unknown, BaseIssue<unknown>>,
  ErrorMessage<NonOptionalIssue> | undefined
> {
  return {
    kind: 'schema',
    type: 'non_optional',
    reference: nonOptionalAsync,
    expects: '!undefined',
    async: true,
    wrapped,
    message,
    async _run(dataset, config) {
      // If value is `undefined`, add issue and return dataset
      if (dataset.value === undefined) {
        _addIssue(this, 'type', dataset, config);
        return dataset;
      }

      // Otherwise, return dataset of wrapped schema
      return this.wrapped._run(dataset, config);
    },
  };
}
