import { describe, it, expect } from './harness.js';
import {
  CITATION_REGISTRY,
  getCitation,
  getCitationsByFramework,
  getCitationsByTechnique,
  formatCitation,
} from '../config/citations/registry.js';

describe('citation registry', () => {
  it('contains at least 20 papers', () => {
    expect(Object.keys(CITATION_REGISTRY).length >= 20).toBeTrue();
  });

  it('retrieves a paper by id', () => {
    expect(getCitation('gottman1999sevenprinciples')?.year).toBe(1999);
  });

  it('returns papers by framework', () => {
    expect(getCitationsByFramework('Four-Horsemen').length > 0).toBeTrue();
    expect(getCitationsByFramework('Investment-Model').length > 0).toBeTrue();
    expect(getCitationsByFramework('Attachment-Theory').length > 0).toBeTrue();
    expect(getCitationsByFramework('Active-Constructive-Responding').length > 0).toBeTrue();
  });

  it('returns papers by technique', () => {
    expect(getCitationsByTechnique('capitalization').length > 0).toBeTrue();
  });

  it('formats a citation with author + year + title', () => {
    const p = getCitation('gottman1994predicts')!;
    const f = formatCitation(p);
    expect(f).toContain('Gottman');
    expect(f).toContain('(1994)');
  });
});
