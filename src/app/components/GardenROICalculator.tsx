import { useState } from 'react';

interface CalcInputs {
  annualSubmissions: number;
  avgFee: number;
  platformFeePercent: number;
  platformFeeFixed: number;
  adminHoursPerWeek: number;
  gardenAnnualCost: number;
}

interface CalcResults {
  currentPlatformCost: number;
  feesLostPerSubmission: number;
  annualFeeLoss: number;
  adminCostPerYear: number;
  totalCurrentCost: number;
  annualSaving: number;
  roi: number;
  breakEvenMonths: number;
}

const defaults: CalcInputs = {
  annualSubmissions: 3000,
  avgFee: 3,
  platformFeePercent: 5,
  platformFeeFixed: 0.99,
  adminHoursPerWeek: 4,
  gardenAnnualCost: 2000,
};

function calculate(i: CalcInputs): CalcResults {
  const feesLostPerSubmission = i.platformFeeFixed + (i.avgFee * i.platformFeePercent) / 100;
  const annualFeeLoss = feesLostPerSubmission * i.annualSubmissions;
  const adminCostPerYear = i.adminHoursPerWeek * 52 * 15; // £15/hr notional
  const totalCurrentCost = annualFeeLoss + adminCostPerYear;
  const annualSaving = totalCurrentCost - i.gardenAnnualCost;
  const roi = (annualSaving / i.gardenAnnualCost) * 100;
  const breakEvenMonths = annualSaving > 0 ? (i.gardenAnnualCost / (totalCurrentCost / 12)) : 0;

  return {
    currentPlatformCost: annualFeeLoss,
    feesLostPerSubmission,
    annualFeeLoss,
    adminCostPerYear,
    totalCurrentCost,
    annualSaving,
    roi,
    breakEvenMonths,
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

export default function GardenROICalculator() {
  const [inputs, setInputs] = useState<CalcInputs>(defaults);
  const results = calculate(inputs);

  const set = (key: keyof CalcInputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((prev) => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }));

  const fields: { key: keyof CalcInputs; label: string; min: number; max: number; step: number; prefix?: string }[] = [
    { key: 'annualSubmissions', label: 'Annual submissions', min: 100, max: 20000, step: 100 },
    { key: 'avgFee', label: 'Average submission fee (£)', min: 0, max: 10, step: 0.5, prefix: '£' },
    { key: 'platformFeePercent', label: 'Current platform fee (%)', min: 0, max: 15, step: 0.5 },
    { key: 'platformFeeFixed', label: 'Fixed fee per transaction (£)', min: 0, max: 2, step: 0.01, prefix: '£' },
    { key: 'adminHoursPerWeek', label: 'Admin hours / week on submissions', min: 1, max: 20, step: 1 },
    { key: 'gardenAnnualCost', label: 'The Garden annual cost (£)', min: 500, max: 5000, step: 100, prefix: '£' },
  ];

  return (
    <div style={{ fontFamily: 'Georgia, serif', maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem', color: '#2a2017' }}>
      <h2 style={{ fontSize: '1.6rem', fontWeight: 400, marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
        What is your submissions system really costing you?
      </h2>
      <p style={{ color: '#7a6a52', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>
        Adjust the sliders for your journal. See what you keep when you switch to The Garden.
      </p>

      <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {fields.map(({ key, label, min, max, step }) => (
          <div key={key}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem', color: '#4a3f2f' }}>
              <span>{label}</span>
              <strong style={{ color: '#2a2017' }}>
                {key === 'annualSubmissions' || key === 'adminHoursPerWeek'
                  ? inputs[key].toLocaleString()
                  : `£${inputs[key]}`}
                {key === 'platformFeePercent' ? '%' : ''}
              </strong>
            </label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={inputs[key]}
              onChange={set(key)}
              style={{ width: '100%', accentColor: '#5c7a4e' }}
            />
          </div>
        ))}
      </div>

      <div style={{
        background: '#f6f3ed',
        border: '1px solid #d9d2c5',
        borderRadius: 8,
        padding: '1.75rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem 2rem',
      }}>
        <ResultLine label="Fees lost to platform / year" value={fmt(results.annualFeeLoss)} muted />
        <ResultLine label="Admin cost / year (est.)" value={fmt(results.adminCostPerYear)} muted />
        <ResultLine label="Total current infrastructure cost" value={fmt(results.totalCurrentCost)} />
        <ResultLine label="The Garden annual licence" value={fmt(inputs.gardenAnnualCost)} />
        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #d9d2c5', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 2rem' }}>
          <ResultLine label="Annual saving" value={fmt(results.annualSaving)} highlight={results.annualSaving > 0} />
          <ResultLine label="Return on investment" value={`${results.roi.toFixed(0)}%`} highlight={results.roi > 0} />
          <ResultLine label="Break-even" value={results.breakEvenMonths > 0 ? `${results.breakEvenMonths.toFixed(1)} months` : '—'} />
        </div>
      </div>

      {results.annualSaving > 0 && (
        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#5c7a4e', textAlign: 'center', letterSpacing: '0.01em' }}>
          At your submission volume, The Garden pays for itself in under{' '}
          <strong>{Math.ceil(results.breakEvenMonths)} months</strong>.
        </p>
      )}
    </div>
  );
}

function ResultLine({ label, value, muted, highlight }: { label: string; value: string; muted?: boolean; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: '#7a6a52', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: highlight ? 600 : 400, color: highlight ? '#3a5a2e' : muted ? '#7a6a52' : '#2a2017' }}>{value}</div>
    </div>
  );
}
