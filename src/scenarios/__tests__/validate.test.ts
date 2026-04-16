import { pipelineNodes, pipelineEdges } from '../pipeline';
import { standardScenario } from '../standard';
import { overtimeScenario } from '../overtime';
import type { Scenario } from '../types';

const nodeIds = new Set(pipelineNodes.map(n => n.id));
const edgeKeys = new Set(pipelineEdges.map(e => `${e.from}-${e.to}`));

function validate(scenario: Scenario, label: string) {
  describe(`${label} (${scenario.id})`, () => {
    it('has a non-empty title and subtitle', () => {
      expect(scenario.title.length).toBeGreaterThan(0);
      expect(scenario.subtitle.length).toBeGreaterThan(0);
    });

    it('starts with a placement step (from === null)', () => {
      expect(scenario.steps[0].from).toBeNull();
    });

    it('has every step referencing an existing "to" node', () => {
      for (const step of scenario.steps) {
        expect(nodeIds.has(step.to)).toBe(true);
      }
    });

    it('has every transition matching a defined pipeline edge (except self-loops and placement)', () => {
      for (const step of scenario.steps) {
        if (step.from === null) continue;
        if (step.from === step.to) continue; // settle step
        expect(edgeKeys.has(`${step.from}-${step.to}`)).toBe(true);
      }
    });

    it('keeps every tooltip under 180 characters', () => {
      for (const step of scenario.steps) {
        expect(step.tooltip.length).toBeGreaterThan(0);
        expect(step.tooltip.length).toBeLessThanOrEqual(180);
      }
    });

    it('has strictly positive transit times', () => {
      for (const step of scenario.steps) {
        expect(step.ms).toBeGreaterThan(0);
      }
    });
  });
}

validate(standardScenario, 'standard scenario');
validate(overtimeScenario, 'overtime scenario');

describe('scenario branching', () => {
  const standardHits = new Set(standardScenario.steps.map(s => s.to));
  const overtimeHits = new Set(overtimeScenario.steps.map(s => s.to));

  it('standard scenario does NOT visit node 10 (redistribution)', () => {
    expect(standardHits.has(10)).toBe(false);
  });

  it('overtime scenario DOES visit node 10 (redistribution)', () => {
    expect(overtimeHits.has(10)).toBe(true);
  });

  it('both scenarios end at node 13', () => {
    expect(standardScenario.steps.at(-1)?.to).toBe(13);
    expect(overtimeScenario.steps.at(-1)?.to).toBe(13);
  });
});
