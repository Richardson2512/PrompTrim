import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Activity,
  Menu,
  X,
  Download,
  Settings,
  LogOut,
  Brain,
  Target,
  PieChart,
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
  Users,
  Globe,
  Monitor,
  Smartphone,
  User,
  Star,
  TrendingDown
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

const Dashboard: React.FC = () => {
  const { user, profile, signOut, isSigningOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'highest' | 'lowest'>('highest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data - in real app, this would come from your API
  const metrics = {
    promptsRecommended: 1247,
    promptsOptimized: 892,
    tokensSaved: 77778,
    moneySaved: 116.67,
    optimizationRate: 71.5,
    avgTokenReduction: 33.2
  };

  const mostUsedPrompts: PromptUsage[] = [
    { prompt: "Write a professional email to...", count: 45, tokensSaved: 2340, category: "Communication" },
    { prompt: "Write a security audit report for...", count: 43, tokensSaved: 2150, category: "Security" },
    { prompt: "Debug this Python function...", count: 42, tokensSaved: 2200, category: "Development" },
    { prompt: "Generate integration tests for...", count: 41, tokensSaved: 2050, category: "Testing" },
    { prompt: "Create a deployment checklist for...", count: 40, tokensSaved: 2000, category: "DevOps" },
    { prompt: "Translate this document to Spanish...", count: 39, tokensSaved: 1980, category: "Translation" },
    { prompt: "Generate code for a React component...", count: 38, tokensSaved: 1890, category: "Development" },
    { prompt: "Write a blog post about...", count: 37, tokensSaved: 1850, category: "Content" },
    { prompt: "Write a feature request template for...", count: 36, tokensSaved: 1800, category: "Project Management" },
    { prompt: "Create a SQL query for...", count: 35, tokensSaved: 1750, category: "Development" },
    { prompt: "Generate error handling code for...", count: 34, tokensSaved: 1700, category: "Development" },
    { prompt: "Generate test cases for...", count: 33, tokensSaved: 1650, category: "Testing" },
    { prompt: "Create a monitoring dashboard for...", count: 33, tokensSaved: 1650, category: "DevOps" },
    { prompt: "Summarize the following text...", count: 32, tokensSaved: 1567, category: "Content" },
    { prompt: "Write a performance optimization guide...", count: 32, tokensSaved: 1600, category: "Documentation" },
    { prompt: "Review this code and suggest improvements...", count: 31, tokensSaved: 1550, category: "Development" },
    { prompt: "Generate a backup strategy for...", count: 31, tokensSaved: 1550, category: "DevOps" },
    { prompt: "Write a product description for...", count: 30, tokensSaved: 1500, category: "Marketing" },
    { prompt: "Create a CI/CD pipeline for...", count: 30, tokensSaved: 1500, category: "DevOps" },
    { prompt: "Create a project timeline for...", count: 29, tokensSaved: 1450, category: "Project Management" },
    { prompt: "Write a disaster recovery plan for...", count: 29, tokensSaved: 1450, category: "Business" },
    { prompt: "Explain this concept in simple terms...", count: 28, tokensSaved: 1234, category: "Education" },
    { prompt: "Draft a meeting agenda for...", count: 27, tokensSaved: 1350, category: "Communication" },
    { prompt: "Generate API documentation for...", count: 26, tokensSaved: 1300, category: "Documentation" },
    { prompt: "Write a customer support response...", count: 25, tokensSaved: 1250, category: "Support" },
    { prompt: "Create a marketing strategy for...", count: 24, tokensSaved: 2100, category: "Marketing" },
    { prompt: "Create social media posts for...", count: 24, tokensSaved: 1200, category: "Marketing" },
    { prompt: "Analyze this data and provide insights...", count: 23, tokensSaved: 1150, category: "Analytics" },
    { prompt: "Write unit tests for this function...", count: 22, tokensSaved: 1100, category: "Testing" },
    { prompt: "Generate a README file for...", count: 21, tokensSaved: 1050, category: "Documentation" },
    { prompt: "Create a presentation outline for...", count: 20, tokensSaved: 1000, category: "Content" },
    { prompt: "Debug this JavaScript error...", count: 19, tokensSaved: 950, category: "Development" },
    { prompt: "Write a press release about...", count: 18, tokensSaved: 900, category: "Communication" },
    { prompt: "Generate a CSS stylesheet for...", count: 17, tokensSaved: 850, category: "Development" },
    { prompt: "Create a user story for...", count: 16, tokensSaved: 800, category: "Project Management" },
    { prompt: "Write a technical specification for...", count: 15, tokensSaved: 750, category: "Documentation" },
    { prompt: "Generate SEO keywords for...", count: 14, tokensSaved: 700, category: "Marketing" },
    { prompt: "Create a database schema for...", count: 13, tokensSaved: 650, category: "Development" },
    { prompt: "Write acceptance criteria for...", count: 12, tokensSaved: 600, category: "Project Management" },
    { prompt: "Generate a sitemap for...", count: 11, tokensSaved: 550, category: "Development" },
    { prompt: "Create an FAQ section for...", count: 10, tokensSaved: 500, category: "Support" },
    { prompt: "Write a business proposal for...", count: 9, tokensSaved: 450, category: "Business" },
    { prompt: "Generate mock data for testing...", count: 8, tokensSaved: 400, category: "Testing" },
    { prompt: "Create a style guide for...", count: 7, tokensSaved: 350, category: "Design" },
    { prompt: "Write a case study about...", count: 6, tokensSaved: 300, category: "Content" },
    { prompt: "Generate a changelog for...", count: 5, tokensSaved: 250, category: "Documentation" },
    { prompt: "Create a landing page copy for...", count: 4, tokensSaved: 200, category: "Marketing" },
    { prompt: "Write an onboarding guide for...", count: 3, tokensSaved: 150, category: "Documentation" },
    { prompt: "Generate a migration script for...", count: 2, tokensSaved: 100, category: "Development" },
    { prompt: "Create a data model for...", count: 1, tokensSaved: 50, category: "Development" }
  ];

  const commonPrompts = [
    { text: "Write a", count: 156, avgTokens: 45 },
    { text: "Generate", count: 134, avgTokens: 38 },
    { text: "Create a", count: 98, avgTokens: 52 },
    { text: "Explain", count: 87, avgTokens: 41 },
    { text: "Summarize", count: 76, avgTokens: 29 }
  ];

  const tokenComparison = {
    withoutPrompTrim: 234567,
    withPrompTrim: 156789,
    savings: 77778,
    savingsPercentage: 33.2
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'prompts', label: 'Prompt Analytics', icon: Brain },
    { id: 'savings', label: 'Cost Savings', icon: DollarSign },
    { id: 'export', label: 'Export Data', icon: Download },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Get unique categories from prompts
  const categories = ['all', ...Array.from(new Set(mostUsedPrompts.map(p => p.category)))];

  // Filter and sort prompts
  const filteredAndSortedPrompts = mostUsedPrompts
    .filter(prompt => {
      const matchesSearch = prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           prompt.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => sortOrder === 'highest' ? b.count - a.count : a.count - b.count);

  return (
    <div className="h-screen bg-gray-50 flex">
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
                  onClick={() => setActiveTab(item.id)}
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
            onClick={() => {
              console.log('🔥 LOGOUT BUTTON CLICKED!');
              signOut().then(() => {
                console.log('✅ Logout successful');
              }).catch((error) => {
                console.error('❌ Logout failed:', error);
              });
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
                  change={22.1}
                  changeType="increase"
                  icon={<DollarSign className="h-6 w-6 text-orange-600" />}
                  subtitle="This month"
                />
                <MetricCard
                  title="Tokens Saved"
                  value={metrics.tokensSaved.toLocaleString()}
                  change={15.7}
                  changeType="increase"
                  icon={<Brain className="h-6 w-6 text-orange-600" />}
                  subtitle={`${metrics.avgTokenReduction}% avg reduction`}
                />
                <MetricCard
                  title="Prompts Recommended"
                  value={metrics.promptsRecommended.toLocaleString()}
                  change={12.5}
                  changeType="increase"
                  icon={<Target className="h-6 w-6 text-orange-600" />}
                  subtitle="Total AI suggestions"
                />
                <MetricCard
                  title="Prompts Optimized"
                  value={metrics.promptsOptimized.toLocaleString()}
                  change={8.3}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">94.2%</p>
                  <div className="flex items-center text-sm text-orange-500 mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    2.1% vs last month
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Avg Response Time</p>
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">1.2s</p>
                  <div className="flex items-center text-sm text-orange-500 mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    15% faster
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">User Satisfaction</p>
                    <Star className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">4.8/5</p>
                  <div className="flex items-center text-sm text-orange-500 mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    0.3 improvement
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Error Rate</p>
                    <AlertCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">2.1%</p>
                  <div className="flex items-center text-sm text-orange-500 mt-1">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    0.8% reduction
                  </div>
                </div>
              </div>

              {/* Usage Patterns Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">Peak Usage Hours</h4>
                    <p className="text-xl font-bold text-orange-600">9-11 AM</p>
                    <p className="text-xs text-gray-600 mt-1">Most active time</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">Daily Average</h4>
                    <p className="text-xl font-bold text-gray-800">2,847</p>
                    <p className="text-xs text-gray-600 mt-1">prompts per day</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg border border-orange-300">
                    <h4 className="font-medium text-gray-900 mb-1 text-sm">Weekly Growth</h4>
                    <p className="text-xl font-bold text-orange-600">+18%</p>
                    <p className="text-xs text-gray-600 mt-1">vs last week</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">Usage Trends</h4>
                  <p className="text-xs text-gray-600">
                    Your usage patterns show consistent growth with peak activity during business hours. 
                    The most common prompt types are content generation and data analysis, with an average 
                    optimization rate of 34% across all categories.
                  </p>
                </div>
              </div>

              {/* Geographic & Device Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600">North America</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">42%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-800" />
                        <span className="text-sm text-gray-600">Europe</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">28%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-gray-600">Asia Pacific</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-700" />
                        <span className="text-sm text-gray-600">Other</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">12%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device & Browser Analytics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600">Desktop</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">68%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-gray-800" />
                        <span className="text-sm text-gray-600">Mobile</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">24%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-gray-600">Tablet</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">8%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Model Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Reduction Efficiency</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Simple Prompts</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Complex Prompts</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-400 h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Technical Prompts</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                        </div>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Creative Prompts</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-800 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Accuracy by Category</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium">Development</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">96.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                        <span className="text-sm font-medium">Marketing</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">94.8%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                        <span className="text-sm font-medium">Content</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">93.1%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                        <span className="text-sm font-medium">Education</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">91.7%</span>
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
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Medium (51-150 words)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-400 h-2 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Complex (150+ words)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-gray-800 h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Adoption</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Auto-Optimization</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">89%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">Smart Suggestions</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">76%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Custom Templates</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">64%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-gray-700" />
                        <span className="text-sm font-medium">A/B Testing</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">42%</span>
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