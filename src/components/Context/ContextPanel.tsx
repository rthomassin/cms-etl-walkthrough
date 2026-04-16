import { useStore, getActiveScenario } from '../../engine/store';
import {
  getNode,
  getPredecessors,
  getSuccessors,
  findStepIndexForNode,
} from '../../scenarios/pipeline';
import type { LaborRow } from '../../scenarios/types';

/** Row fields rendered in the payload grid, in presentation order. */
const FIELD_ORDER: Array<{ key: keyof LaborRow; label: string; format?: (v: unknown) => string }> = [
  { key: 'employeeName',       label: 'Employee' },
  { key: 'employeeId',         label: 'Employee ID' },
  { key: 'region',             label: 'Region' },
  { key: 'projectCode',        label: 'Project code' },
  { key: 'costCategory',       label: 'Cost category' },
  { key: 'costCenter',         label: 'Cost center' },
  { key: 'reportingUnit',      label: 'Reporting unit' },
  { key: 'hours',              label: 'Row hours',        format: (v) => `${v}h` },
  { key: 'totalHoursThisMonth',label: 'Monthly total',    format: (v) => `${v}h` },
  { key: 'monthlyMax',         label: 'Monthly max',      format: (v) => `${v}h` },
  { key: 'overtimeHours',      label: 'Overtime',         format: (v) => `${v}h` },
  { key: 'hourlyRate',         label: 'Hourly rate',      format: (v) => `$${v}/h` },
  { key: 'baseCost',           label: 'Base cost',        format: (v) => `$${(v as number).toLocaleString()}` },
  { key: 'loadedCost',         label: 'Loaded cost',      format: (v) => `$${(v as number).toLocaleString()}` },
];

function NodeListItem({
  nodeId,
  direction,
}: {
  nodeId: number;
  direction: 'in' | 'out';
}) {
  const selectNode = useStore(s => s.actions.selectNode);
  const node = getNode(nodeId);
  const color = direction === 'in' ? 'text-[#3F8B4F]' : 'text-brand-secondary';
  const arrow = direction === 'in' ? '←' : '→';

  return (
    <button
      onClick={() => selectNode(nodeId)}
      className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded border border-paper-rule bg-paper hover:bg-paper-alt transition-colors"
    >
      <span className={`font-mono text-[10px] font-bold ${color} w-4`}>{arrow}</span>
      <span className="font-mono text-[10px] text-ink-faint tabular-nums">
        {String(node.id).padStart(2, '0')}
      </span>
      <span className="font-mono text-[11.5px] text-ink flex-1 truncate">
        {node.label}
      </span>
    </button>
  );
}

/** Intro view — shown when no node is selected. */
function IntroView() {
  const scenario = getActiveScenario();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="font-sans text-[10px] uppercase tracking-wide3 text-ink-faint">
          Scenario
        </div>
        <div className="font-display italic text-[28px] leading-[1.15] text-ink mt-1">
          {scenario.title}
        </div>
      </div>

      <p className="font-sans text-[13px] leading-[1.5] text-ink-muted">
        {scenario.subtitle}
      </p>

      <div className="border-t border-paper-rule pt-5">
        <div className="font-sans text-[10px] uppercase tracking-wide3 text-ink-faint mb-2">
          How to use
        </div>
        <ul className="font-sans text-[12.5px] leading-[1.55] text-ink-muted space-y-2 list-disc pl-5">
          <li>Click any step in the pipeline to learn what it does.</li>
          <li>Its inputs are highlighted in <span className="text-[#3F8B4F] font-medium">green</span>; outputs in <span className="text-brand-secondary font-medium">red</span>.</li>
          <li>Use the scenario toggle above to switch between the standard flow and the overtime edge case.</li>
          <li>Click empty space to deselect.</li>
        </ul>
      </div>
    </div>
  );
}

