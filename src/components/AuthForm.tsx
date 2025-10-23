import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSignupSuccess(false);
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
        setSignupSuccess(true);
        // Clear form after successful signup
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left side - PromptTrim branding with features */}
      <div 
        className="flex-1 relative overflow-hidden"
        style={{
          background: 'linear-gradient(189.4deg, #72CAFD 15.16%, rgba(161, 209, 255, 0.93) 52.67%, #65C0F3 96.46%)',
          boxShadow: '0px 0px 13.7px 11px rgba(255, 255, 255, 0.25) inset'
        }}
      >
        {/* Background bubbles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-300/40 rounded-full blur-lg"></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-blue-300/30 rounded-full blur-xl"></div>
          <div className="absolute top-60 left-60 w-20 h-20 bg-blue-400/30 rounded-full blur-lg"></div>
          <div className="absolute bottom-60 right-60 w-36 h-36 bg-blue-200/25 rounded-full blur-2xl"></div>
        </div>

        {/* Abstract lines pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-96 h-96">
            {/* Central swirling pattern */}
            <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
            <div className="absolute inset-8 border border-white/15 rounded-full"></div>
            <div className="absolute inset-16 border border-white/10 rounded-full"></div>
            
            {/* Connecting lines to features */}
            <div className="absolute top-0 left-1/2 w-px h-32 bg-white/20 transform -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-px h-32 bg-white/20 transform -translate-x-1/2"></div>
            <div className="absolute left-0 top-1/2 w-32 h-px bg-white/20 transform -translate-y-1/2"></div>
            <div className="absolute right-0 top-1/2 w-32 h-px bg-white/20 transform -translate-y-1/2"></div>
          </div>
        </div>

        {/* Feature labels */}
        <div className="absolute top-32 left-16">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <span className="text-blue-800/80 font-medium">Performance tracking</span>
          </div>
        </div>
        <div className="absolute top-32 right-16">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <span className="text-blue-800/80 font-medium">AI insights</span>
          </div>
        </div>
        <div className="absolute bottom-32 left-16">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <span className="text-blue-800/80 font-medium">Team management</span>
          </div>
        </div>
        <div className="absolute bottom-32 right-16">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <span className="text-blue-800/80 font-medium">Growth analytics</span>
          </div>
        </div>
      </div>

      {/* Right side - Login/Signup form */}
      <div className="w-full max-w-lg bg-white flex items-center justify-center p-8 h-full overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Welcome text */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">AI-powered prompt optimization for teams and business.</p>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 p-6 relative z-5 rounded-md">
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 font-medium transition-all rounded-md ${
                  isLogin
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 font-medium transition-all rounded-md ${
                  !isLogin
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-md"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300  text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white border border-gray-300  text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 focus:ring-orange-500 focus:ring-2 rounded-md"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-orange-500 hover:text-orange-600">
                  Forget password?
                </a>
              </div>

              {signupSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-600 text-sm">
                  ✅ Account created successfully! Please check your email and click the confirmation link to activate your account.
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};