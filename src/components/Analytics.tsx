import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, AnalyticsDaily } from '../lib/supabase';
import { TrendingUp, Sparkles, DollarSign, Calendar } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsDaily[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadAnalytics();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const loadAnalytics = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('analytics_daily')
        .select('*')
        .eq('user_id', profile.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setAnalytics(data || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = analytics.reduce(
    (acc, day) => ({
      prompts: acc.prompts + day.total_prompts,
      tokensSaved: acc.tokensSaved + day.total_tokens_saved,
      costSaved: acc.costSaved + parseFloat(day.total_cost_saved_usd.toString()),
    }),
    { prompts: 0, tokensSaved: 0, costSaved: 0 }
  );

  const avgCompressionRate =
    analytics.length > 0
      ? analytics.reduce((acc, day) => acc + day.avg_compression_rate, 0) / analytics.length
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-blue-100">Total Prompts</div>
            <Sparkles className="w-6 h-6 text-blue-200" />
          </div>
          <div className="text-3xl font-bold">{totalStats.prompts.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-green-100">Tokens Saved</div>
            <TrendingUp className="w-6 h-6 text-green-200" />
          </div>
          <div className="text-3xl font-bold">{totalStats.tokensSaved.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-emerald-100">Cost Saved</div>
            <DollarSign className="w-6 h-6 text-emerald-200" />
          </div>
          <div className="text-3xl font-bold">${totalStats.costSaved.toFixed(2)}</div>
        </div>

        <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-violet-100">Avg Compression</div>
            <TrendingUp className="w-6 h-6 text-violet-200" />
          </div>
          <div className="text-3xl font-bold">{avgCompressionRate.toFixed(1)}%</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Daily Activity
        </h3>

        {analytics.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No analytics data yet. Start optimizing prompts to see your stats!
          </div>
        ) : (
          <div className="space-y-2">
            {analytics.map((day) => (
              <div
                key={day.id}
                className="flex items-center justify-between p-4 bg-slate-900 rounded-lg hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-slate-300 font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-sm text-slate-400">
                    {day.total_prompts} prompt{day.total_prompts !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Tokens Saved</div>
                    <div className="text-green-400 font-semibold">
                      {day.total_tokens_saved.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-slate-400">Cost Saved</div>
                    <div className="text-emerald-400 font-semibold">
                      ${parseFloat(day.total_cost_saved_usd.toString()).toFixed(4)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-slate-400">Compression</div>
                    <div className="text-blue-400 font-semibold">
                      {day.avg_compression_rate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
