import { Check, Clock, Cog, Truck, PackageCheck, XCircle } from 'lucide-react';
import './StatusStepper.css';

const STEPS = [
  { key: 'Pending', label: 'Pending', icon: Clock },
  { key: 'Processing', label: 'Processing', icon: Cog },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: PackageCheck },
];

export function StatusStepper({ status }) {
  const isCancelled = status === 'Cancelled' || status === 'Failed';
  const currentIdx = STEPS.findIndex(s => s.key === status);

  if (isCancelled) {
    return (
      <div className="stepper stepper--cancelled">
        <span className="stepper__cancelled-badge">
          <XCircle size={14} /> {status}
        </span>
      </div>
    );
  }

  return (
    <div className="stepper">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="stepper__item">
            <div className={`stepper__dot ${done ? 'stepper__dot--done' : ''} ${active ? 'stepper__dot--active' : ''}`}>
              {done ? <Check size={14} strokeWidth={3} /> : <Icon size={14} strokeWidth={1.8} />}
            </div>
            <span className={`stepper__label ${active ? 'stepper__label--active' : ''}`}>{step.label}</span>
            {i < STEPS.length - 1 && (
              <div className={`stepper__line ${done ? 'stepper__line--done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
