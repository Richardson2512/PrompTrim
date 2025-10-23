#!/bin/bash
# Bash script to set up environment variables for PromptTrim
# Run this script: chmod +x setup-env.sh && ./setup-env.sh

echo "🚀 Setting up PromptTrim Environment Variables..."
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 0
    fi
fi

# Get Supabase credentials
echo "📝 Please enter your Supabase credentials:"
echo "(You can find these in Supabase Dashboard → Settings → API)"
echo ""

read -p "Supabase URL: " supabase_url
read -p "Supabase Anon Key: " supabase_key

# Create .env file
cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$supabase_url
VITE_SUPABASE_ANON_KEY=$supabase_key

# Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSyBn7zHmeXe54sTv9UKV-4vDBt446yXJ5a0
EOF

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "📋 Your configuration:"
echo "  - Supabase URL: $supabase_url"
echo "  - Gemini API Key: Configured ✓"
echo ""
echo "🎯 Next steps:"
echo "  1. Run: npm install"
echo "  2. Run: npm run dev"
echo "  3. Open your browser and start optimizing prompts!"
echo ""
echo "💡 Tip: The AI-powered optimization will work automatically!"

