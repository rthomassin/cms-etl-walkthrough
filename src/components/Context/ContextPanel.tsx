import { useStore, getActiveScenario } from '../../engine/store';
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
  { key: 'hours',              label: 'Row hours', format: (v) => `${v}h` },
  { key: 'totalHoursThisMonth',label: 'Monthly total', format: (v) => `${v}h` },
  { key: 'monthlyMax',         label: 'Monthly max',  format: (v) => `${v}h` },
  { key: 'overtimeHours',      label: 'Overtime',     format: (v) => `${v}h` },
  { key: 'hourlyRate',         label: 'Hourly rate',  format: (v) => `$${v}/h` },
  { key: 'baseCost',           label: 'Base cost',    format: (v) => `$${(v as number).toLocaleString()}` },
  { key: 'loadedCost',         label: 'Loaded cost',  format: (v) => `$${(v as number).toLocaleString()}` },
];

export default function ContextPanel() {
  const stepIndex   = useStore(s => s.stepIndex);
  const scenarioId  = useStore(s => s.activeScenario);
  const laborRow    = useStore(s => s.laborRow);
  const scenario    = getActiveScenario();
  const totalSteps  = scenario.steps.length;
  const currentStep = stepIndex === 0 ? null : scenario.steps[stepIndex - 1];
  const tooltipText = currentStep?.tooltip ?? scenario.subtitle;

  // key forces <div> to re-mount → re-play the soft-fade animation.
  const fadeKey = `${scenarioId}-${stepIndex}`;

  return (
    <aside className="h-full flex flex-col gap-5 px-6 py-5 border-l border-paper-rule bg-paper-alt/60 overflow-auto">
      {/* Step counter */}
      <div>
        <div className="font-sans text-[10px] uppercase tracking-wide3 text-ink-faint">
          Step
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <div className="font-display text-[56px] leading-none text-ink tabular-nums font-light italic">
            {String(stepIndex).padStart(2, '0')}
          </div>
          <div className="font-mono text-[14px] text-ink-faint tabular-nums">
            / {String(totalSteps).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Current step prose */}
      <div key={`prose-${fadeKey}`} className="soft-fade">
        <div className="font-sans text-[10px] uppercase tracking-wide3 text-ink-faint mb-1">
          Currently
        </div>
        <p className="font-display text-[18px] leading-[1.35] text-ink italic font-light">
          {tooltipText}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-paper-rule" />

      {/* Data payload */}
      <div>
        <div className="font-sans text-[10px] uppercase tracking-wide3 text-ink-faint mb-3">
          Data payload
        </div>
        <dl className="space-y-2">
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
                className="grid grid-cols-[120px_1fr] gap-2 items-baseline"
              >
                <dt className="font-sans text-[11px] text-ink-faint">{label}</dt>
                <dd
                  className={
                    'font-mono text-[12px] text-right tabular-nums ' +
                    (empty ? 'text-ink-faint' : 'text-ink font-medium')
                  }
                >
                  {display}
                </dd>
              </div>
            );
          })}

          {/* Catchup payload (array) rendered specially */}
          {laborRow.catchupByProject && laborRow.catchupByProject.length > 0 && (
            <div className="pt-2 mt-2 border-t border-paper-rule/50">
              <div className="font-sans text-[10px] uppercase tracking-wide2 text-ink-faint mb-1.5">
                Catchup split
              </div>
              {laborRow.catchupByProject.map((c, i) => (
                <div key={i} className="grid grid-cols-[120px_1fr] gap-2 items-baseline">
                  <dt className="font-mono text-[11px] text-ink-muted">{c.projectCode}</dt>
                  <dd className="font-mono text-[12px] text-right text-brand-secondary font-semibold tabular-nums">
                    +{c.hours}h
                  </dd>
                </div>
              ))}
            </div>
          )}
        </dl>
      </div>
    </aside>
  );
}
