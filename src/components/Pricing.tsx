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
  },
  {
    key: 'ltd',
    name: 'LTD (Limited-Time Deal)',
    price: '$499 one-time',
    input: '—',
    output: '—',
    total: '5M/year',
    bestFor: 'Power users, early adopters',
    highlights: ['5M tokens/year', 'Overage: $0.01 per 1K', 'Capped to 100 spots']
  }
];

const cell = (text: string) => (
  <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>{text}</div>
);

const Pricing: React.FC = () => {
  const { navigateTo } = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>
      {/* Header with Logo */}
      <header style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
        <button
          onClick={() => navigateTo('landing')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <img src="/logo.png" alt="PromptTrim Logo" style={{ width: 180, height: 180, objectFit: 'contain' }} />
        </button>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '10px 24px 40px' }}>
        <h1 style={{ fontSize: 40, marginBottom: 8, color: '#1F1F1F', textAlign: 'center' }}>Simple, transparent pricing</h1>
        <p style={{ color: '#6B7280', marginBottom: 28, textAlign: 'center' }}>Pick the plan that fits your workflow. Upgrade anytime.</p>

        {/* Plans grid - one row, 4 columns on large screens */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
            gap: 20,
          }}
        >
          <style>{`@media (min-width: 1024px){ .pricing-row { display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:20px; } }`}</style>
          <div className="pricing-row">
          {plans.map((p) => (
            <div
              key={p.key}
              style={{
                border: '1px solid #E5E7EB',
                borderRadius: 16,
                padding: 24,
                minHeight: 420,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 style={{ fontSize: 18, color: '#1F1F1F' }}>{p.name}</h2>
                <div style={{ fontWeight: 700, color: '#FF6B35' }}>{p.price}</div>
              </div>
              <div style={{ marginTop: 8, color: '#6B7280' }}>{p.bestFor}</div>
              {p.key !== 'ltd' && (
                <div style={{ marginTop: 16, border: '1px solid #F3F4F6', borderRadius: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#FAFAFA', borderBottom: '1px solid #E5E7EB', fontWeight: 600 }}>
                    <div style={{ padding: '10px 16px' }}>Metric</div>
                    <div style={{ padding: '10px 16px' }}>Limit</div>
                  </div>
                  {cell(`Input Tokens: ${p.input}`)}
                  {cell(`Output Tokens: ${p.output}`)}
                  {cell(`Total Tokens: ${p.total}`)}
                </div>
              )}
              {p.key === 'ltd' && (
                <div style={{ marginTop: 16, border: '1px solid #F3F4F6', borderRadius: 8 }}>
                  {cell('5M Tokens / Year')}
                  {cell('Overage: $0.01 per 1K (after 5M)')}
                  {cell('Cap: 100 spots only')}
                </div>
              )}
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
                  padding: '12px 16px',
                  borderRadius: 10,
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
                {p.key === 'ltd' ? 'Reserve LTD Spot' : 'Get started'}
              </button>
            </div>
          ))}
          </div>
        </div>

        {/* Footer (same style as landing) */}
        <footer style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0px 0px',
          gap: 20,
          width: '100%',
          maxWidth: 1550,
          margin: '40px auto 0',
          borderTop: '1px solid #1F1F1F'
        }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative' }}>
            <div style={{ width: 350, height: 18, fontFamily: 'JetBrains Mono', fontWeight: 400, fontSize: 14, lineHeight: '18px', color: '#7C7C7C', textAlign: 'left' }}>2025 © PrompTrim. All rights reserved</div>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: 'JetBrains Mono', fontWeight: 400, fontSize: 12, lineHeight: '16px', color: '#FF6B35', textAlign: 'center', whiteSpace: 'nowrap' }}>
              Works with any LLM pipeline - if your app sends text in and gets text out, PrompTrim fits right in
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16, width: 208, height: 40 }}>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{ boxSizing: 'border-box', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 3, width: 40, height: 40, border: '1px solid #DBDBDB', borderRadius: 50, textDecoration: 'none', color: 'inherit' }}>
                {/* simple X */}
                <span style={{ fontWeight: 700 }}>X</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ boxSizing: 'border-box', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 3, width: 40, height: 40, border: '1px solid #DBDBDB', borderRadius: 50, textDecoration: 'none', color: 'inherit' }}>
                in
              </a>
              <a href="mailto:example@example.com" style={{ boxSizing: 'border-box', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 3, width: 40, height: 40, border: '1px solid #DBDBDB', borderRadius: 50, textDecoration: 'none', color: 'inherit' }}>
                @
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ boxSizing: 'border-box', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 3, width: 40, height: 40, border: '1px solid #DBDBDB', borderRadius: 50, textDecoration: 'none', color: 'inherit' }}>
                GH
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Pricing;