/** Selected-node view — shown when a node is selected. */
function NodeDetailView({ nodeId }: { nodeId: number }) {
  const scenarioId = useStore(s => s.activeScenario);
  const laborRow = useStore(s => s.laborRow);
  const scenario = getActiveScenario();
  const node = getNode(nodeId);

  const predecessors = getPredecessors(nodeId);
  const successors = getSuccessors(nodeId);

  const stepIndex = findStepIndexForNode(scenario.steps, nodeId);
  const stepProse = stepIndex >= 0 ? scenario.steps[stepIndex].tooltip : null;
  const inPath = stepIndex >= 0;

  // key forces re-mount for soft-fade animation on selection change
  const fadeKey = `${scenarioId}-${nodeId}`;

  return (
    <div key={fadeKey} className="flex flex-col gap-5 soft-fade">
      {/* Node header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-wide3 text-ink-faint uppercase">
            Step {String(nodeId).padStart(2, '0')} · {node.stage}
          </span>
          {!inPath && (
            <span className="font-mono text-[9px] tracking-wide2 uppercase px-1.5 py-0.5 rounded-sm bg-paper-alt text-ink-faint border border-paper-rule">
              not in {scenario.title.toLowerCase()}
            </span>
          )}
        </div>
        <div className="font-display text-[26px] leading-[1.15] text-ink mt-1 font-medium">
          {node.label}
        </div>
      </div>

      {/* What it does */}
      {stepProse && (
        <div>
          <div className="font-sans text-[10px] uppercase tracking-wide3 text-ink-faint mb-1">
            What happens here
          </div>
          <p className="font-display text-[15.5px] leading-[1.4] text-ink italic font-light">
            {stepProse}
          </p>
        </div>
      )}

      {/* Inputs */}
      {predecessors.length > 0 && (
        <div>
          <div className="font-sans text-[10px] uppercase tracking-wide3 text-[#3F8B4F] mb-2">
            Input{predecessors.length > 1 ? 's' : ''}
          </div>
          <div className="flex flex-col gap-1.5">
            {predecessors.map(id => (
              <NodeListItem key={id} nodeId={id} direction="in" />
            ))}
          </div>
        </div>
      )}

      {/* Outputs */}
      {successors.length > 0 && (
        <div>
          <div className="font-sans text-[10px] uppercase tracking-wide3 text-brand-secondary mb-2">
            Output{successors.length > 1 ? 's' : ''}
          </div>
          <div className="flex flex-col gap-1.5">
            {successors.map(id => (
              <NodeListItem key={id} nodeId={id} direction="out" />
            ))}
          </div>
          {successors.length > 1 && (
            <div className="font-sans text-[11px] text-ink-muted mt-2 italic">
              Two outputs — which one fires depends on the data (see the two scenarios).
            </div>
          )}
        </div>
      )}

      {/* Terminal states */}
      {predecessors.length === 0 && (
        <div className="font-mono text-[11px] uppercase tracking-wide2 text-ink-faint">
          ◼︎ origin of the flow
        </div>
      )}
      {successors.length === 0 && (
        <div className="font-mono text-[11px] uppercase tracking-wide2 text-ink-faint">
          ◼︎ end of the flow
        </div>
      )}

      {/* Data payload */}
      <div className="border-t border-paper-rule pt-4">
        <div className="font-sans text-[10px] uppercase tracking-wide3 text-ink-faint mb-2">
          Data state at this step
        </div>
        <dl className="space-y-1.5">
          {FIELD_ORDER.map(({ key, label, format }) => {
            const value = laborRow[key];
            const empty = value === undefined || value === null;
            const display = empty
              ? '—'
              : format
                ? format(value)
                : String(value);
            return (
              <div
                key={String(key)}
                className="grid grid-cols-[110px_1fr] gap-2 items-baseline"
              >
                <dt className="font-sans text-[11px] text-ink-faint">{label}</dt>
                <dd
                  className={
                    'font-mono text-[11.5px] text-right tabular-nums ' +
                    (empty ? 'text-ink-faint' : 'text-ink font-medium')
                  }
                >
                  {display}
                </dd>
              </div>
            );
          })}
          {laborRow.catchupByProject && laborRow.catchupByProject.length > 0 && (
            <div className="pt-2 mt-2 border-t border-paper-rule/50">
              <div className="font-sans text-[10px] uppercase tracking-wide2 text-ink-faint mb-1.5">
                Catchup split
              </div>
              {laborRow.catchupByProject.map((c, i) => (
                <div key={i} className="grid grid-cols-[110px_1fr] gap-2 items-baseline">
                  <dt className="font-mono text-[11px] text-ink-muted">{c.projectCode}</dt>
                  <dd className="font-mono text-[11.5px] text-right text-brand-secondary font-semibold tabular-nums">
                    +{c.hours}h
                  </dd>
                </div>
              ))}
            </div>
          )}
        </dl>
      </div>

      {/* Deselect hint */}
      <button
        onClick={() => useStore.getState().actions.selectNode(null)}
        className="self-start mt-2 font-sans text-[11px] text-ink-faint hover:text-ink underline-offset-2 hover:underline"
      >
        ← Back to overview
      </button>
    </div>
  );
}

export default function ContextPanel() {
  const selectedNodeId = useStore(s => s.selectedNodeId);

  return (
    <aside className="h-full px-6 py-5 border-l border-paper-rule bg-paper-alt/60 overflow-auto">
      {selectedNodeId === null
        ? <IntroView />
        : <NodeDetailView nodeId={selectedNodeId} />
      }
    </aside>
  );
}
