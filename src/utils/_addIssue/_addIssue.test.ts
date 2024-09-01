import { afterEach, describe, expect, test } from 'vitest';
import {
  decimal,
  type DecimalIssue,
  minLength,
  type MinLengthIssue,
  url,
} from '../../actions/index.ts';
import { DECIMAL_REGEX } from '../../regex.ts';
import {
  number,
  type NumberIssue,
  string,
  type StringIssue,
} from '../../schemas/index.ts';
import {
  deleteGlobalMessage,
  deleteSchemaMessage,
  deleteSpecificMessage,
  setGlobalMessage,
  setSchemaMessage,
  setSpecificMessage,
} from '../../storages/index.ts';
import type {
  BaseIssue,
  Dataset,
  IssuePathItem,
  TypedDataset,
  UntypedDataset,
} from '../../types/index.ts';
import { _addIssue } from './_addIssue.ts';

describe('_addIssue', () => {
  describe('should add issue to dataset', () => {
    const baseInfo = {
      path: undefined,
      issues: undefined,
      lang: undefined,
      abortEarly: undefined,
      abortPipeEarly: undefined,
    };

    type MinLength1Issue = MinLengthIssue<string, 1>;
    const minLengthIssue: MinLength1Issue = {
      ...baseInfo,
      kind: 'validation',
      type: 'min_length',
      input: '',
      expected: '>=1',
      received: '0',
      message: 'Invalid length: Expected >=1 but received 0',
      requirement: 1,
    };

    const dataset: TypedDataset<
      string,
      MinLength1Issue | DecimalIssue<string>
    > = { typed: true, value: '' };

    test('for issue one', () => {
      _addIssue(minLength(1), 'length', dataset, {}, { received: '0' });
      expect(dataset).toStrictEqual({
        typed: true,
        value: '',
        issues: [minLengthIssue],
      } satisfies TypedDataset<string, MinLength1Issue>);
    });

    const decimalIssue: DecimalIssue<string> = {
      ...baseInfo,
      kind: 'validation',
      type: 'decimal',
      input: '',
      expected: null,
      received: '""',
      message: 'Invalid decimal: Received ""',
      requirement: DECIMAL_REGEX,
    };

    test('for issue two', () => {
      _addIssue(decimal(), 'decimal', dataset, {});
      expect(dataset).toStrictEqual({
        typed: true,
        value: '',
        issues: [minLengthIssue, decimalIssue],
      } satisfies TypedDataset<string, MinLength1Issue | DecimalIssue<string>>);
    });
  });

  describe('should generate default message', () => {
    test('with expected and received', () => {
      const dataset: UntypedDataset<StringIssue> = {
        typed: false,
        value: null,
      };
      _addIssue(string(), 'type', dataset, {});
      expect(dataset.issues?.[0].message).toBe(
        'Invalid type: Expected string but received null'
      );
    });

    test('with only received', () => {
      const dataset: TypedDataset<string, StringIssue> = {
        typed: true,
        value: 'foo',
      };
      _addIssue(url(), 'URL', dataset, {});
      expect(dataset.issues?.[0].message).toBe('Invalid URL: Received "foo"');
    });
  });

  describe('should include custom message', () => {
    const contextMessage = 'context message';
    const configMessage = 'config message';
    const specificMessage = 'specific message';
    const schemaMessage = 'schema message';
    const globalMessage = 'global message';

    afterEach(() => {
      deleteGlobalMessage();
      deleteSchemaMessage();
      deleteSpecificMessage(string);
    });

    test('from context object', () => {
      setSpecificMessage(string, specificMessage);
      setSchemaMessage(() => schemaMessage);
      setGlobalMessage(globalMessage);
      const dataset: UntypedDataset<StringIssue> = {
        typed: false,
        value: null,
      };
      _addIssue(string(contextMessage), 'type', dataset, {
        message: () => configMessage,
      });
      expect(dataset.issues?.[0].message).toBe(contextMessage);
    });

    test('from specific storage', () => {
      setSpecificMessage(string, specificMessage);
      setSchemaMessage(() => schemaMessage);
      setGlobalMessage(globalMessage);
      const dataset: UntypedDataset<StringIssue> = {
        typed: false,
        value: null,
      };
      _addIssue(string(), 'type', dataset, {
        message: () => configMessage,
      });
      expect(dataset.issues?.[0].message).toBe(specificMessage);
    });

    test('from schema storage', () => {
      setSchemaMessage(() => schemaMessage);
      setGlobalMessage(globalMessage);
      const dataset: UntypedDataset<StringIssue> = {
        typed: false,
        value: null,
      };
      _addIssue(string(), 'type', dataset, {
        message: () => configMessage,
      });
      expect(dataset.issues?.[0].message).toBe(schemaMessage);
    });

    test('not from schema storage', () => {
      setSchemaMessage(() => schemaMessage);
      setGlobalMessage(globalMessage);
      const dataset: TypedDataset<string, StringIssue> = {
        typed: true,
        value: 'foo',
      };
      _addIssue(url(), 'type', dataset, {
        message: () => configMessage,
      });
      expect(dataset.issues?.[0].message).not.toBe(schemaMessage);
    });

    test('from config object', () => {
      setGlobalMessage(globalMessage);
      const dataset: UntypedDataset<StringIssue> = {
        typed: false,
        value: null,
      };
      _addIssue(string(), 'type', dataset, {
        message: () => configMessage,
      });
      expect(dataset.issues?.[0].message).toBe(configMessage);
    });

    test('from global storage', () => {
      setGlobalMessage(globalMessage);
      const dataset: UntypedDataset<StringIssue> = {
        typed: false,
        value: null,
      };
      _addIssue(string(), 'type', dataset, {});
      expect(dataset.issues?.[0].message).toBe(globalMessage);
    });
  });

  test('should include configuration', () => {
    const dataset: UntypedDataset<StringIssue> = {
      typed: false,
      value: null,
    };
    const config = {
      lang: 'en',
      abortEarly: true,
      abortPipeEarly: true,
    };
    _addIssue(string(), 'type', dataset, config);
    expect(dataset.issues?.[0]).toMatchObject(config);
  });

  test('should include other information', () => {
    const dataset: UntypedDataset<StringIssue> = {
      typed: false,
      value: null,
    };
    const other = {
      received: '"foo"',
      expected: '"bar"',
      path: [
        {
          type: 'object',
          origin: 'value',
          input: { key: 'foo' },
          key: 'key',
          value: 'foo',
        },
      ] satisfies [IssuePathItem],
      issues: [
        {
          kind: 'schema',
          type: 'special',
          input: 'foo',
          expected: '"baz"',
          received: '"foo"',
          message: 'Custom messsage',
        },
      ] satisfies [BaseIssue<string>],
    };
    _addIssue(string(), 'type', dataset, {}, other);
    expect(dataset.issues?.[0]).toMatchObject({
      ...other,
      message: 'Invalid type: Expected "bar" but received "foo"',
    });
  });

  test('should set typed if schema to false', () => {
    const dataset: Dataset<number, NumberIssue> = {
      typed: true,
      value: NaN,
    };
    _addIssue(number(), 'type', dataset, {});
    expect(dataset).toStrictEqual({
      typed: false,
      value: NaN,
      issues: expect.any(Array),
    } satisfies UntypedDataset<NumberIssue>);
  });
});
