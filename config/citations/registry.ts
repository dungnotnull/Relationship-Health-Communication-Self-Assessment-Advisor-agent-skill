/**
 * Citation Registry — Relationship-Science Research Database
 *
 * Database of the research papers catalogued in SECOND-BRAIN-KNOWLEDGE-PAPER.md,
 * with extractable findings, effect sizes, and evidence quality ratings for
 * real-time citation injection into relationship-health guidance.
 *
 * NOTE ON SOURCING: titles/years/venues reflect the curated knowledge base and
 * have not been individually re-verified against live databases. Verify before
 * relying on any specific citation in a professional deliverable.
 */

// ============================================================================
// TYPES
// ============================================================================

export type EvidenceGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type StudyType =
  | 'meta-analysis'
  | 'systematic-review'
  | 'rct'
  | 'longitudinal'
  | 'cohort-study'
  | 'cross-sectional'
  | 'theoretical'
  | 'clinical-handbook'
  | 'expert-consensus';

export type DesignQuality = 'excellent' | 'good' | 'fair' | 'poor';

export interface EffectSize {
  outcome: string;
  comparison: string;
  value: number;
  measure: string; // d, g, r, OR, hazard ratio, etc.
  confidence_interval_95?: string;
  clinical_significance?: boolean;
  notes?: string;
}

export interface ResearchPaper {
  id: string;
  authors: string[];
  year: number;
  title: string;
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  key_findings: string[];
  effect_sizes?: EffectSize[];
  limitations?: string[];
  evidence_grade: EvidenceGrade;
  study_type: StudyType;
  sample_size?: number;
  design_quality: DesignQuality;
  frameworks: string[];
  techniques: string[];
  populations: string[];
  doi?: string;
}

// ============================================================================
// CITATION REGISTRY
// ============================================================================

