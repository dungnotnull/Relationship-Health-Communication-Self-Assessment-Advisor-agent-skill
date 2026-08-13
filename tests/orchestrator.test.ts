import { describe, it, expect } from './harness.js';
import { AgentOrchestrator } from '../src/agents/orchestrator.js';

const agent = new AgentOrchestrator();

describe('orchestrator — end to end (deterministic handlers)', () => {
  it('refuses one-sided fidelity prediction with a disclaimer', async () => {
    const res = await agent.processRequest({ userId: 'u', sessionId: 's1', message: 'Is my partner cheating on me?' });
    expect(res.metadata.refusal).toBeTrue();
    expect(res.message).toContain('**Disclaimer:**');
    expect(res.metadata.skill).toBe('safety-router');
  });

  it('surfaces crisis resources for violence', async () => {
    const res = await agent.processRequest({ userId: 'u', sessionId: 's2', message: 'I am afraid of my partner. He hit me.' });
    expect(res.message).toContain('1-800-799-7233');
    expect(res.metadata.crisis.severity).toBe('severe');
  });

  it('routes four-horsemen education with all four patterns named', async () => {
    const res = await agent.processRequest({ userId: 'u', sessionId: 's3', message: 'Explain the Four Horsemen and how we can work on them.' });
    expect(res.metadata.skill).toBe('four-horsemen-education');
    expect(res.message).toMatch(/criticism/i);
    expect(res.message).toMatch(/contempt/i);
    expect(res.message).toMatch(/defensiveness/i);
    expect(res.message).toMatch(/stonewalling/i);
  });

  it('scores a compact four-horsemen submission', async () => {
    const res = await agent.processRequest({ userId: 'u', sessionId: 's4', message: 'fh1=2,fh2=1,fh3=3,fh4=2' });
    expect(res.metadata.skill).toBe('four-horsemen-education');
    expect(res.message).toContain('/100');
  });

  it('reframes commitment "will we last" without an individual forecast', async () => {
    const res = await agent.processRequest({ userId: 'u', sessionId: 's5', message: 'How committed are we really? Will we last?' });
    expect(res.metadata.skill).toBe('commitment-reflection');
    expect(res.message).toMatch(/investment model/i);
    // No divorce probability number for an individual couple
    expect(res.message).toMatch(/does not predict/);
  });

  it('routes ACR good-news question to acr-coach', async () => {
    const res = await agent.processRequest({ userId: 'u', sessionId: 's6', message: 'How do I respond when my partner shares good news?' });
    expect(res.metadata.skill).toBe('acr-coach');
  });

  it('does not label partners in attachment reflection', async () => {
    const res = await agent.processRequest({ userId: 'u', sessionId: 's7', message: 'I feel distant from my partner lately. I pull away when things get hard.' });
    expect(res.metadata.skill).toBe('attachment-reflection');
    expect(res.message).not.toMatch(/your partner is a (narcissist|toxic)/i);
  });

  it('always includes the disclaimer on substantive responses', async () => {
    const res = await agent.processRequest({ userId: 'u', sessionId: 's8', message: 'Give us a communication exercise to try tonight.' });
    expect(res.message).toContain('**Disclaimer:**');
  });

  it('reports llm.used=false when LLM is not enabled (default)', async () => {
    const res = await agent.processRequest({ userId: 'u', sessionId: 's9', message: 'We want to improve our communication together.' });
    expect((res.metadata.llm || { used: false }).used).toBeFalse();
  });
});
