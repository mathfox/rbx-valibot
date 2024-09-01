import { describe, expect, test } from 'vitest';
import type { InferIssue, UntypedDataset } from '../../types/index.ts';
import {
  expectNoSchemaIssueAsync,
  expectSchemaIssueAsync,
} from '../../vitest/index.ts';
import { nullish } from '../nullish/index.ts';
import { number } from '../number/index.ts';
import { optional } from '../optional/index.ts';
import { string, type StringIssue } from '../string/index.ts';
import { objectAsync, type ObjectSchemaAsync } from './objectAsync.ts';
import type { ObjectIssue } from './types.ts';

describe('objectAsync', () => {
  describe('should return schema object', () => {
    const entries = { key: string() };
    type Entries = typeof entries;
    const baseSchema: Omit<ObjectSchemaAsync<Entries, never>, 'message'> = {
      kind: 'schema',
      type: 'object',
      reference: objectAsync,
      expects: 'Object',
      entries,
      async: true,
      _run: expect.any(Function),
    };

    test('with undefined message', () => {
      const schema: ObjectSchemaAsync<Entries, undefined> = {
        ...baseSchema,
        message: undefined,
      };
      expect(objectAsync(entries)).toStrictEqual(schema);
      expect(objectAsync(entries, undefined)).toStrictEqual(schema);
    });

    test('with string message', () => {
      expect(objectAsync(entries, 'message')).toStrictEqual({
        ...baseSchema,
        message: 'message',
      } satisfies ObjectSchemaAsync<Entries, 'message'>);
    });

    test('with function message', () => {
      const message = () => 'message';
      expect(objectAsync(entries, message)).toStrictEqual({
        ...baseSchema,
        message,
      } satisfies ObjectSchemaAsync<Entries, typeof message>);
    });
  });

  describe('should return dataset without issues', () => {
    test('for empty object', async () => {
      await expectNoSchemaIssueAsync(objectAsync({}), [{}]);
    });

    test('for simple object', async () => {
      await expectNoSchemaIssueAsync(
        objectAsync({ key1: string(), key2: number() }),
        [{ key1: 'foo', key2: 123 }]
      );
    });

    test('for unknown entries', async () => {
      expect(
        await objectAsync({ key1: string() })._run(
          { typed: false, value: { key1: 'foo', key2: 123, key3: null } },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key1: 'foo' },
      });
    });
  });

  describe('should return dataset with issues', () => {
    const schema = objectAsync({}, 'message');
    const baseIssue: Omit<ObjectIssue, 'input' | 'received'> = {
      kind: 'schema',
      type: 'object',
      expected: 'Object',
      message: 'message',
    };

    // Primitive types

    test('for bigints', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [-1n, 0n, 123n]);
    });

    test('for booleans', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [true, false]);
    });

    test('for null', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [null]);
    });

    test('for numbers', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [-1, 0, 123, 45.67]);
    });

    test('for undefined', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [undefined]);
    });

    test('for strings', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, ['', 'abc', '123']);
    });

    test('for symbols', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [
        Symbol(),
        Symbol('foo'),
      ]);
    });

    // Complex types

    // TODO: Enable this test again in case we find a reliable way to check for
    // plain objects
    // test('for arrays', async () => {
    //   await expectSchemaIssueAsync(schema, baseIssue, [[], ['value']]);
    // });

    test('for functions', async () => {
      await expectSchemaIssueAsync(schema, baseIssue, [
        () => {},
        function () {},
      ]);
    });
  });

  describe('should return dataset without nested issues', () => {
    test('for simple object', async () => {
      await expectNoSchemaIssueAsync(
        objectAsync({ key1: string(), key2: number() }),
        [{ key1: 'foo', key2: 123 }]
      );
    });

    test('for nested object', async () => {
      await expectNoSchemaIssueAsync(
        objectAsync({ nested: objectAsync({ key: string() }) }),
        [{ nested: { key: 'foo' } }]
      );
    });

    test('for optional entry', async () => {
      await expectNoSchemaIssueAsync(objectAsync({ key: optional(string()) }), [
        {},
        // @ts-expect-error
        { key: undefined },
        { key: 'foo' },
      ]);
    });

    test('for nullish entry', async () => {
      await expectNoSchemaIssueAsync(objectAsync({ key: nullish(number()) }), [
        {},
        { key: undefined },
        { key: null },
        { key: 123 },
      ]);
    });

    test('for unknown entries', async () => {
      expect(
        await objectAsync({ key1: string() })._run(
          { typed: false, value: { key1: 'foo', key2: 123, key3: null } },
          {}
        )
      ).toStrictEqual({
        typed: true,
        value: { key1: 'foo' },
      });
    });
  });

  describe('should return dataset with nested issues', () => {
    const schema = objectAsync({
      key: string(),
      nested: objectAsync({ key: number() }),
    });

    const baseInfo = {
      message: expect.any(String),
      requirement: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    const stringIssue: StringIssue = {
      ...baseInfo,
      kind: 'schema',
      type: 'string',
      input: undefined,
      expected: 'string',
      received: 'undefined',
      path: [
        {
          type: 'object',
          origin: 'value',
          input: {},
          key: 'key',
          value: undefined,
        },
      ],
    };

    test('for missing entries', async () => {
      expect(await schema._run({ typed: false, value: {} }, {})).toStrictEqual({
        typed: false,
        value: {},
        issues: [
          stringIssue,
          {
            ...baseInfo,
            kind: 'schema',
            type: 'object',
            input: undefined,
            expected: 'Object',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input: {},
                key: 'nested',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies UntypedDataset<InferIssue<typeof schema>>);
    });

    test('for missing nested entries', async () => {
      expect(
        await schema._run(
          { typed: false, value: { key: 'value', nested: {} } },
          {}
        )
      ).toStrictEqual({
        typed: false,
        value: { key: 'value', nested: {} },
        issues: [
          {
            ...baseInfo,
            kind: 'schema',
            type: 'number',
            input: undefined,
            expected: 'number',
            received: 'undefined',
            path: [
              {
                type: 'object',
                origin: 'value',
                input: { key: 'value', nested: {} },
                key: 'nested',
                value: {},
              },
              {
                type: 'object',
                origin: 'value',
                input: {},
                key: 'key',
                value: undefined,
              },
            ],
          },
        ],
      } satisfies UntypedDataset<InferIssue<typeof schema>>);
    });

    test('with abort early', async () => {
      expect(
        await schema._run({ typed: false, value: {} }, { abortEarly: true })
      ).toStrictEqual({
        typed: false,
        value: {},
        issues: [{ ...stringIssue, abortEarly: true }],
      } satisfies UntypedDataset<InferIssue<typeof schema>>);
    });
  });
});