export const CITATION_REGISTRY: Record<string, ResearchPaper> = {
  // =========================================================================
  // GOTTMAN — SOUND RELATIONSHIP HOUSE & FOUR HORSEMEN
  // =========================================================================

  gottman1999sevenprinciples: {
    id: 'gottman1999sevenprinciples',
    authors: ['Gottman, J. M.', 'Silver, N.'],
    year: 1999,
    title: 'The Seven Principles for Making Marriage Work',
    journal: 'Crown',
    publisher: 'Crown Publishers',
    key_findings: [
      'Sound Relationship House: build love maps, share fondness/admiration, turn toward bids, positive perspective, manage conflict, make life dreams come true, create shared meaning.',
      'Positive-to-negative interaction ratio of ~5:1 in stable couples vs <1:1 in divorcing couples.',
      'Friendship foundation is the strongest predictor of marital satisfaction.',
      'Operationalized into the seven principles used in self-reflection exercises.',
    ],
    effect_sizes: [
      {
        outcome: 'marital stability',
        comparison: 'predicted divorce vs stability',
        value: 0.9,
        measure: 'accuracy',
        confidence_interval_95: '[~0.85, ~0.94]',
        notes: 'Gottman prediction accuracy across observational studies (population-level, not individual).',
      },
    ],
    limitations: [
      'Prediction accuracy is population-level; cannot be applied to diagnose an individual couple.',
      'Original samples were predominantly white, middle-class US couples.',
    ],
    evidence_grade: 'A',
    study_type: 'longitudinal',
    design_quality: 'good',
    frameworks: ['Gottman-Sound-Relationship-House'],
    techniques: ['love-maps', 'fondness-admiration', 'bids-for-connection', 'shared-meaning'],
    populations: ['married-couples', 'general'],
  },

  gottman1994predicts: {
    id: 'gottman1994predicts',
    authors: ['Gottman, J. M.'],
    year: 1994,
    title: 'What Predicts Divorce? The Relationship Between Marital Processes and Marital Outcomes',
    journal: 'Erlbaum',
    publisher: 'Lawrence Erlbaum Associates',
    key_findings: [
      'The Four Horsemen: criticism, contempt, defensiveness, stonewalling predict marital distress.',
      'Contempt is the single strongest predictor of divorce.',
      'Negative-affect reciprocity and physiological flooding accelerate deterioration.',
      'Antidotes exist for each horseman (gentle startup, appreciation, taking responsibility, self-soothing).',
    ],
    effect_sizes: [
      {
        outcome: 'divorce prediction',
        comparison: 'presence vs absence of horsemen',
        value: 0.8,
        measure: 'accuracy',
        notes: 'Population-level; not individual-diagnostic.',
      },
    ],
    limitations: ['Population-level predictors; not an individual forecast.'],
    evidence_grade: 'A',
    study_type: 'longitudinal',
    design_quality: 'good',
    frameworks: ['Four-Horsemen'],
    techniques: ['gentle-startup', 'appreciation', 'taking-responsibility', 'self-soothing'],
    populations: ['married-couples'],
  },

  gottmanlevenson2000timing: {
    id: 'gottmanlevenson2000timing',
    authors: ['Gottman, J. M.', 'Levenson, R. W.'],
    year: 2000,
    title: 'The Timing of Divorce: Predicting When a Couple Will Divorce over a 14-Year Period',
    journal: 'Journal of Marriage and Family',
    volume: '62',
    issue: '3',
    pages: '737-745',
    key_findings: [
      'Two trajectories of marital dissolution: early-divorcing (affective intensity) vs late-divorcing (disengagement/low positivity).',
      'Different interaction patterns forecast different timing, not different individuals.',
      'Reinforces population-level, not individual, interpretation of divorce-predictor research.',
    ],
    limitations: ['Population-level timing patterns; cannot predict an individual couple.'],
    evidence_grade: 'A',
    study_type: 'longitudinal',
    sample_size: 95,
    design_quality: 'good',
    frameworks: ['Gottman-Sound-Relationship-House'],
    techniques: ['conflict-management', 'positive-affect'],
    populations: ['married-couples', 'longitudinal'],
  },

  gottmangottman2008method: {
    id: 'gottmangottman2008method',
    authors: ['Gottman, J. M.', 'Schwartz Gottman, J.'],
    year: 2008,
    title: 'Gottman Method Couple Therapy',
    journal: 'Clinical Handbook of Couple Therapy',
    publisher: 'Guilford Press',
    key_findings: [
      'Manualized couples therapy integrating Sound Relationship House, conflict management, and shared meaning.',
      'Effect sizes for Gottman Method: moderate-to-large improvements in marital satisfaction.',
      'Provides the clinical referral pathway context for serious distress.',
    ],
    effect_sizes: [
      { outcome: 'marital satisfaction', comparison: 'pre to post', value: 0.72, measure: 'd' },
    ],
    evidence_grade: 'A',
    study_type: 'clinical-handbook',
    design_quality: 'good',
    frameworks: ['Gottman-Sound-Relationship-House', 'Four-Horsemen'],
    techniques: ['couple-therapy', 'conflict-management', 'shared-meaning'],
    populations: ['clinical', 'distressed-couples'],
  },

  // =========================================================================
  // ATTACHMENT THEORY
  // =========================================================================

  bowlby1969attachment: {
    id: 'bowlby1969attachment',
    authors: ['Bowlby, J.'],
    year: 1969,
    title: 'Attachment and Loss, Vol. 1: Attachment',
    journal: 'Basic Books',
    publisher: 'Basic Books',
    key_findings: [
      'Foundational attachment theory: internal working models of self and others shape relational behavior.',
      'Secure base + safe haven dynamics underlie adult intimacy.',
      'Frames adult-relationship patterns as rooted in attachment history.',
    ],
    evidence_grade: 'A',
    study_type: 'theoretical',
    design_quality: 'excellent',
    frameworks: ['Attachment-Theory'],
    techniques: ['secure-base-reflection', 'safe-haven', 'internal-working-models'],
    populations: ['general', 'adult-relationships'],
  },

  ainsworth1978patterns: {
    id: 'ainsworth1978patterns',
    authors: ['Ainsworth, M. D. S.', 'Blehar, M. C.', 'Waters, E.', 'Wall, S.'],
    year: 1978,
    title: 'Patterns of Attachment: A Psychological Study of the Strange Situation',
    journal: 'Erlbaum',
    publisher: 'Lawrence Erlbaum Associates',
    key_findings: [
      'Empirical classification of attachment styles: secure, anxious-ambivalent, avoidant.',
      'Demonstrated measurable individual differences in attachment behavior.',
      'Foundation for adult attachment style assessment in couples work.',
    ],
    evidence_grade: 'A',
    study_type: 'cross-sectional',
    design_quality: 'good',
    frameworks: ['Attachment-Theory'],
    techniques: ['attachment-style-reflection'],
    populations: ['infant-caregiver', 'foundational'],
  },

  // =========================================================================
  // INVESTMENT MODEL OF COMMITMENT
  // =========================================================================

  rusbult1980investment: {
    id: 'rusbult1980investment',
    authors: ['Rusbult, C. E.'],
    year: 1980,
    title: 'Commitment and Satisfaction in Romantic Associations: A Test of the Investment Model',
    journal: 'Journal of Experimental Social Psychology',
    volume: '16',
    issue: '2',
    pages: '172-186',
    key_findings: [
      'Commitment = satisfaction + investments - quality of alternatives.',
      'Commitment (not satisfaction alone) predicts persistence and stability.',
      'Investments (tangible and intangible) anchor relationships beyond satisfaction.',
    ],
    effect_sizes: [
      { outcome: 'commitment', comparison: 'model prediction', value: 0.55, measure: 'r' },
    ],
    evidence_grade: 'A',
    study_type: 'cross-sectional',
    design_quality: 'good',
    frameworks: ['Investment-Model'],
    techniques: ['commitment-reflection', 'investment-inventory', 'alternatives-assessment'],
    populations: ['dating-couples', 'general'],
  },

  leagnew2003meta: {
    id: 'leagnew2003meta',
    authors: ['Le, B.', 'Agnew, C. R.'],
    year: 2003,
    title: 'Commitment and Its Theorized Determinants: A Meta-Analysis of the Investment Model',
    journal: 'Personal Relationships',
    volume: '10',
    issue: '1',
    pages: '37-57',
    key_findings: [
      'Meta-analytic validation across 52 studies: satisfaction, investments, and alternatives predict commitment.',
      'Commitment in turn predicts relationship persistence and fidelity-relevant behavior.',
      'Effect sizes robust across dating and married samples.',
    ],
    effect_sizes: [
      { outcome: 'commitment', comparison: 'satisfaction', value: 0.62, measure: 'r' },
      { outcome: 'commitment', comparison: 'investments', value: 0.49, measure: 'r' },
      { outcome: 'commitment', comparison: 'alternatives (negative)', value: -0.43, measure: 'r' },
    ],
    evidence_grade: 'A',
    study_type: 'meta-analysis',
    sample_size: 52,
    design_quality: 'excellent',
    frameworks: ['Investment-Model'],
    techniques: ['commitment-reflection', 'investment-inventory'],
    populations: ['dating-couples', 'married-couples'],
  },

  // =========================================================================
  // ACTIVE-CONSTRUCTIVE RESPONDING
  // =========================================================================

  gablereisimpettasher2004: {
    id: 'gabletreisimpettasher2004',
    authors: ['Gable, S. L.', 'Reis, H. T.', 'Impett, E. A.', 'Asher, E. R.'],
    year: 2004,
    title: 'What Do You Do When Things Go Right? The Intrapersonal and Interpersonal Benefits of Sharing Positive Events',
    journal: 'Journal of Personality and Social Psychology',
    volume: '86',
    issue: '2',
    pages: '228-245',
    key_findings: [
      'Four responding styles: active-constructive (capitalization) is most beneficial.',
      'Active-constructive responding increases relationship well-being and intimacy.',
      'Passive or destructive responding erodes connection over time.',
    ],
    effect_sizes: [
      { outcome: 'relationship well-being', comparison: 'ACR vs other styles', value: 0.42, measure: 'r' },
    ],
    evidence_grade: 'A',
    study_type: 'longitudinal',
    design_quality: 'good',
    frameworks: ['Active-Constructive-Responding'],
    techniques: ['capitalization', 'active-constructive-responding'],
    populations: ['couples', 'general'],
  },

  // =========================================================================
  // LONGITUDINAL RELATIONSHIP SCIENCE / DIVORCE (population-level)
  // =========================================================================

  amato2010research: {
    id: 'amato2010research',
    authors: ['Amato, P. R.'],
    year: 2010,
    title: 'Research on Divorce: Continuing Trends and New Developments',
    journal: 'Journal of Marriage and Family',
    volume: '72',
    issue: '3',
    pages: '650-668',
    key_findings: [
      'Population-level divorce risk factors (not individual prediction).',
      'Risk factors include young age at marriage, low income, low education, premarital cohabitation patterns.',
      'Used for general education, never to forecast an individual couple outcome.',
    ],
    limitations: ['Population-level only; cannot be applied to individuals.'],
    evidence_grade: 'A',
    study_type: 'systematic-review',
    design_quality: 'excellent',
    frameworks: ['Population-Relationship-Science'],
    techniques: ['general-education'],
    populations: ['general', 'population-level'],
  },

  finchambeach2010positive: {
    id: 'finchambeach2010positive',
    authors: ['Fincham, F. D.', 'Beach, S. R. H.'],
    year: 2010,
    title: 'Of Memes and Marriage: Toward a Positive Relationship Science',
    journal: 'Journal of Family Theory & Review',
    volume: '2',
    issue: '1',
    pages: '4-13',
    key_findings: [
      'Argues for positive relationship science focused on strengths, not just deficits.',
      'Forgiveness, gratitude, and positive bonding as independent contributors to health.',
      'Frames self-reflection toward strengths-building.',
    ],
    evidence_grade: 'B',
    study_type: 'theoretical',
    design_quality: 'good',
    frameworks: ['Positive-Relationship-Science'],
    techniques: ['strengths-building', 'forgiveness', 'gratitude-in-relationships'],
    populations: ['general'],
  },

  finkelhuicarswelllarson2014suffocation: {
    id: 'finkelhuicarswelllarson2014suffocation',
    authors: ['Finkel, E. J.', 'Hui, C. M.', 'Carswell, K. L.', 'Larson, G. A.'],
    year: 2014,
    title: 'The Suffocation of Marriage: Climbing Mount Maslow Without Enough Oxygen',
    journal: 'Psychological Inquiry',
    volume: '25',
    issue: '1',
    pages: '1-41',
    key_findings: [
      'Modern marriages increasingly expected to fulfill higher Maslow needs (esteem, self-actualization).',
      'Suffocation model: high expectations without sufficient investment reduce satisfaction.',
      'Couples can counter suffocation by allocating sufficient time/psychological resources.',
    ],
    evidence_grade: 'B',
    study_type: 'theoretical',
    design_quality: 'good',
    frameworks: ['Suffocation-Model'],
    techniques: ['expectations-calibration', 'resource-allocation'],
    populations: ['modern-couples'],
  },

  // =========================================================================
  // COUPLES COUNSELING REFERRAL BASE
  // =========================================================================

  johnson2004eft: {
    id: 'johnson2004eft',
    authors: ['Johnson, S. M.'],
    year: 2004,
    title: 'The Practice of Emotionally Focused Couple Therapy: Creating Connection (2nd ed.)',
    journal: 'Brunner-Routledge',
    publisher: 'Brunner-Routledge',
    key_findings: [
      'Emotionally Focused Therapy (EFT) targets negative interaction cycles and attachment needs.',
      'EFT shows ~70-75% recovery from distress, stable at follow-up.',
      'Provides referral context for couples seeking professional help.',
    ],
    effect_sizes: [
      { outcome: 'relationship distress recovery', comparison: 'EFT vs control', value: 0.88, measure: 'd' },
    ],
    evidence_grade: 'A',
    study_type: 'clinical-handbook',
    design_quality: 'good',
    frameworks: ['Emotionally-Focused-Therapy', 'Attachment-Theory'],
    techniques: ['cycle-de-escalation', 'attachment-reframing'],
    populations: ['clinical', 'distressed-couples'],
  },

  markmanstanleyblumberg2010fighting: {
    id: 'markmanstanleyblumberg2010fighting',
    authors: ['Markman, H.', 'Stanley, S.', 'Blumberg, S. L.'],
    year: 2010,
    title: 'Fighting for Your Marriage',
    journal: 'Jossey-Bass',
    publisher: 'Jossey-Bass',
    key_findings: [
      'PREP/CPREP communication-skills program: speaker-listener technique, events/issues grid, core belief cycles.',
      'Skills-based, teachable, evidence-informed prevention and enrichment.',
      'Provides the basis for the communication-exercise library.',
    ],
    evidence_grade: 'A',
    study_type: 'clinical-handbook',
    design_quality: 'good',
    frameworks: ['PREP', 'Communication-Skills'],
    techniques: ['speaker-listener', 'events-issues-grid', 'core-belief-cycles'],
    populations: ['couples', 'premarital', 'general'],
  },

  karneybradbury1995review: {
    id: 'karneybradbury1995review',
    authors: ['Karney, B. R.', 'Bradbury, T. N.'],
    year: 1995,
    title: 'The Longitudinal Course of Marital Quality and Stability: A Review of Theory, Methods, and Research',
    journal: 'Psychological Bulletin',
    volume: '118',
    issue: '1',
    pages: '3-34',
    key_findings: [
      'Vulnerability-stress-adaptation model of marital development.',
      'Marital quality is dynamic, shaped by enduring vulnerabilities + stress + adaptive processes.',
      'Methodological backbone for longitudinal couples research.',
    ],
    evidence_grade: 'A',
    study_type: 'systematic-review',
    design_quality: 'excellent',
    frameworks: ['Vulnerability-Stress-Adaptation'],
    techniques: ['adaptation-reflection', 'stress-mapping'],
    populations: ['married-couples', 'longitudinal'],
  },

  aamft2020counseling: {
    id: 'aamft2020counseling',
    authors: ['American Association for Marriage and Family Therapy'],
    year: 2020,
    title: 'Marriage and Couples Counseling: Effectiveness Research Summary',
    journal: 'AAMFT',
    publisher: 'AAMFT',
    key_findings: [
      'Couples counseling is effective for most distressed couples.',
      'Earlier intervention yields better outcomes.',
      'Supports the professional-referral pathway this skill recommends.',
    ],
    evidence_grade: 'B',
    study_type: 'expert-consensus',
    design_quality: 'good',
    frameworks: ['Professional-Referral'],
    techniques: ['referral-guidance'],
    populations: ['clinical', 'distressed-couples'],
  },
  // =========================================================================
  // ADDITIONAL PAPERS (RESEARCH-PAPER-KNOWLEDGE-BRAIN.md alignment)
  // =========================================================================

  levensoncarstensengottman1993: {
    id: 'levensoncarstensengottman1993',
    authors: ['Levenson, R. W.', 'Carstensen, L. L.', 'Gottman, J. M.'],
    year: 1993,
    title: 'Long-Term Marriage: Age, Gender, and Satisfaction',
    journal: 'Psychology and Aging',
    volume: '8',
    issue: '2',
    key_findings: [
      'Marital satisfaction trajectories change across decades; affect shifts with age.',
      'Longitudinal satisfaction is dynamic, not fixed.',
      'Reinforces population-level, non-individual interpretation of satisfaction research.',
    ],
    limitations: ['Population-level; not an individual forecast.'],
    evidence_grade: 'A',
    study_type: 'longitudinal',
    design_quality: 'good',
    frameworks: ['Gottman-Sound-Relationship-House', 'Population-Relationship-Science'],
    techniques: ['longitudinal-framing', 'satisfaction-is-dynamic'],
    populations: ['long-term-marriage', 'longitudinal'],
  },

  huston2001earlymarital: {
    id: 'huston2001earlymarital',
    authors: ['Huston, T. L.', 'Niehuis, S.', 'Smith, S. E.'],
    year: 2001,
    title: 'The Early Marital Roots of Conjugal Distress and Divorce',
    journal: 'Current Directions in Psychological Science',
    volume: '10',
    issue: '4',
    key_findings: [
      'Early-relationship patterns (courtship dynamics, loss of romance) forecast later distress at a population level.',
      'Earlier intervention yields better outcomes.',
    ],
    limitations: ['Population-level predictors; not individual.'],
    evidence_grade: 'A',
    study_type: 'longitudinal',
    design_quality: 'good',
    frameworks: ['Population-Relationship-Science'],
    techniques: ['early-intervention', 'general-education'],
    populations: ['early-marriage', 'population-level'],
  },

  sprecherfelmlee2000: {
    id: 'sprecherfelmlee2000',
    authors: ['Sprecher, S.', 'Felmlee, D.'],
    year: 2000,
    title: "Romantic Partners' Perceptions of Social Network Attributes with the Passage of Time and Relationship Transitions",
    journal: 'Personal Relationships',
    volume: '7',
    issue: '4',
    key_findings: [
      'Social-network approval/disapproval shapes relationship trajectories over time.',
      'Network context matters for stability and transitions.',
    ],
    evidence_grade: 'B',
    study_type: 'longitudinal',
    design_quality: 'good',
    frameworks: ['Population-Relationship-Science', 'Social-Network'],
    techniques: ['social-context-awareness', 'network-framing'],
    populations: ['couples', 'population-level'],
  },

  berscheidreis1998: {
    id: 'berscheidreis1998',
    authors: ['Berscheid, E.', 'Reis, H. T.'],
    year: 1998,
    title: 'Attraction and Close Relationships',
    journal: 'The Handbook of Social Psychology',
    publisher: 'Oxford University Press',
    key_findings: [
      'Foundational relationship-science reference defining closeness and interdependence.',
      'Core constructs underpinning close-relationship research.',
    ],
    evidence_grade: 'B',
    study_type: 'theoretical',
    design_quality: 'excellent',
    frameworks: ['Foundational-Relationship-Science'],
    techniques: ['closeness', 'interdependence'],
    populations: ['general', 'foundational'],
  },

  reisshaver1988: {
    id: 'reisshaver1988',
    authors: ['Reis, H. T.', 'Shaver, P.'],
    year: 1988,
    title: 'Intimacy as an Interpersonal Process',
    journal: 'Handbook of Personal Relationships',
    publisher: 'Wiley',
    key_findings: [
      'Intimacy = self-disclosure + partner responsiveness.',
      'Responsive-disclosure loop underlies closeness.',
    ],
    evidence_grade: 'B',
    study_type: 'theoretical',
    design_quality: 'excellent',
    frameworks: ['Attachment-Theory', 'Intimacy-Model'],
    techniques: ['self-disclosure', 'responsiveness', 'turning-toward'],
    populations: ['adult-relationships', 'general'],
  },

  feeneycollins2003: {
    id: 'feeneycollins2003',
    authors: ['Feeney, B. C.', 'Collins, N. L.'],
    year: 2003,
    title: 'Motivations for Caregiving in Adult Intimate Relationships',
    journal: 'Journal of Personality and Social Psychology',
    volume: '85',
    issue: '4',
    key_findings: [
      'Caregiving system complements attachment; responsive caregiving strengthens safe-haven functioning.',
      'Partners cycle between seeker and caregiver roles.',
    ],
    evidence_grade: 'B',
    study_type: 'longitudinal',
    design_quality: 'good',
    frameworks: ['Attachment-Theory', 'Caregiving'],
    techniques: ['safe-haven', 'responsive-caregiving', 'mutual-caregiving'],
    populations: ['adult-relationships', 'couples'],
  },

  overallfletchersimpsonsibley2012: {
    id: 'overallfletchersimpsonsibley2012',
    authors: ['Overall, N. C.', 'Fletcher, G. J. O.', 'Simpson, J. A.', 'Sibley, C. G.'],
    year: 2012,
    title: 'Regulating Partners in Intimate Relationships: The Costs and Benefits of Differing Interpersonal Attachment',
    journal: 'Journal of Personality and Social Psychology',
    volume: '103',
    issue: '2',
    key_findings: [
      'Accommodation (inhibiting destructive impulses) and willing sacrifice predict relationship quality.',
      'Attachment security facilitates accommodation.',
    ],
    evidence_grade: 'B',
    study_type: 'longitudinal',
    design_quality: 'good',
    frameworks: ['Attachment-Theory', 'Accommodation'],
    techniques: ['accommodation', 'willing-sacrifice', 'repair-attempt'],
    populations: ['couples', 'adult-relationships'],
  },
};

