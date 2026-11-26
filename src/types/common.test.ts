import { describe, expect, it } from 'vitest';

import { Actor, DefectId, list, ReasonInput, RequirementId, RunNumber, TestCaseId } from './common';
import { ApiError } from './error';
import { Requirement } from './requirement';

describe('item IDs', () => {
  it('accept the human IDs shown in the UI', () => {
    expect(RequirementId.parse('REQ-014')).toBe('REQ-014');
    expect(TestCaseId.parse('TC-031')).toBe('TC-031');
    expect(DefectId.parse('BUG-007')).toBe('BUG-007');
    expect(RunNumber.parse(12)).toBe(12);
  });

  it('refuse anything else', () => {
    expect(RequirementId.safeParse('REQ-14').success).toBe(false);
    expect(RequirementId.safeParse('req-014').success).toBe(false);
    expect(DefectId.safeParse('TC-031').success).toBe(false);
    expect(RunNumber.safeParse(0).success).toBe(false);
  });
});

describe('Actor', () => {
  it('is a person with an id and name, or the AI', () => {
    expect(Actor.parse({ type: 'person', id: 'qays-kaled', name: 'Qays Kaled' })).toEqual({
      type: 'person',
      id: 'qays-kaled',
      name: 'Qays Kaled',
    });
    expect(Actor.parse({ type: 'ai' })).toEqual({ type: 'ai' });
    expect(Actor.safeParse({ type: 'person', name: 'Qays Kaled' }).success).toBe(false);
  });
});

describe('list', () => {
  it('wraps items so pagination can be added later without breaking the shape', () => {
    expect(list(Requirement).safeParse({ items: [] }).success).toBe(true);
    expect(list(Requirement).safeParse([]).success).toBe(false);
  });
});

describe('ReasonInput', () => {
  it('needs a reason that is more than spaces', () => {
    expect(ReasonInput.safeParse({ reason: '   ' }).success).toBe(false);
    expect(ReasonInput.parse({ reason: ' Duplicate of REQ-014 ' })).toEqual({
      reason: 'Duplicate of REQ-014',
    });
  });
});

describe('ApiError', () => {
  it('has a code and a message for people, with optional field messages', () => {
    const body = {
      error: {
        code: 'validation',
        message: 'Check the highlighted fields, then try again.',
        fields: { reason: 'Write a reason before you reject it.' },
      },
    };

    expect(ApiError.parse(body)).toEqual(body);
    expect(ApiError.safeParse({ message: 'Nope' }).success).toBe(false);
  });
});
