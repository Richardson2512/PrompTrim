import React from 'react';
import { Check } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';

const plans = [
  {
    key: 'input',
    name: 'INPUT-ONLY',
    price: '$9/mo',
    input: '1M',
    output: '0',
    total: '1M',
    bestFor: 'Prompt writers',
    highlights: ['Input compression', 'Token analytics', 'Email support']
  },
  {
    key: 'output',
    name: 'OUTPUT-ONLY',
    price: '$29/mo',
    input: '0',
    output: '500K',
    total: '500K',
    bestFor: 'Response summarizers',
    highlights: ['Output reduction', 'Provider routing', 'Priority support']
  },
  {
    key: 'full',
    name: 'FULL-STACK',
    price: '$79/mo',
    input: 'Unlimited',
    output: '1M',
    total: '1.5M+',
    bestFor: 'Agencies, apps',
    highlights: ['Input + Output', 'Rules engine', 'SLA & onboarding']
  }
];

const cell = (text: string) => (
  <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>{text}</div>
);

const Pricing: React.FC = () => {
  const { navigateTo } = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: 36, marginBottom: 8, color: '#1F1F1F' }}>Simple, transparent pricing</h1>
        <p style={{ color: '#6B7280', marginBottom: 24 }}>Pick the plan that fits your workflow. Upgrade anytime.</p>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {plans.map((p) => (
            <div key={p.key} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 style={{ fontSize: 18, color: '#1F1F1F' }}>{p.name}</h2>
                <div style={{ fontWeight: 700, color: '#FF6B35' }}>{p.price}</div>
              </div>
              <div style={{ marginTop: 8, color: '#6B7280' }}>{p.bestFor}</div>
              <div style={{ marginTop: 16, border: '1px solid #F3F4F6', borderRadius: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#FAFAFA', borderBottom: '1px solid #E5E7EB', fontWeight: 600 }}>
                  <div style={{ padding: '10px 16px' }}>Metric</div>
                  <div style={{ padding: '10px 16px' }}>Limit</div>
                </div>
                {cell(`Input Tokens: ${p.input}`)}
                {cell(`Output Tokens: ${p.output}`)}
                {cell(`Total Tokens: ${p.total}`)}
              </div>
              <ul style={{ marginTop: 16, listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
                {p.highlights.map((h) => (
                  <li key={h} style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#1F1F1F' }}>
                    <Check size={16} color="#10B981" /> {h}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigateTo('api-keys')}
                style={{
                  marginTop: 16,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '2px solid #FF6B35',
                  background: '#FF6B35',
                  color: '#000000',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FF6B35';
                  e.currentTarget.style.color = '#000000';
                }}
              >
                Get started
              </button>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div style={{ marginTop: 32, border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', background: '#FAFAFA', borderBottom: '1px solid #E5E7EB', fontWeight: 700 }}>
            {['API Key Type', 'Price', 'Input Tokens', 'Output Tokens', 'Best For'].map((h) => (
              <div key={h} style={{ padding: '12px 16px' }}>{h}</div>
            ))}
          </div>
          {plans.map((p) => (
            <div key={p.key} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr', borderBottom: '1px solid #F3F4F6' }}>
              {cell(p.name)}
              {cell(p.price)}
              {cell(p.input)}
              {cell(p.output)}
              {cell(p.bestFor)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
