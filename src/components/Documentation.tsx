import React, { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Book, Key, Code, Zap, Shield, BarChart3, FileText, ChevronRight, ChevronDown, AlertCircle, CheckCircle, Info, Download, Eye, X, Sparkles } from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  subsections: {
    id: string;
    title: string;
    content: React.ReactNode;
  }[];
}

const Documentation: React.FC = () => {
  const { navigateTo } = useRouter();
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');
  const [activeSubsection, setActiveSubsection] = useState<string>('what-is-prompttrim');
  const [showTxtFile, setShowTxtFile] = useState(false);

  const commonStyle = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '14px',
    lineHeight: '1.6'
  };

  const h2Style = {
    ...commonStyle,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1F1F1F',
    margin: '0 0 16px 0'
  };

  const h3Style = {
    ...commonStyle,
    fontSize: '16px',
    fontWeight: '600',
    color: '#1F1F1F',
    margin: '0 0 12px 0'
  };

  const pStyle = {
    ...commonStyle,
    color: '#1F1F1F',
    margin: '0 0 12px 0'
  };

  const codeBlockStyle = {
    background: '#1F1F1F',
    color: '#4EC9B0',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'JetBrains Mono, monospace',
    overflowX: 'auto' as const,
    margin: '12px 0'
  };

  const infoBoxStyle = {
    padding: '16px',
    borderRadius: '8px',
    margin: '16px 0'
  };

  const docSections: DocSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <FileText className="h-5 w-5" />,
      subsections: [
        {
          id: 'what-is-prompttrim',
          title: 'What is PromptTrim?',
          content: (
            <div>
              <h2 style={h2Style}>Welcome to PromptTrim API</h2>
              <p style={pStyle}>
                PromptTrim is an AI-powered token optimization platform that intelligently compresses your prompts 
                to reduce LLM token costs while maintaining quality and effectiveness. Our API provides fast, scalable 
                compression services for input prompts, output responses, and complete workflows.
              </p>

              <div style={{ ...infoBoxStyle, background: '#FFF4E6', border: '1px solid #FFE0B2' }}>
                <h3 style={{ ...h3Style, color: '#E65100' }}>Key Advantages</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#E65100' }}>
                  <li style={{ margin: '4px 0' }}><strong>Save 30-70%</strong> on token costs</li>
                  <li style={{ margin: '4px 0' }}><strong>Maintain prompt quality</strong> while reducing length</li>
                  <li style={{ margin: '4px 0' }}><strong>Real-time optimization</strong> with sub-second response times</li>
                  <li style={{ margin: '4px 0' }}><strong>Full analytics</strong> tracking your savings and usage</li>
                  <li style={{ margin: '4px 0' }}><strong>Support for all major LLMs</strong> (GPT-4, Claude, Llama, Gemini, etc.)</li>
                </ul>
              </div>

              <h3 style={h3Style}>Supported Use Cases</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: '#F5F5F5', borderRadius: '8px' }}>
                  <strong style={{ ...commonStyle }}>Content Generation</strong>
                  <p style={{ ...commonStyle, fontSize: '12px', color: '#7C7C7C', margin: '4px 0 0 0' }}>
                    Optimize prompts for blogs, articles, and marketing content
                  </p>
                </div>
                <div style={{ padding: '12px', background: '#F5F5F5', borderRadius: '8px' }}>
                  <strong style={{ ...commonStyle }}>Data Processing</strong>
                  <p style={{ ...commonStyle, fontSize: '12px', color: '#7C7C7C', margin: '4px 0 0 0' }}>
                    Compress large datasets and queries for efficient processing
                  </p>
                </div>
                <div style={{ padding: '12px', background: '#F5F5F5', borderRadius: '8px' }}>
                  <strong style={{ ...commonStyle }}>Batch Operations</strong>
                  <p style={{ ...commonStyle, fontSize: '12px', color: '#7C7C7C', margin: '4px 0 0 0' }}>
                    Process thousands of prompts efficiently
                  </p>
                </div>
                <div style={{ padding: '12px', background: '#F5F5F5', borderRadius: '8px' }}>
                  <strong style={{ ...commonStyle }}>Cost Optimization</strong>
                  <p style={{ ...commonStyle, fontSize: '12px', color: '#7C7C7C', margin: '4px 0 0 0' }}>
                    Reduce LLM API costs significantly
                  </p>
                </div>
              </div>

              <h3 style={h3Style}>Architecture Overview</h3>
              <div style={{ padding: '20px', background: '#F5F5F5', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ ...commonStyle, fontSize: '13px', margin: 0 }}>
                  <strong>Your Application</strong> → API Request → PromptTrim Engine → Optimized Prompt → LLM API
                  <br/><br/>
                  The PromptTrim engine uses advanced NLP techniques to:
                  <br/>• Remove redundancy and filler words
                  <br/>• Restructure sentences for conciseness
                  <br/>• Preserve critical information and context
                  <br/>• Maintain semantic meaning
                </p>
              </div>
            </div>
          )
        },
        {
          id: 'supported-models',
          title: 'Supported LLMs',
          content: (
            <div>
              <h2 style={h2Style}>Supported LLM Models</h2>
              <p style={pStyle}>
                PromptTrim works seamlessly with all major language models and their API formats:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {['OpenAI GPT-4/GPT-3.5', 'Anthropic Claude', 'Google Gemini', 'Meta Llama', 'Mistral AI', 'Cohere'].map(model => (
                  <div key={model} style={{ 
                    padding: '16px', 
                    background: '#FFFFFF', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px',
                    textAlign: 'center' as const
                  }}>
                    <CheckCircle size={20} style={{ color: '#FF6B35', marginBottom: '8px' }} />
                    <p style={{ ...commonStyle, margin: 0, fontSize: '13px' }}>{model}</p>
                  </div>
                ))}
              </div>

              <div style={{ ...infoBoxStyle, background: '#E3F2FD', border: '1px solid #BBDEFB' }}>
                <Info size={18} style={{ color: '#1976D2', marginBottom: '8px' }} />
                <p style={{ ...commonStyle, color: '#0D47A1', fontSize: '13px', margin: 0 }}>
                  <strong>Universal Compatibility:</strong> PromptTrim's optimization is model-agnostic. 
                  Once optimized, your prompt will work with any LLM API that accepts text input.
                </p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Zap className="h-5 w-5" />,
      subsections: [
        {
          id: 'quick-start',
          title: 'Quick Start',
          content: (
            <div>
              <h2 style={h2Style}>Quick Start Guide</h2>
              <p style={pStyle}>
                Get up and running with PromptTrim in under 5 minutes. This guide walks you through 
                creating an account, obtaining an API key, and making your first request.
              </p>

              <h3 style={h3Style}>Step 1: Create an Account</h3>
              <p style={pStyle}>
                1. Visit{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('landing'); }} 
                   style={{ color: '#FF6B35', textDecoration: 'underline', cursor: 'pointer' }}>
                  prompttrim.com
                </a>
                <br/>
                2. Click "Get Started" to create your free account
                <br/>
                3. Verify your email address
                <br/>
                4. Complete your profile setup
              </p>

              <h3 style={h3Style}>Step 2: Generate Your API Key</h3>
              <p style={pStyle}>
                1. Navigate to the Dashboard → API Keys section
                <br/>
                2. Click "Create API Key"
                <br/>
                3. Give your key a descriptive name (e.g., "Production Server")
                <br/>
                4. Select "Input" as the key type (for input token optimization)
                <br/>
                5. Click "Create"
              </p>

              <div style={{ ...infoBoxStyle, background: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                <AlertCircle size={18} style={{ color: '#C62828', marginBottom: '8px' }} />
                <p style={{ ...commonStyle, color: '#C62828', margin: 0, fontSize: '13px' }}>
                  <strong>Security Warning:</strong> Your API key is displayed only once after creation. 
                  Copy and store it securely immediately. Never commit API keys to version control.
                </p>
              </div>

              <h3 style={h3Style}>Step 3: Make Your First API Call</h3>
              
              <p style={{ ...pStyle, fontWeight: '600' }}>Python Example:</p>
              <pre style={codeBlockStyle}>{`import requests

url = "http://localhost:8000/optimize/YOUR_USER_ID"
headers = {"Content-Type": "application/json"}
payload = {
    "prompt": "Write a comprehensive marketing strategy document...",
    "optimization_level": "moderate"
}

response = requests.post(url, json=payload, headers=headers)
result = response.json()
print(f"Saved {result['tokens_saved']} tokens")`}</pre>

              <p style={{ ...pStyle, fontWeight: '600' }}>cURL Example:</p>
              <pre style={codeBlockStyle}>{`curl -X POST http://localhost:8000/optimize/YOUR_USER_ID \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a comprehensive marketing strategy document for our new AI product.",
    "optimization_level": "moderate"
  }'`}</pre>

              <p style={{ ...pStyle, fontWeight: '600' }}>Node.js Example:</p>
              <pre style={codeBlockStyle}>{`const axios = require('axios');

const response = await axios.post(
  'http://localhost:8000/optimize/YOUR_USER_ID',
  {
    prompt: "Write a comprehensive marketing strategy...",
    optimization_level: "moderate"
  },
  { headers: { 'Content-Type': 'application/json' } }
);

console.log(\`Saved \${response.data.tokens_saved} tokens\`);`}</pre>
            </div>
          )
        },
        {
          id: 'api-keys-guide',
          title: 'API Keys',
          content: (
            <div>
              <h2 style={h2Style}>Managing API Keys</h2>
              <p style={pStyle}>
                API keys are used to authenticate your requests to the PromptTrim API. Each key can be 
                individually managed and monitored.
              </p>

              <h3 style={h3Style}>Key Types</h3>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: '#FFF4E6', borderLeft: '4px solid #FF6B35', marginBottom: '8px' }}>
                  <strong>Input Keys (Currently Active)</strong>
                  <p style={{ ...commonStyle, fontSize: '12px', color: '#7C7C7C', margin: '4px 0 0 0' }}>
                    Used for optimizing input prompts before sending to LLM. Reduces input token costs by 30-70%.
                  </p>
                </div>
                <div style={{ padding: '12px', background: '#F5F5F5', borderLeft: '4px solid #7C7C7C', marginBottom: '8px' }}>
                  <strong>Output Keys (Coming Soon)</strong>
                  <p style={{ ...commonStyle, fontSize: '12px', color: '#7C7C7C', margin: '4px 0 0 0' }}>
                    For compressing LLM output responses to reduce storage and processing costs.
                  </p>
                </div>
              </div>

              <h3 style={h3Style}>Best Practices</h3>
              <ul style={{ ...commonStyle, paddingLeft: '20px' }}>
                <li>Use environment variables to store API keys</li>
                <li>Create separate keys for development and production</li>
                <li>Rotate keys regularly for security</li>
                <li>Monitor key usage in your dashboard</li>
                <li>Revoke compromised keys immediately</li>
              </ul>

              <h3 style={h3Style}>Environment Variables Example</h3>
              <pre style={codeBlockStyle}>{`# .env file
PROMPTTRIM_API_KEY=pt_abc123...xyz789
PROMPTTRIM_USER_ID=your-user-id-here
PROMPTTRIM_BASE_URL=http://localhost:8000`}</pre>
            </div>
          )
        }
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: <Code className="h-5 w-5" />,
      subsections: [
        {
          id: 'input-endpoint',
          title: '/optimize/input',
          content: (
            <div>
              <h2 style={h2Style}>Input Optimization Endpoint</h2>
              <p style={pStyle}>
                Optimize input prompts to reduce token count before sending to your LLM.
              </p>

              <div style={{ background: '#4CAF50', color: 'white', padding: '8px 12px', borderRadius: '4px', display: 'inline-block', marginBottom: '16px' }}>
                <strong>POST</strong> /optimize/&#123;user_id&#125;
              </div>

              <h3 style={h3Style}>Request Parameters</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', ...commonStyle, fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F5F5F5' }}>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #E5E7EB' }}>Parameter</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #E5E7EB' }}>Type</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #E5E7EB' }}>Required</th>
                    <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #E5E7EB' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}><code>prompt</code></td>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}>string</td>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}>Yes</td>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}>The original prompt text to optimize</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}><code>optimization_level</code></td>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}>string</td>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}>No</td>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}>"minimal", "moderate" (default), or "aggressive"</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}><code>language</code></td>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}>string</td>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}>No</td>
                    <td style={{ padding: '8px', border: '1px solid #E5E7EB' }}>Language code (default: "en")</td>
                  </tr>
                </tbody>
              </table>

              <h3 style={h3Style}>Example Request</h3>
              <pre style={codeBlockStyle}>{`{
  "prompt": "I need you to write a very detailed and comprehensive marketing strategy document for a brand new AI-powered productivity application.",
  "optimization_level": "moderate",
  "language": "en"
}`}</pre>

              <h3 style={h3Style}>Example Response</h3>
              <pre style={codeBlockStyle}>{`{
  "id": "prompt_abc123",
  "original_text": "I need you to write a very detailed...",
  "optimized_text": "Create a marketing strategy for an AI productivity app",
  "original_token_count": 156,
  "optimized_token_count": 98,
  "tokens_saved": 58,
  "optimization_level": "moderate",
  "cost_saved_usd": 0.00174,
  "created_at": "2024-01-15T10:30:00Z"
}`}</pre>

              <h3 style={h3Style}>Error Handling</h3>
              <div style={{ ...infoBoxStyle, background: '#FFEBEE', border: '1px solid #FFCDD2' }}>
                <p style={{ ...commonStyle, fontSize: '13px', margin: 0 }}><strong>400 Bad Request:</strong> Invalid parameters or malformed JSON</p>
                <p style={{ ...commonStyle, fontSize: '13px', margin: '4px 0 0 0' }}><strong>401 Unauthorized:</strong> Invalid or missing API key</p>
                <p style={{ ...commonStyle, fontSize: '13px', margin: '4px 0 0 0' }}><strong>429 Too Many Requests:</strong> Rate limit exceeded</p>
                <p style={{ ...commonStyle, fontSize: '13px', margin: '4px 0 0 0' }}><strong>500 Internal Server Error:</strong> Server-side issue</p>
              </div>

              <h3 style={h3Style}>Rate Limits</h3>
              <ul style={{ ...commonStyle, paddingLeft: '20px' }}>
                <li>Free tier: 100 requests/hour</li>
                <li>Pro tier: 1,000 requests/hour</li>
                <li>Enterprise: Unlimited</li>
              </ul>
            </div>
          )
        },
        {
          id: 'output-endpoint',
          title: '/optimize/output',
          content: (
            <div>
              <h2 style={h2Style}>Output Optimization Endpoint</h2>
              <p style={pStyle}>
                <strong>Coming Soon:</strong> Optimize LLM output responses to reduce storage and processing costs.
              </p>

              <div style={{ ...infoBoxStyle, background: '#E3F2FD', border: '1px solid #BBDEFB' }}>
                <Info size={18} style={{ color: '#1976D2', marginBottom: '8px' }} />
                <p style={{ ...commonStyle, color: '#0D47A1', margin: 0, fontSize: '13px' }}>
                  This feature is currently in development. Subscribe to our updates to be notified when output optimization becomes available.
                </p>
              </div>
            </div>
          )
        },
        {
          id: 'full-endpoint',
          title: '/optimize/full',
          content: (
            <div>
              <h2 style={h2Style}>Full Workflow Optimization</h2>
              <p style={pStyle}>
                <strong>Coming Soon:</strong> Optimize complete request-response workflows for maximum efficiency.
              </p>

              <div style={{ ...infoBoxStyle, background: '#E3F2FD', border: '1px solid #BBDEFB' }}>
                <Info size={18} style={{ color: '#1976D2', marginBottom: '8px' }} />
                <p style={{ ...commonStyle, color: '#0D47A1', margin: 0, fontSize: '13px' }}>
                  Full workflow optimization will allow you to optimize both input prompts and output responses 
                  in a single API call for maximum token savings across your entire AI pipeline.
                </p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'auth-security',
      title: 'Authentication & Security',
      icon: <Shield className="h-5 w-5" />,
      subsections: [
        {
          id: 'authentication',
          title: 'How Authentication Works',
          content: (
            <div>
              <h2 style={h2Style}>Authentication & Security</h2>

              <h3 style={h3Style}>Current Authentication</h3>
              <p style={pStyle}>
                Presently, authentication is handled via user_id in the URL path. Your API key identifies 
                your account and authorizes requests.
              </p>

              <h3 style={h3Style}>Where to Send Your API Key</h3>
              <p style={pStyle}>
                <strong>URL Parameter (Current):</strong>
              </p>
              <pre style={codeBlockStyle}>{`http://localhost:8000/optimize/YOUR_USER_ID`}</pre>

              <p style={pStyle}>
                <strong>Header Authentication (Coming Soon):</strong>
              </p>
              <pre style={codeBlockStyle}>{`Authorization: Bearer YOUR_API_KEY`}</pre>

              <h3 style={h3Style}>Security Best Practices</h3>
              <ul style={{ ...commonStyle, paddingLeft: '20px', marginBottom: '16px' }}>
                <li style={{ margin: '4px 0' }}>Never commit API keys to version control</li>
                <li style={{ margin: '4px 0' }}>Use environment variables for all API keys</li>
                <li style={{ margin: '4px 0' }}>Rotate keys regularly (every 90 days)</li>
                <li style={{ margin: '4px 0' }}>Use separate keys for dev/staging/production</li>
                <li style={{ margin: '4px 0' }}>Monitor key usage for unusual activity</li>
                <li style={{ margin: '4px 0' }}>Revoke compromised keys immediately</li>
                <li style={{ margin: '4px 0' }}>Enable IP whitelisting (enterprise feature)</li>
              </ul>

              <h3 style={h3Style}>Secure Storage Example</h3>
              <pre style={codeBlockStyle}>{`# Python example
import os
import requests

API_KEY = os.getenv('PROMPTTRIM_API_KEY')
USER_ID = os.getenv('PROMPTTRIM_USER_ID')

response = requests.post(
    f'http://localhost:8000/optimize/{USER_ID}',
    json={'prompt': 'Your prompt'},
    headers={'Authorization': f'Bearer {API_KEY}'}
)`}</pre>
            </div>
          )
        }
      ]
    },
    {
      id: 'faq',
      title: 'FAQ & Troubleshooting',
      icon: <AlertCircle className="h-5 w-5" />,
      subsections: [
        {
          id: 'troubleshooting',
          title: 'Common Issues',
          content: (
            <div>
              <h2 style={h2Style}>FAQ & Troubleshooting</h2>

              <h3 style={h3Style}>Why is my request returning "Invalid user_id"?</h3>
              <p style={pStyle}>
                Ensure your user_id is correctly copied from your dashboard. The user_id should be a UUID format. 
                Double-check there are no extra spaces or characters.
              </p>

              <h3 style={h3Style}>What's the difference between optimization levels?</h3>
              <ul style={{ ...commonStyle, paddingLeft: '20px' }}>
                <li><strong>Minimal:</strong> 20-30% reduction, preserves most context</li>
                <li><strong>Moderate:</strong> 40-60% reduction (recommended), balanced quality and savings</li>
                <li><strong>Aggressive:</strong> 60-80% reduction, maximum savings, may lose some nuance</li>
              </ul>

              <h3 style={h3Style}>How do I debug failed optimization requests?</h3>
              <ol style={{ ...commonStyle, paddingLeft: '20px' }}>
                <li style={{ margin: '4px 0' }}>Check your request payload is valid JSON</li>
                <li style={{ margin: '4px 0' }}>Verify all required parameters are included</li>
                <li style={{ margin: '4px 0' }}>Check your prompt length isn't exceeding limits</li>
                <li style={{ margin: '4px 0' }}>Review error response messages for details</li>
                <li style={{ margin: '4px 0' }}>Check dashboard for rate limit warnings</li>
              </ol>

              <h3 style={h3Style}>Can I use the same prompt multiple times?</h3>
              <p style={pStyle}>
                Yes, but for best results, re-optimize dynamically generated prompts. Each optimization 
                considers the specific wording and context.
              </p>

              <h3 style={h3Style}>How can I optimize throughput and reduce latency?</h3>
              <ul style={{ ...commonStyle, paddingLeft: '20px' }}>
                <li>Use moderate optimization level for best speed-quality balance</li>
                <li>Batch multiple prompts in single requests (coming soon)</li>
                <li>Cache optimized prompts for recurring content</li>
                <li>Use async requests for non-blocking operations</li>
                <li>Consider upgrading to Pro tier for faster response times</li>
              </ul>
            </div>
          )
        },
        {
          id: 'changelog',
          title: 'Changelog',
          content: (
            <div>
              <h2 style={h2Style}>Release Notes & Changelog</h2>

              <h3 style={h3Style}>Version 1.0.0 (Current Release)</h3>
              <div style={{ marginBottom: '16px' }}>
                <strong style={{ ...commonStyle, color: '#FF6B35' }}>Released: January 2024</strong>
                <ul style={{ ...commonStyle, paddingLeft: '20px' }}>
                  <li>Initial release of PromptTrim API</li>
                  <li>Input token optimization (minimal, moderate, aggressive levels)</li>
                  <li>Real-time analytics dashboard</li>
                  <li>API key management system</li>
                  <li>Python, cURL, and Node.js integration examples</li>
                  <li>Comprehensive error handling</li>
                </ul>
              </div>

              <h3 style={h3Style}>Upcoming Features</h3>
              <div style={{ padding: '16px', background: '#E3F2FD', borderRadius: '8px', border: '1px solid #BBDEFB' }}>
                <p style={{ ...commonStyle, margin: '0 0 12px 0' }}><strong>Output Optimization (Q1 2024)</strong></p>
                <p style={{ ...commonStyle, margin: '0 0 12px 0' }}><strong>Full Workflow Optimization (Q2 2024)</strong></p>
                <p style={{ ...commonStyle, margin: '0 0 12px 0' }}><strong>Batch Processing (Q2 2024)</strong></p>
                <p style={{ ...commonStyle, margin: '0 0 12px 0' }}><strong>Header-based Authentication (Q1 2024)</strong></p>
              </div>
            </div>
          )
        }
      ]
    }
  ];

  const currentSection = docSections.find(section => section.id === expandedSection);
  const currentSubsection = currentSection?.subsections.find(sub => sub.id === activeSubsection);

  const txtFileContent = `==========================================
PROMPTTRIM API - QUICK REFERENCE
==========================================

Version: 1.0.0
Last Updated: 2025-01-27

Quick reference guide for PromptTrim API endpoints, authentication, and common usage patterns.

==========================================
AUTHENTICATION
==========================================

Current Method: User ID in URL
URL Format: http://localhost:8000/optimize/{USER_ID}

Header Authentication (Coming Soon):
Header: Authorization: Bearer YOUR_API_KEY

==========================================
MAIN ENDPOINT
==========================================

POST /optimize/{user_id}
Purpose: Optimize input prompts to reduce token count

Request Body:
{
  "prompt": "Your original prompt text here",
  "optimization_level": "moderate",
  "language": "en"
}

Parameters:
- prompt (required): string - Original prompt text
- optimization_level (optional): string - "minimal", "moderate", or "aggressive"
- language (optional): string - Language code (default: "en")

Response:
{
  "id": "prompt-id",
  "original_text": "Original prompt",
  "optimized_text": "Compressed prompt",
  "original_token_count": 156,
  "optimized_token_count": 98,
  "tokens_saved": 58,
  "optimization_level": "moderate",
  "cost_saved_usd": 0.00174,
  "created_at": "2024-01-15T10:30:00Z"
}

==========================================
PYTHON EXAMPLE
==========================================

import requests
import os

user_id = os.getenv('PROMPTTRIM_USER_ID')
url = f"http://localhost:8000/optimize/{user_id}"

payload = {
    "prompt": "Write a comprehensive marketing strategy...",
    "optimization_level": "moderate"
}

response = requests.post(url, json=payload)
result = response.json()
print(f"Tokens saved: {result['tokens_saved']}")

==========================================
CURL EXAMPLE
==========================================

curl -X POST http://localhost:8000/optimize/YOUR_USER_ID \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Write a comprehensive marketing strategy...",
    "optimization_level": "moderate"
  }'

==========================================
NODE.JS EXAMPLE
==========================================

const axios = require('axios');

const response = await axios.post(
  'http://localhost:8000/optimize/YOUR_USER_ID',
  {
    prompt: "Write a comprehensive marketing strategy...",
    optimization_level: "moderate"
  },
  { headers: { 'Content-Type': 'application/json' } }
);

console.log(\`Tokens saved: \${response.data.tokens_saved}\`);

==========================================
OPTIMIZATION LEVELS
==========================================

Minimal (20-30% reduction):
  - Gentle compression
  - Preserves most context
  - Ideal for complex prompts

Moderate (40-60% reduction) - RECOMMENDED:
  - Balanced compression
  - Good quality preservation
  - Works for most prompts

Aggressive (60-80% reduction):
  - Maximum compression
  - Best for simple prompts
  - Maximum cost savings

==========================================
ERROR CODES
==========================================

400 Bad Request: Invalid parameters or malformed JSON
401 Unauthorized: Invalid or missing authentication
429 Too Many Requests: Rate limit exceeded
500 Internal Server Error: Server-side issue

==========================================
RATE LIMITS
==========================================

Free Tier: 100 requests/hour
Pro Tier: 1,000 requests/hour
Enterprise: Unlimited

==========================================
SUPPORT
==========================================

Documentation: http://localhost:5173/documentation
Dashboard: http://localhost:5173/dashboard
Email: support@prompttrim.com

==========================================
CHANGELOG
==========================================

Version 1.0.0 (January 2024):
- Initial release
- Input token optimization
- Three optimization levels
- Real-time analytics
- API key management

Coming Soon:
- Output optimization
- Full workflow optimization
- Batch processing
- Header-based authentication

==========================================
END OF QUICK REFERENCE
==========================================`;

  const downloadTxtFile = () => {
    const blob = new Blob([txtFileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PromptTrim-API-Quick-Reference.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      fontFamily: 'JetBrains Mono, monospace'
    }}>
      {/* Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: '64px' 
          }}>
            <button
              onClick={() => navigateTo(user ? 'api-keys' : 'landing')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#1F1F1F',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px'
              }}
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Book size={24} style={{ color: '#FF6B35' }} />
              <h1 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#1F1F1F',
                margin: 0,
                fontFamily: 'JetBrains Mono, monospace'
              }}>Documentation</h1>
            </div>
            <div style={{ width: '96px' }}></div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Sidebar */}
          <aside style={{ 
            width: '256px', 
            flexShrink: 0 
          }}>
            <nav style={{ position: 'sticky', top: '96px' }}>
              {/* Download File Section */}
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                background: '#FFF4E6',
                border: '2px dashed #FFB74D',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Download size={16} style={{ color: '#FF6B35' }} />
                  <span style={{ 
                    ...commonStyle, 
                    fontWeight: '600', 
                    fontSize: '13px',
                    color: '#E65100' 
                  }}>
                    Quick Reference
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={downloadTxtFile}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      background: '#FF6B35',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: 'JetBrains Mono, monospace',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E55A2B';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FF6B35';
                    }}
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    onClick={() => setShowTxtFile(!showTxtFile)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      background: 'transparent',
                      color: '#1F1F1F',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      fontFamily: 'JetBrains Mono, monospace',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F5F5F5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {showTxtFile ? <X size={14} /> : <Eye size={14} />}
                    {showTxtFile ? 'Hide' : 'Preview'}
                  </button>
                </div>
                {showTxtFile && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#1F1F1F',
                    borderRadius: '6px',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    <pre style={{
                      ...commonStyle,
                      fontSize: '11px',
                      color: '#4EC9B0',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}>
                      {txtFileContent.substring(0, 500)}...
                    </pre>
                  </div>
                )}
              </div>

              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {docSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => {
                        const newExpanded = expandedSection === section.id ? null : section.id;
                        setExpandedSection(newExpanded);
                        // Automatically select first subsection when expanding
                        if (newExpanded && section.subsections.length > 0) {
                          setActiveSubsection(section.subsections[0].id);
                        }
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        textAlign: 'left',
                        background: expandedSection === section.id ? '#FFF4E6' : 'transparent',
                        color: expandedSection === section.id ? '#E65100' : '#1F1F1F',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontFamily: 'JetBrains Mono, monospace',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (expandedSection !== section.id) {
                          e.currentTarget.style.background = '#F5F5F5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (expandedSection !== section.id) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {section.icon}
                        </div>
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>{section.title}</span>
                      </div>
                      {expandedSection === section.id ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                    {expandedSection === section.id && (
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        margin: '4px 0 4px 32px' 
                      }}>
                        {section.subsections.map((subsection) => (
                          <li key={subsection.id}>
                            <button
                              onClick={() => setActiveSubsection(subsection.id)}
                              style={{
                                width: '100%',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                textAlign: 'left',
                                border: 'none',
                                background: activeSubsection === subsection.id ? '#FFF4E6' : 'transparent',
                                color: activeSubsection === subsection.id ? '#FF6B35' : '#7C7C7C',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: activeSubsection === subsection.id ? '500' : '400',
                                fontFamily: 'JetBrains Mono, monospace',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (activeSubsection !== subsection.id) {
                                  e.currentTarget.style.background = '#F5F5F5';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (activeSubsection !== subsection.id) {
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              {subsection.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main style={{
            flex: 1,
            background: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            padding: '32px',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            {currentSubsection?.content || (
              <div style={{ color: '#7C7C7C', fontSize: '14px' }}>
                Select a section from the sidebar to view documentation.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;