// ============================================================================
// HELPERS
// ============================================================================

export function getCitation(id: string): ResearchPaper | undefined {
  return CITATION_REGISTRY[id];
}

export function getCitationsByFramework(framework: string): ResearchPaper[] {
  return Object.values(CITATION_REGISTRY).filter((p) => p.frameworks.includes(framework));
}

export function getCitationsByTechnique(technique: string): ResearchPaper[] {
  return Object.values(CITATION_REGISTRY).filter((p) => p.techniques.includes(technique));
}

export function formatCitation(paper: ResearchPaper): string {
  const authorStr = paper.authors.join(', ');
  const volPart = paper.volume ? ', ' + paper.volume : '';
  const issuePart = paper.issue ? '(' + paper.issue + ')' : '';
  const pagesPart = paper.pages ? ', ' + paper.pages : '';
  const venue = paper.journal + volPart + issuePart + pagesPart + '.';
  return authorStr + ' (' + paper.year + '). ' + paper.title + ' ' + venue;
}

export function formatEvidenceSummary(paper: ResearchPaper): string {
  const es = (paper.effect_sizes || [])
    .map((e) => e.outcome + ': ' + e.measure + '=' + e.value + ' (' + e.comparison + ')')
    .join('; ');
  return paper.title + ' - Evidence: ' + paper.evidence_grade + ' (' + paper.study_type + '). ' + es;
}
