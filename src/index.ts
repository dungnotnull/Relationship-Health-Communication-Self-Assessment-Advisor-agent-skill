/**
 * Relationship Health & Communication Self-Assessment Advisor
 * Programmatic entry point.
 *
 * Exports the orchestrator, router, safety detectors, config, and core types
 * so this skill can be embedded as a library in a larger agent runtime.
 *
 * Usage:
 *   import { AgentOrchestrator } from './src/index.js';
 *   const agent = new AgentOrchestrator();
 *   const res = await agent.processRequest({ userId, sessionId, message });
 */

export { AgentOrchestrator } from './agents/orchestrator.js';
export type { AgentRequest, AgentResponse, ConversationMessage } from './agents/orchestrator.js';

export { ChainOfThoughtRouter } from './agents/router.js';
export type { RoutingDecision, RoutingStep } from './agents/router.js';

export { SurveillanceDetector } from './agents/tools/surveillance-detector.js';
export { CrisisDetector } from './agents/tools/crisis-detector.js';
export type { CrisisAlert } from './agents/tools/crisis-detector.js';

export { getHandler, SKILL_HANDLERS } from './agents/skills/registry.js';
export type { SkillHandler, HandlerContext } from './agents/skills/registry.js';

export { getConfig, loadConfig, validateConfig, resetConfig } from '../config/config.js';
export type { Config, ModelConfig, SafetyConfig, FeatureConfig, PathConfig, Environment } from '../config/schemas.js';

export { SKILL_REGISTRY, findSkillByTrigger, getSkillById, getSkillsByFramework } from '../config/skills/registry.js';
export type { SkillDefinition } from '../config/skills/registry.js';

export { getToolRegistry, resetToolRegistry } from '../config/tools/registry.js';
export type { ToolDefinition, ToolResult } from '../config/schemas.js';

export { CITATION_REGISTRY, getCitation, getCitationsByFramework, getCitationsByTechnique, formatCitation } from '../config/citations/registry.js';
export type { ResearchPaper, EffectSize, EvidenceGrade } from '../config/citations/registry.js';

export { ASSESSMENT_REGISTRY, scoreAssessment, getAssessment, listAssessments, hasReliableChange, hasClinicallySignificantChange } from '../config/assessments/registry.js';
export type { AssessmentId, AssessmentDefinition, AssessmentResult } from '../config/assessments/registry.js';

export { detectSurveillanceIntent, detectCrisis } from '../config/safety/guardrails.js';
export type { SurveillanceDetection, SurveillanceSensitivity } from '../config/safety/guardrails.js';

export { detectCulturalDimensions, getCulturalNotes, getReferralNotes } from '../config/cultural/adaptations.js';
export type { CulturalAdaptation, CulturalDetection } from '../config/cultural/adaptations.js';
