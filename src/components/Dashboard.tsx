import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { 
  BarChart3, 
  DollarSign, 
  Zap, 
  Activity,
  Download,
  Settings,
  LogOut,
  Brain,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Mail,
  Filter,
  ArrowUpDown,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Key,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon, subtitle }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        <div className="flex items-center mt-2">
          {changeType === 'increase' ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ml-1 ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last month</span>
        </div>
      </div>
      <div className="p-3 bg-orange-50 rounded-lg">
        {icon}
      </div>
    </div>
  </div>
);

interface PromptUsage {
  prompt: string;
  count: number;
  tokensSaved: number;
  category: string;
}

interface AnalyticsData {
  total_prompts: number;
  total_tokens_saved: number;
  total_cost_saved_usd: number;
  avg_compression_rate: number;
  prompts_this_month: number;
}

interface PromptHistory {
  id: string;
  original_prompt: string;
  optimized_prompt: string;
  original_token_count: number;
  optimized_token_count: number;
  tokens_saved: number;
  cost_saved_usd: number;
  optimization_level: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user, profile, signOut, isSigningOut } = useAuth();
  const { navigateTo } = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'highest' | 'lowest'>('highest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Create retry function that can be called from button
  const retryFetch = useCallback(() => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    setDataLoaded(false);
    
    const fetchData = async () => {
      try {
        const analyticsUrl = `http://localhost:8000/analytics/usage/${user.id}`;
        const historyUrl = `http://localhost:8000/prompts/history/${user.id}`;
        
        const timeout = (ms: number) => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), ms)
        );
        
        const analyticsPromise = Promise.race([fetch(analyticsUrl), timeout(5000)]).catch(() => null) as Promise<Response | null>;
        const historyPromise = Promise.race([fetch(historyUrl), timeout(5000)]).catch(() => null) as Promise<Response | null>;
        
        const [analyticsResponse, historyResponse] = await Promise.all([analyticsPromise, historyPromise]);

        if (analyticsResponse && analyticsResponse.ok) {
          const analytics = await analyticsResponse.json();
          setAnalyticsData(analytics);
        } else {
          setAnalyticsData({ total_prompts: 0, total_tokens_saved: 0, total_cost_saved_usd: 0, avg_compression_rate: 0, prompts_this_month: 0 });
        }

        if (historyResponse && historyResponse.ok) {
          const historyData = await historyResponse.json();
          setPromptHistory(historyData.prompts || []);
        } else {
          setPromptHistory([]);
        }
        setDataLoaded(true);
      } catch {
        setError('Failed to load dashboard data');
        setAnalyticsData({ total_prompts: 0, total_tokens_saved: 0, total_cost_saved_usd: 0, avg_compression_rate: 0, prompts_this_month: 0 });
        setPromptHistory([]);
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);

  // Fetch real data from API - only fetch once on mount if data not loaded
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id || dataLoaded) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const analyticsUrl = `http://localhost:8000/analytics/usage/${user.id}`;
        const historyUrl = `http://localhost:8000/prompts/history/${user.id}`;
        
        const timeout = (ms: number) => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), ms)
        );
        
        const analyticsPromise = Promise.race([fetch(analyticsUrl), timeout(5000)]).catch(() => null) as Promise<Response | null>;
        const historyPromise = Promise.race([fetch(historyUrl), timeout(5000)]).catch(() => null) as Promise<Response | null>;
        
        const [analyticsResponse, historyResponse] = await Promise.all([analyticsPromise, historyPromise]);

        if (analyticsResponse && analyticsResponse.ok) {
          const analytics = await (analyticsResponse as any).json();
          setAnalyticsData(analytics);
        } else {
          setAnalyticsData({
            total_prompts: 0,
            total_tokens_saved: 0,
            total_cost_saved_usd: 0,
            avg_compression_rate: 0,
            prompts_this_month: 0
          });
        }

        if (historyResponse && historyResponse.ok) {
          const historyData = await (historyResponse as any).json();
          setPromptHistory(historyData.prompts || []);
        } else {
          setPromptHistory([]);
        }
        
        setDataLoaded(true);
      } catch {
        setError('Failed to load dashboard data');
        // Set default data instead of showing error
        setAnalyticsData({
          total_prompts: 0,
          total_tokens_saved: 0,
          total_cost_saved_usd: 0,
          avg_compression_rate: 0,
          prompts_this_month: 0
        });
        setPromptHistory([]);
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id, dataLoaded]);

  // Realtime updates: subscribe to Supabase changes on prompts for this user
  useEffect(() => {
    if (!user?.id) return;
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('prompts-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'prompts',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        // Refresh analytics and history on any change
        retryFetch();
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [user?.id, retryFetch]);

  // Calculate metrics from real data - memoized
  const metrics = useMemo(() => analyticsData ? {
    promptsRecommended: analyticsData.total_prompts,
    promptsOptimized: analyticsData.total_prompts,
    tokensSaved: analyticsData.total_tokens_saved,
    moneySaved: analyticsData.total_cost_saved_usd,
    optimizationRate: Math.round(analyticsData.avg_compression_rate * 100),
    avgTokenReduction: Math.round(analyticsData.avg_compression_rate * 100)
  } : {
    promptsRecommended: 0,
    promptsOptimized: 0,
    tokensSaved: 0,
    moneySaved: 0,
    optimizationRate: 0,
    avgTokenReduction: 0
  }, [analyticsData]);

  // Process prompt history into most used prompts format - memoized
  const mostUsedPrompts: PromptUsage[] = useMemo(() => promptHistory
    .map(p => ({
      prompt: p.original_prompt.length > 50 ? p.original_prompt.substring(0, 50) + "..." : p.original_prompt,
      count: 1, // Each prompt appears once in history
      tokensSaved: p.tokens_saved,
      category: "General" // Default category, could be enhanced later
    }))
    .slice(0, 20), [promptHistory]); // Show top 20

  // Calculate token comparison from real data - memoized
  const tokenComparison = useMemo(() => {
    if (!promptHistory.length) {
      return {
        withoutPrompTrim: 0,
        withPrompTrim: 0,
        savings: 0,
        savingsPercentage: 0
      };
    }

    const totalOriginalTokens = promptHistory.reduce((sum, p) => sum + p.original_token_count, 0);
    const totalOptimizedTokens = promptHistory.reduce((sum, p) => sum + p.optimized_token_count, 0);
    const totalSaved = promptHistory.reduce((sum, p) => sum + p.tokens_saved, 0);
    const savingsPercentage = totalOriginalTokens > 0 
      ? Math.round((totalSaved / totalOriginalTokens) * 100 * 100) / 100 
      : 0;

    return {
      withoutPrompTrim: totalOriginalTokens,
      withPrompTrim: totalOptimizedTokens,
      savings: totalSaved,
      savingsPercentage
    };
  }, [promptHistory]);

  // Calculate prompt analytics metrics - memoized
  const promptAnalytics = useMemo(() => {
    if (!promptHistory.length) {
      return {
        successRate: 0,
        avgCompressionRate: 0,
        dailyAverage: 0,
        peakHours: "N/A",
        optimizationLevels: {
          aggressive: 0,
          moderate: 0,
          minimal: 0
        },
        complexityDistribution: {
          simple: 0,
          medium: 0,
          complex: 0
        }
      };
    }

    // Calculate success rate (prompts with optimized_text)
    const successfulPrompts = promptHistory.filter(p => p.optimized_prompt && p.optimized_prompt.trim() !== '');
    const successRate = (successfulPrompts.length / promptHistory.length) * 100;

    // Calculate average compression rate
    const avgCompressionRate = analyticsData?.avg_compression_rate || 0;

    // Calculate daily average
    const totalDays = new Set(promptHistory.map(p => p.created_at.split('T')[0])).size || 1;
    const dailyAverage = Math.round(promptHistory.length / totalDays);

    // Group by hour to find peak usage
    const hourGroups: { [key: number]: number } = {};
    promptHistory.forEach(p => {
      const date = new Date(p.created_at);
      const hour = date.getHours();
      hourGroups[hour] = (hourGroups[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourGroups).sort((a, b) => b[1] - a[1])[0];
    const peakHours = peakHour ? `${peakHour[0]}:00-${(parseInt(peakHour[0]) + 2) % 24}:00` : "N/A";

    // Count optimization levels
    const optimizationLevels = promptHistory.reduce((acc, p) => {
      const level = p.optimization_level || 'moderate';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Analyze prompt complexity
    const complexityDistribution = {
      simple: 0,
      medium: 0,
      complex: 0
    };
    promptHistory.forEach(p => {
      const wordCount = p.original_prompt.split(/\s+/).length;
      if (wordCount <= 50) complexityDistribution.simple++;
      else if (wordCount <= 150) complexityDistribution.medium++;
      else complexityDistribution.complex++;
    });

    // Convert to percentages
    const total = complexityDistribution.simple + complexityDistribution.medium + complexityDistribution.complex;
    if (total > 0) {
      complexityDistribution.simple = Math.round((complexityDistribution.simple / total) * 100);
      complexityDistribution.medium = Math.round((complexityDistribution.medium / total) * 100);
      complexityDistribution.complex = Math.round((complexityDistribution.complex / total) * 100);
    }

    return {
      successRate: Math.round(successRate * 10) / 10,
      avgCompressionRate: Math.round(avgCompressionRate * 1000) / 10,
      dailyAverage,
      peakHours,
      optimizationLevels,
      complexityDistribution
    };
  }, [promptHistory, analyticsData]);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'prompts', label: 'Prompt Analytics', icon: Brain },
    { id: 'savings', label: 'Cost Savings', icon: DollarSign },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Get unique categories from prompts - memoized
  const categories = useMemo(() => ['all', ...Array.from(new Set(mostUsedPrompts.map(p => p.category)))], [mostUsedPrompts]);

  // Filter and sort prompts - memoized
  const filteredAndSortedPrompts = useMemo(() => mostUsedPrompts
    .filter(prompt => {
      const matchesSearch = prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prompt.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => sortOrder === 'highest' ? b.count - a.count : a.count - b.count), [mostUsedPrompts, searchQuery, selectedCategory, sortOrder]);

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span className="text-gray-700">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Error Loading Dashboard</h3>
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={retryFetch}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header with Logo */}
        <div className="relative">
          <div className="flex items-center w-full pb-6 pr-4" style={{ paddingLeft: '15px', marginTop: '-38px' }}>
            <div className="flex items-center justify-center bg-transparent" style={{ width: '173px', height: '173px' }}>
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain bg-transparent" />
            </div>
          </div>
        </div>

        {/* Navigation - Right below logo */}
        <nav className="px-4 pb-4 relative z-20" style={{ marginTop: '-39px' }}>
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                      onClick={() => {
                    if (item.id === 'api-keys') {
                      navigateTo('api-keys');
                    } else {
                      setActiveTab(item.id);
                      // Auto-select first subpage when changing tabs
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSortOrder('highest');
                    }
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="ml-3">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Spacer to push user info to bottom */}
        <div className="flex-1"></div>

        {/* Action Buttons - Contact, Help, Logout */}
        <div className="px-4 pb-3 space-y-2">
          <button className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Mail className="h-5 w-5" />
            <span className="ml-3">Contact Us</span>
          </button>
          <button className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="h-5 w-5" />
            <span className="ml-3">Help Centre</span>
          </button>
          <button 
            onClick={async () => {
              console.log('🔥 LOGOUT BUTTON CLICKED!');
              try {
                await signOut();
                console.log('✅ Logout successful');
                navigateTo('landing');
              } catch (error) {
                console.error('❌ Logout failed:', error);
                navigateTo('landing');
              }
            }}
            disabled={isSigningOut}
            className={`w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">{isSigningOut ? 'Signing Out...' : 'Log Out'}</span>
          </button>
        </div>

              {/* Profile Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {profile?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">
                      {profile?.first_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </button>
              </div>
              </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-50 py-4">
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center space-x-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
                <p className="text-gray-600 mt-1">{profile?.first_name || user?.email?.split('@')[0] || 'Loading...'}</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
                </svg>
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
              <div className="text-right">
                  <p className="font-medium text-gray-900">Free Plan</p>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden p-6">
          {activeTab === 'overview' && (
            <div className="h-full flex flex-col gap-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Money Saved"
                  value={`$${metrics.moneySaved.toFixed(2)}`}
                  change={0}
                  changeType="increase"
                  icon={<DollarSign className="h-6 w-6 text-orange-600" />}
                  subtitle="This month"
                />
                <MetricCard
                  title="Tokens Saved"
                  value={metrics.tokensSaved.toLocaleString()}
                  change={0}
                  changeType="increase"
                  icon={<Brain className="h-6 w-6 text-orange-600" />}
                  subtitle={`${metrics.avgTokenReduction}% avg reduction`}
                />
                <MetricCard
                  title="Prompts Recommended"
                  value={metrics.promptsRecommended.toLocaleString()}
                  change={0}
                  changeType="increase"
                  icon={<Target className="h-6 w-6 text-orange-600" />}
                  subtitle="Total AI suggestions"
                />
                <MetricCard
                  title="Prompts Optimized"
                  value={metrics.promptsOptimized.toLocaleString()}
                  change={0}
                  changeType="increase"
                  icon={<Zap className="h-6 w-6 text-orange-600" />}
                  subtitle={`${metrics.optimizationRate}% adoption rate`}
                />
              </div>

              {/* Bottom Section - Token Usage, Cost Savings, and Most Used Prompts */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
                {/* Left Column - Two smaller boxes side by side */}
                <div className="flex flex-col gap-4 h-full">
                  {/* Top Row - Token Usage and Cost Savings Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Token Usage Comparison - Smaller */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Token Usage</h3>
                      <div className="flex items-center gap-4">
                        {/* Stats on the left */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                              <span className="text-sm text-gray-600">Without PrompTrim</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{tokenComparison.withoutPrompTrim.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">With PrompTrim</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{tokenComparison.withPrompTrim.toLocaleString()}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Tokens Saved</span>
                              <span className="text-sm font-bold text-orange-600">{tokenComparison.savings.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bigger Pie Chart on the right */}
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="20"/>
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="20"
                              strokeDasharray={`${tokenComparison.withPrompTrim / tokenComparison.withoutPrompTrim * 251.2} 251.2`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-xl font-bold text-orange-600">{tokenComparison.savingsPercentage}%</p>
                              <p className="text-sm text-gray-500">saved</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost Savings Comparison Pie Chart */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <h3 className="text-base font-semibold text-gray-900 mb-3">Cost Comparison</h3>
                      <div className="flex items-center gap-4">
                        {/* Stats on the left */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                              <span className="text-sm text-gray-600">Without PrompTrim</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">${(tokenComparison.withoutPrompTrim * 0.0015).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="text-sm text-gray-600">With PrompTrim</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">${(tokenComparison.withPrompTrim * 0.0015).toFixed(2)}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Money Saved</span>
                              <span className="text-sm font-bold text-orange-600">${metrics.moneySaved.toFixed(2)}</span>
            </div>
          </div>
        </div>
                        
                        {/* Bigger Pie Chart on the right */}
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                            {/* Background circle */}
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="20"/>
                            {/* Orange segment (with PrompTrim) */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#f97316"
                              strokeWidth="20"
                              strokeDasharray={`${(tokenComparison.withPrompTrim * 0.0015) / (tokenComparison.withoutPrompTrim * 0.0015) * 251.2} 251.2`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-xl font-bold text-orange-600">{Math.round(((tokenComparison.withoutPrompTrim * 0.0015) - (tokenComparison.withPrompTrim * 0.0015)) / (tokenComparison.withoutPrompTrim * 0.0015) * 100)}%</p>
                              <p className="text-sm text-gray-500">saved</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Savings Box - Fills remaining space */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Savings</h3>
                    <div className="space-y-3 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="text-base text-gray-700">This Month</span>
                        <span className="text-xl font-bold text-orange-600">${metrics.moneySaved.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-base text-gray-700">Projected Annual</span>
                        <span className="text-xl font-bold text-gray-800">${(metrics.moneySaved * 12).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                        <span className="text-base text-gray-700">ROI</span>
                        <span className="text-xl font-bold text-orange-600">350%</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avg. Cost per 1K tokens</span>
                          <span className="text-base font-medium text-gray-900">$0.0015</span>
                        </div>
                      </div>
            </div>
            </div>
          </div>

                {/* Most Used Prompts - Scrollable */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col min-h-0">
                  {/* Header with controls */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Most Used Prompts</h3>
                    <div className="flex items-center gap-2">
                      {/* Sort Button */}
                      <button
                        onClick={() => setSortOrder(sortOrder === 'highest' ? 'lowest' : 'highest')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        title={`Sort: ${sortOrder === 'highest' ? 'Highest to Lowest' : 'Lowest to Highest'}`}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                        <span>{sortOrder === 'highest' ? 'High→Low' : 'Low→High'}</span>
                      </button>
                      
                      {/* Filter Button */}
                      <div className="relative">
                        <button
                          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Filter className="h-4 w-4" />
                          <span>Filter</span>
                        </button>
                        
                        {/* Filter Dropdown */}
                        {showFilterDropdown && (
                          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-30 p-3">
                            {/* Search Bar */}
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Search Prompts</label>
                              <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  placeholder="Search by name or category..."
                                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

                            {/* Category Filter */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                              <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              >
                                {categories.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            {/* Clear Filters Button */}
                            {(searchQuery || selectedCategory !== 'all') && (
              <button
                                onClick={() => {
                                  setSearchQuery('');
                                  setSelectedCategory('all');
                                }}
                                className="w-full mt-3 px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                              >
                                Clear Filters
              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
        </div>

                  {/* Prompts List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-custom">
                    {filteredAndSortedPrompts.length > 0 ? (
                      filteredAndSortedPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{prompt.prompt}</p>
                            <p className="text-sm text-gray-500">{prompt.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{prompt.count} uses</p>
                            <p className="text-sm text-orange-600">{prompt.tokensSaved.toLocaleString()} tokens saved</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No prompts found matching your filters.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'prompts' && (
            <div className="h-full overflow-y-auto space-y-4 p-1 scrollbar-custom">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{promptAnalytics.successRate}%</p>
                  <div className="flex items-center text-sm text-orange-500 mt-1">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {promptHistory.length} prompts processed
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Avg Compression Rate</p>
                    <Brain className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{promptAnalytics.avgCompressionRate}%</p>
                  <div className="flex items-center text-sm text-orange-500 mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    Token reduction efficiency
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Daily Average</p>
                    <Activity className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{promptAnalytics.dailyAverage}</p>
                  <div className="flex items-center text-sm text-orange-500 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Prompts per day
                  </div>
                </div>
              </div>

              {/* Usage Patterns Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">Peak Usage Hours</h4>
                    <p className="text-xl font-bold text-orange-600">{promptAnalytics.peakHours}</p>
                    <p className="text-xs text-gray-600 mt-1">Most active time</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">Total Prompts</h4>
                    <p className="text-xl font-bold text-gray-800">{promptHistory.length}</p>
                    <p className="text-xs text-gray-600 mt-1">optimized</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg border border-orange-300">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">Compression Rate</h4>
                    <p className="text-xl font-bold text-orange-600">{promptAnalytics.avgCompressionRate}%</p>
                    <p className="text-xs text-gray-600 mt-1">avg reduction</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">Usage Summary</h4>
                  <p className="text-xs text-gray-600">
                    You've optimized {promptHistory.length} prompts with an average compression rate of {promptAnalytics.avgCompressionRate}%.
                    {promptHistory.length > 0 && ` Peak usage occurs between ${promptAnalytics.peakHours}.`}
                  </p>
                </div>
              </div>


              {/* AI Model Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Levels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Aggressive</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${promptHistory.length > 0 ? (promptAnalytics.optimizationLevels.aggressive || 0) / promptHistory.length * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{promptAnalytics.optimizationLevels.aggressive || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Moderate</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${promptHistory.length > 0 ? (promptAnalytics.optimizationLevels.moderate || 0) / promptHistory.length * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{promptAnalytics.optimizationLevels.moderate || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Minimal</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${promptHistory.length > 0 ? (promptAnalytics.optimizationLevels.minimal || 0) / promptHistory.length * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{promptAnalytics.optimizationLevels.minimal || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compression Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <span className="text-sm font-medium text-gray-900">Total Tokens Saved</span>
                      <span className="text-sm font-bold text-orange-600">{analyticsData?.total_tokens_saved || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-900">Total Cost Saved</span>
                      <span className="text-sm font-bold text-gray-900">${(analyticsData?.total_cost_saved_usd || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <span className="text-sm font-medium text-gray-900">Avg Compression</span>
                      <span className="text-sm font-bold text-orange-600">{promptAnalytics.avgCompressionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Behavior Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt Complexity Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Simple (1-50 words)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${promptAnalytics.complexityDistribution.simple}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{promptAnalytics.complexityDistribution.simple}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Medium (51-150 words)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-400 h-2 rounded-full" style={{ width: `${promptAnalytics.complexityDistribution.medium}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{promptAnalytics.complexityDistribution.medium}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Complex (150+ words)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${promptAnalytics.complexityDistribution.complex}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{promptAnalytics.complexityDistribution.complex}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Savings by Category</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Total Saved</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{analyticsData?.total_tokens_saved.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Avg Savings</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{Math.round((analyticsData?.total_tokens_saved || 0) / Math.max(promptHistory.length, 1))}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Success Rate</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{promptAnalytics.successRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {activeTab === 'savings' && (
          <div className="h-full flex flex-col gap-3">
            {/* Cost Comparison Header */}
            <div className="bg-gradient-to-r from-orange-50 to-gray-50 rounded-lg border border-orange-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-1">How PrompTrim Saves You Money</h2>
              <p className="text-xs text-gray-600">See the dramatic difference PrompTrim makes in your AI costs</p>
            </div>

              {/* Main Content Grid */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Top Row - Comparison Boxes and Pie Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Without PrompTrim Box */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-gray-800">Without PrompTrim</h3>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Token Usage</span>
                        <span className="text-sm font-bold text-gray-800">{tokenComparison.withoutPrompTrim.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Cost per 1K</span>
                        <span className="text-xs font-semibold text-gray-900">$0.0015</span>
                      </div>
                      <div className="border-t pt-1 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-900">Monthly Cost</span>
                        <span className="text-sm font-bold text-gray-800">${(tokenComparison.withoutPrompTrim * 0.0015).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-700 mt-2">
                      <p>• Inefficient prompts</p>
                      <p>• High token usage</p>
                      <p>• Wasted API calls</p>
                    </div>
                  </div>

                  {/* With PrompTrim Box */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-orange-800">With PrompTrim</h3>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-orange-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Token Usage</span>
                        <span className="text-sm font-bold text-orange-600">{tokenComparison.withPrompTrim.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Cost per 1K</span>
                        <span className="text-xs font-semibold text-gray-900">$0.0015</span>
                      </div>
                      <div className="border-t pt-1 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-900">Monthly Cost</span>
                        <span className="text-sm font-bold text-orange-600">${(tokenComparison.withPrompTrim * 0.0015).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-orange-700 mt-2">
                      <p>• Optimized prompts</p>
                      <p>• Reduced tokens</p>
                      <p>• Efficient usage</p>
                    </div>
                  </div>

                  {/* Cost Distribution */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Cost Distribution</h3>
                    <div className="flex items-center gap-1">
                      {/* Stats on the left - compact with bigger text */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                            <span className="text-sm text-gray-600">Without PrompTrim</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-16 text-right">${(tokenComparison.withoutPrompTrim * 0.0015).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">With PrompTrim</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-16 text-right">${(tokenComparison.withPrompTrim * 0.0015).toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200"></div>
                        <div className="pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Money Saved</span>
                            <span className="text-sm font-bold text-orange-600 w-16 text-right">${metrics.moneySaved.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Much Bigger Pie Chart on the right */}
                      <div className="relative w-36 h-36 flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                          {/* Background circle */}
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="20"/>
                          {/* Orange segment (with PrompTrim) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="20"
                            strokeDasharray={`${tokenComparison.withPrompTrim / tokenComparison.withoutPrompTrim * 251.2} 251.2`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-xl font-bold text-orange-600">{tokenComparison.savingsPercentage}%</p>
                            <p className="text-sm text-gray-500">saved</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Savings Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Cost Savings Breakdown</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-lg font-bold text-orange-600 mb-1">{tokenComparison.savings.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Tokens Saved</div>
                      <div className="text-xs text-orange-600 font-medium">{tokenComparison.savingsPercentage}%</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-lg font-bold text-gray-800 mb-1">${metrics.moneySaved.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">Monthly</div>
                      <div className="text-xs text-gray-800 font-medium">This month</div>
                    </div>
                    <div className="text-center p-2 bg-orange-100 rounded-lg border border-orange-300">
                      <div className="text-lg font-bold text-orange-600 mb-1">${(metrics.moneySaved * 12).toFixed(2)}</div>
                      <div className="text-xs text-gray-600">Annual</div>
                      <div className="text-xs text-orange-600 font-medium">Projected</div>
                    </div>
                  </div>
                </div>

                {/* ROI Calculator - Landscape */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 h-full flex flex-col" style={{ paddingBottom: '10px' }}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">ROI Calculator</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                    <div className="flex flex-col">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Investment vs Returns</h4>
                      <div className="space-y-3 flex-1">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Subscription</span>
                          <span className="text-sm font-medium text-gray-800">$29/month</span>
                        </div>
                        <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
                          <span className="text-sm text-gray-600">Monthly Savings</span>
                          <span className="text-sm font-bold text-orange-600">${metrics.moneySaved.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-100 rounded-lg">
                          <span className="text-sm text-gray-600">Net Benefit</span>
                          <span className="text-sm font-bold text-gray-800">${(metrics.moneySaved - 29).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between mt-auto">
                          <span className="text-sm font-medium text-gray-900">ROI</span>
                          <span className="text-sm font-bold text-orange-600">{Math.round(((metrics.moneySaved - 29) / 29) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Break-even Analysis</h4>
                      <div className="space-y-3 flex-1">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Break-even</span>
                          <span className="text-sm font-medium text-gray-800">2.3 days</span>
                        </div>
                        <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
                          <span className="text-sm text-gray-600">Annual Savings</span>
                          <span className="text-sm font-bold text-orange-600">${(metrics.moneySaved * 12).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-100 rounded-lg">
                          <span className="text-sm text-gray-600">3-Year Savings</span>
                          <span className="text-sm font-bold text-gray-800">${(metrics.moneySaved * 36).toFixed(2)}</span>
                        </div>
                        <div className="pt-3 border-t mt-auto">
                          <div className="text-sm text-gray-600 mb-1">Cost per 1K tokens:</div>
                          <div className="text-sm font-bold text-orange-600">$0.0015</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
                <p className="text-gray-600">Export your analytics data in various formats.</p>
              </div>
        </div>
          )}

          {activeTab === 'profile' && (
            <div className="h-full flex flex-col gap-4">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-orange-50 to-gray-50 rounded-lg border border-orange-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {profile?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profile?.first_name || 'User'}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-orange-600 font-medium mt-1">
                      {profile?.subscription_tier === 'free' ? 'Free Plan' : 'Premium Plan'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900">{profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : 'Not provided'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900">{user?.email || 'Not provided'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900 font-mono text-sm">{user?.id || 'Not available'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-900">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Statistics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Subscription Tier</span>
                      <span className="text-sm font-semibold text-gray-800 capitalize">
                        {profile?.subscription_tier || 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm text-gray-600">Monthly Token Limit</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {profile?.monthly_token_limit?.toLocaleString() || '10,000'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                      <span className="text-sm text-gray-600">Tokens Used This Month</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {profile?.tokens_used_this_month?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-100 rounded-lg">
                      <span className="text-sm text-gray-600">Usage Percentage</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {profile?.monthly_token_limit && profile?.tokens_used_this_month 
                          ? Math.round((profile.tokens_used_this_month / profile.monthly_token_limit) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage Progress */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Token Usage</span>
                      <span className="font-medium">
                        {profile?.tokens_used_this_month?.toLocaleString() || '0'} / {profile?.monthly_token_limit?.toLocaleString() || '10,000'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-gray-800 h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${profile?.monthly_token_limit && profile?.tokens_used_this_month 
                            ? Math.min((profile.tokens_used_this_month / profile.monthly_token_limit) * 100, 100)
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>{profile?.monthly_token_limit?.toLocaleString() || '10,000'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full flex flex-col gap-4">
              {/* Settings Header */}
              <div className="bg-gradient-to-r from-orange-50 to-gray-50 rounded-lg border border-orange-200 p-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Settings</h2>
                <p className="text-sm text-gray-600">Configure your PrompTrim preferences and account settings</p>
              </div>

              {/* Settings Content */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Account Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
                      <div className="flex items-center">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500" />
                        <span className="ml-2 text-sm text-gray-600">Receive email updates about your usage</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Usage Alerts</label>
                      <div className="flex items-center">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500" />
                        <span className="ml-2 text-sm text-gray-600">Get notified when approaching token limits</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Auto-Optimization</label>
                      <div className="flex items-center">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500" />
                        <span className="ml-2 text-sm text-gray-600">Automatically optimize prompts when possible</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Settings */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default AI Model</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>GPT-4</option>
                        <option>GPT-3.5 Turbo</option>
                        <option>Claude 3</option>
                        <option>Gemini Pro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Tokens per Request</label>
                      <input 
                        type="number" 
                        defaultValue="4000"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        defaultValue="0.7"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: 'linear-gradient(to right, #000000 0%, #000000 70%, #6b7280 70%, #6b7280 100%)'
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 (Focused)</span>
                        <span>1 (Creative)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing & Subscription */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing & Subscription</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Current Plan</h4>
                      <p className="text-2xl font-bold text-orange-600 capitalize">{profile?.subscription_tier || 'Free'}</p>
                      <p className="text-sm text-gray-600 mt-1">Monthly token limit: {profile?.monthly_token_limit?.toLocaleString() || '10,000'}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Usage This Month</h4>
                      <p className="text-2xl font-bold text-orange-600">{profile?.tokens_used_this_month?.toLocaleString() || '0'}</p>
                      <p className="text-sm text-gray-600 mt-1">tokens used</p>
                    </div>
                    <div className="p-4 bg-gray-100 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Remaining</h4>
                      <p className="text-2xl font-bold text-gray-800">
                        {profile?.monthly_token_limit && profile?.tokens_used_this_month 
                          ? (profile.monthly_token_limit - profile.tokens_used_this_month).toLocaleString()
                          : (profile?.monthly_token_limit || 10000).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">tokens remaining</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export { Dashboard };