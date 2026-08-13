import { describe, it, expect } from './harness.js';
import {
  scoreAssessment,
  hasReliableChange,
  hasClinicallySignificantChange,
  listAssessments,
} from '../config/assessments/registry.js';

describe('assessment scoring — Sound Relationship House', () => {
  it('scores a strong SRH response into the Strong band', () => {
    const r = scoreAssessment('sound-relationship-house-check', { srh1: 5, srh2: 5, srh3: 5, srh4: 5, srh5: 5, srh6: 5, srh7: 5 });
    expect(r.normalized_score).toBe(100);
    expect(r.band_label).toBe('Strong');
    expect(r.referral_recommended).toBeFalse();
  });

  it('flags a low SRH response for referral', () => {
    const r = scoreAssessment('sound-relationship-house-check', { srh1: 1, srh2: 1, srh3: 1, srh4: 1, srh5: 1, srh6: 1, srh7: 1 });
    expect(r.band_label).toBe('Needs attention');
    expect(r.referral_recommended).toBeTrue();
  });

  it('produces domain scores for every domain', () => {
    const r = scoreAssessment('sound-relationship-house-check', { srh1: 4, srh2: 4, srh3: 4, srh4: 4, srh5: 4, srh6: 4, srh7: 4 });
    expect(Object.keys(r.domain_scores).length).toBe(7);
  });
});

describe('assessment scoring — Four Horsemen (lower-better)', () => {
  it('scores a healthy four-horsemen response into Healthy conflict', () => {
    const r = scoreAssessment('four-horsemen-self-check', { fh1: 1, fh2: 1, fh3: 1, fh4: 1 });
    expect(r.band_label).toBe('Healthy conflict');
  });

  it('flags elevated-risk four-horsemen for referral', () => {
    const r = scoreAssessment('four-horsemen-self-check', { fh1: 5, fh2: 5, fh3: 5, fh4: 5 });
    expect(r.band_label).toBe('Elevated risk');
    expect(r.referral_recommended).toBeTrue();
  });
});

describe('assessment scoring — Investment Model', () => {
  it('scores high commitment', () => {
    const r = scoreAssessment('commitment-investment-reflection', { im1: 5, im2: 5, im3: 5, im4: 5 });
    expect(r.band_label).toBe('High commitment');
  });

  it('flags low commitment signals for referral', () => {
    const r = scoreAssessment('commitment-investment-reflection', { im1: 1, im2: 1, im3: 1, im4: 1 });
    expect(r.referral_recommended).toBeTrue();
  });
});

describe('assessment scoring — ACR', () => {
  it('scores strong capitalization', () => {
    const r = scoreAssessment('acr-capitalization-check', { acr1: 5, acr2: 1, acr3: 1, acr4: 1 });
    expect(r.normalized_score > 80).toBeTrue();
  });
});

describe('reliable & clinically significant change', () => {
  it('detects reliable change above threshold', () => {
    expect(hasReliableChange('sound-relationship-house-check', 10, 20)).toBeTrue();
  });

  it('detects clinically significant change crossing into a strong band', () => {
    expect(hasClinicallySignificantChange('sound-relationship-house-check', 14, 30)).toBeTrue();
  });

  it('reports no clinically significant change when staying in the same band', () => {
    expect(hasClinicallySignificantChange('sound-relationship-house-check', 30, 33)).toBeFalse();
  });
});

describe('assessment registry', () => {
  it('lists all four instruments', () => {
    expect(listAssessments().length).toBe(4);
  });
});
