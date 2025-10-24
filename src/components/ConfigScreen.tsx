import React from 'react';

const ConfigScreen = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            🔧 Configuration Required
          </h1>
          <p className="text-slate-300 text-lg">
            Please configure your Supabase credentials to use PromptTrim
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            📋 Setup Instructions
          </h2>
          <div className="space-y-4 text-slate-300">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Create a Supabase Project</h3>
              <p>Visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">supabase.com</a> and create a new project</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">2. Get Your Credentials</h3>
              <p>Go to Settings → API in your Supabase dashboard to find:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Project URL</li>
                <li>Anon (public) key</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">3. Update Your .env File</h3>
              <p>Replace the placeholder values in your <code className="bg-slate-600 px-2 py-1 rounded">.env</code> file:</p>
              <div className="bg-slate-600 rounded p-3 mt-2 font-mono text-sm">
                <div>VITE_SUPABASE_URL=your_actual_supabase_url</div>
                <div>VITE_SUPABASE_ANON_KEY=your_actual_anon_key</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">4. Restart the Development Server</h3>
              <p>Stop the server (Ctrl+C) and run <code className="bg-slate-600 px-2 py-1 rounded">npm run dev</code> again</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-400 text-xl">💡</div>
            <div>
              <h3 className="font-semibold text-blue-300 mb-2">Quick Setup Script</h3>
              <p className="text-blue-200 text-sm">
                You can also use the automated setup script: <code className="bg-blue-800/50 px-2 py-1 rounded">.\setup-env.ps1</code>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            🔄 Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigScreen;
