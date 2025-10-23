import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PromptOptimizer } from './PromptOptimizer';
import { Analytics } from './Analytics';
import { PromptHistory } from './PromptHistory';
import { LogOut, Zap, BarChart3, History } from 'lucide-react';

type Tab = 'optimizer' | 'analytics' | 'history';

export const Dashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('optimizer');

  const usagePercentage = profile
    ? (profile.tokens_used_this_month / profile.monthly_token_limit) * 100
    : 0;

  const tabs = [
    { id: 'optimizer' as Tab, label: 'Optimize', icon: Zap },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'history' as Tab, label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/Logo.png" 
                alt="PromptTrim Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">PromptTrim</h1>
                <p className="text-xs text-slate-400">AI Prompt Optimizer</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">{profile?.full_name}</div>
                <div className="text-xs text-slate-400 capitalize">
                  {profile?.subscription_tier} Plan
                </div>
              </div>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-300">
              Monthly Token Usage
            </div>
            <div className="text-sm text-slate-400">
              {profile?.tokens_used_this_month.toLocaleString()} /{' '}
              {profile?.monthly_token_limit.toLocaleString()}
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-[600px]">
          {activeTab === 'optimizer' && <PromptOptimizer />}
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'history' && <PromptHistory />}
        </div>
      </div>
    </div>
  );
};
