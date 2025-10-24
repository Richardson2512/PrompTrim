import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isSigningOut: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// No mock functions - use real Supabase authentication only

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isInitializedRef = useRef(false);

  console.log('🔧 AuthProvider render:', { user: !!user, profile: !!profile, loading, isSigningOut });

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping profile fetch');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Profile fetch failed:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    if (isInitializedRef.current) {
      console.log('🔄 AuthProvider already initialized, skipping...');
      return;
    }

    console.log('🚀 AuthProvider initializing for the first time...');
    isInitializedRef.current = true;

    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase is not configured. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      setLoading(false);
      return;
    }

    // Handle email confirmation from URL
    const handleEmailConfirmation = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
        }
        if (data.session) {
          setUser(data.session.user);
          const profileData = await fetchProfile(data.session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    handleEmailConfirmation();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', { event, hasUser: !!session?.user, userId: session?.user?.id });
      try {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            let profileData = await fetchProfile(session.user.id);
            
            // If profile doesn't exist (e.g., after email confirmation), create it
            if (!profileData && event === 'SIGNED_IN') {
              console.log('🔄 Creating new profile for user...');
              const firstName = session.user.user_metadata?.first_name || 'User';
              const lastName = session.user.user_metadata?.last_name || '';
              const email = session.user.email || '';
              
              const { error: profileError } = await supabase.from('profiles').insert({
                id: session.user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                subscription_tier: 'free',
                monthly_token_limit: 10000,
                tokens_used_this_month: 0,
              });

              if (!profileError) {
                profileData = await fetchProfile(session.user.id);
                console.log('✅ Profile created successfully');
              } else {
                console.error('Profile creation error:', profileError);
              }
            }
            
            setProfile(profileData);
          } catch (profileError) {
            console.error('Profile handling error:', profileError);
            setProfile(null);
          }
        } else {
          console.log('🔄 No user session, clearing profile');
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Please configure Supabase credentials in your .env file to use authentication features.');
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('User already registered') || 
          error.message.includes('already been registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      throw error;
    }

    // Note: Profile will be created after email confirmation
    // The profile creation is handled in the auth state change listener
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Please configure Supabase credentials in your .env file to use authentication features.');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link to activate your account.');
      }
      if (error.message.includes('Invalid login credentials') || 
          error.message.includes('User not found')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    if (isSigningOut) {
      console.log('⚠️ Sign out already in progress, ignoring...');
      return;
    }

    console.log('🚪 signOut function called');
    setIsSigningOut(true);

    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase not configured');
      setIsSigningOut(false);
      throw new Error('Supabase is not configured. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }

    try {
      console.log('🔄 Calling supabase.auth.signOut()...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Supabase signOut error:', error);
        // Don't throw here, still clear local state
      } else {
        console.log('✅ Supabase signOut successful');
      }
      
      // Always clear local state regardless of Supabase response
      console.log('🔄 Clearing local state...');
      setUser(null);
      setProfile(null);
      console.log('✅ Successfully signed out and cleared state');
      console.log('🎯 Logout process completed - user should be redirected to landing page');
      
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      // Even if everything fails, clear local state
      console.log('🔄 Force clearing local state...');
      setUser(null);
      setProfile(null);
      console.log('✅ Local state cleared despite error');
    } finally {
      setIsSigningOut(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isSigningOut,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
