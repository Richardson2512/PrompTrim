import { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Key, Plus, AlertCircle, Trash2, X, Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  key_type: string; // "input" or "output"
  optimization_level: string; // "aggressive", "moderate", or "minimal"
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
  full_key?: string; // Only available when first created
}

const ApiKeyManager = () => {
  const { navigateTo } = useRouter();
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'input' | 'output' | 'overall'>('input');
  const [newKeyOptimizationLevel, setNewKeyOptimizationLevel] = useState<'aggressive' | 'moderate' | 'minimal'>('moderate');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKeyPopup, setShowKeyPopup] = useState<{ fullKey: string; name: string } | null>(null);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
  const [copiedInPopup, setCopiedInPopup] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigateTo('login');
    }
  }, [user, authLoading, navigateTo]);

  // Use authenticated user ID
  const userId = user?.id;

  const loadApiKeys = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const response = await Promise.race([
        fetch(`http://localhost:8000/api-keys/${userId}`),
        timeoutPromise
      ]) as Response;
      
      if (response.ok) {
      const keys = await response.json();
      // Filter to show only active/live keys (remove demo keys)
      setApiKeys(keys.filter((key: ApiKey) => key.is_active === true));
      } else {
        // Backend not available or failed
        // Fallback to Supabase direct fetch if configured
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('api_keys')
            .select('id, user_id, key_prefix, name, key_type, optimization_level, is_active, last_used_at, created_at')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          if (!error && data) {
            setApiKeys(data as unknown as ApiKey[]);
          } else {
            setApiKeys([]);
          }
        } else {
          setApiKeys([]);
        }
      }
    } catch (err) {
      console.error('Failed to load API keys:', err);
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('api_keys')
          .select('id, user_id, key_prefix, name, key_type, optimization_level, is_active, last_used_at, created_at')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (!error && data) {
          setApiKeys(data as unknown as ApiKey[]);
        } else {
          setApiKeys([]);
        }
      } else {
        setApiKeys([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadApiKeys();
    }
  }, [userId, loadApiKeys]);

  // Realtime subscribe to api_keys changes for this user (if Supabase configured)
  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) return;
    const channel = supabase
      .channel('api-keys-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'api_keys',
        filter: `user_id=eq.${userId}`,
      }, () => {
        loadApiKeys();
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [userId, loadApiKeys]);

  const createApiKey = async () => {
    if (!newKeyName.trim() || !userId) return;
    
    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api-keys/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newKeyName.trim(),
          key_type: newKeyType,
          optimization_level: newKeyOptimizationLevel
        }),
      });

      if (response.ok) {
        const newKey = await response.json();
        
        // Show popup with the full key from backend response
        if (newKey.full_key) {
          setShowKeyPopup({ fullKey: newKey.full_key, name: newKey.name });
        }
        
        // Add to the list (backend already provides everything we need)
        setApiKeys([newKey, ...apiKeys]);
        setNewKeyName('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || errorData.error || 'Failed to create API key');
      }
    } catch (err) {
      setError('Failed to create API key. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!userId || !confirm('Are you sure you want to revoke this API key? This will permanently delete it and prevent any future use.')) {
      return;
    }
    
    setDeletingKeyId(keyId);
    try {
      const response = await fetch(`http://localhost:8000/api-keys/${userId}/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the key from the list
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
      } else {
        setError('Failed to revoke API key');
      }
    } catch (err) {
      setError('Failed to revoke API key. Please try again.');
    } finally {
      setDeletingKeyId(null);
    }
  };

  // Show all keys regardless of type
  const filteredKeys = apiKeys;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Close popup and remove full_key from state
  const closeKeyPopup = () => {
    if (showKeyPopup) {
      setShowKeyPopup(null);
      setCopiedInPopup(false);
      // Remove full_key from the key that was just created
      setApiKeys(keys => keys.map(key => 
        key.full_key ? { ...key, full_key: undefined } : key
      ));
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#FFFFFF',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        <div style={{ color: '#1F1F1F', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  // Get the key display (last 8 chars after pt_)
  const getKeyDisplay = (key: ApiKey) => {
    if (key.full_key) {
      // Show full key if available (during popup)
      return key.full_key;
    }
    // Show only last 8 characters for security
    // key_prefix format is like "pt_ABC123...XYZ789" (first 8 + ... + last 8)
    // We show "pt_••••••••XYZ789" to display only last 8 characters
    const prefixParts = key.key_prefix.split('...');
    if (prefixParts.length >= 2) {
      return 'pt_' + '•'.repeat(prefixParts[0].replace('pt_', '').length) + prefixParts[1];
    }
    return key.key_prefix;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      fontFamily: 'JetBrains Mono, monospace',
      padding: '40px 20px'
    }}>
      {/* Popup for showing full key */}
      {showKeyPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#1F1F1F',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 107, 53, 0.3)',
            position: 'relative',
            border: '2px solid #FF6B35'
          }}>
            {/* Close Button (X) */}
            <button
              onClick={closeKeyPopup}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FF6B35';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X size={20} style={{ color: '#FFFFFF' }} />
            </button>

            {/* Warning Message */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              padding: '12px',
              background: '#FF6B35',
              border: '1px solid #FF6B35',
              borderRadius: '8px'
            }}>
              <AlertCircle size={20} style={{ color: '#1F1F1F', flexShrink: 0 }} />
              <p style={{
                color: '#1F1F1F',
                fontSize: '13px',
                margin: 0,
                fontWeight: '500'
              }}>
                ⚠️ Copy this key now! It will not be shown again for security reasons.
              </p>
            </div>

            {/* Key Name */}
            <h3 style={{
              color: '#FF6B35',
              fontSize: '16px',
              margin: '0 0 15px 0',
              fontWeight: '500'
            }}>
              {showKeyPopup.name}
            </h3>

            {/* Full Key */}
            <div style={{
              background: '#000000',
              border: '2px solid #FF6B35',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              color: '#FF6B35',
              wordBreak: 'break-all',
              position: 'relative'
            }}>
              {showKeyPopup.fullKey}
            </div>

            {/* Copied message */}
            {copiedInPopup && (
              <div style={{
                background: '#4CAF50',
                color: '#FFFFFF',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '13px',
                textAlign: 'center',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                ✓ Key copied to clipboard!
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  copyToClipboard(showKeyPopup.fullKey);
                  setCopiedInPopup(true);
                  // Close popup after 1 second
                  setTimeout(() => {
                    closeKeyPopup();
                  }, 1000);
                }}
                style={{
                  flex: 1,
                  background: copiedInPopup ? '#4CAF50' : '#FF6B35',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  padding: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                  transition: 'background 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (!copiedInPopup) {
                    e.currentTarget.style.background = '#E55A2B';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copiedInPopup) {
                    e.currentTarget.style.background = '#FF6B35';
                  }
                }}
              >
                {copiedInPopup ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Key
                  </>
                )}
              </button>
              <button
                onClick={closeKeyPopup}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '2px solid #FF6B35',
                  borderRadius: '8px',
                  color: '#FF6B35',
                  padding: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FF6B35';
                  e.currentTarget.style.color = '#1F1F1F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#FF6B35';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{
              color: '#1F1F1F',
              fontSize: '42px',
              fontWeight: '500',
              margin: '0 0 10px 0'
            }}>
              API Keys
            </h1>
            <p style={{
              color: '#7C7C7C',
              fontSize: '16px',
              margin: 0
            }}>
              Manage your API access keys
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigateTo('dashboard')}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100px',
                height: '40px',
                background: '#FF6B35',
                border: '2px solid #FF6B35',
                borderRadius: '8px',
                color: '#000000',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'JetBrains Mono, monospace'
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
              Dashboard
            </button>
            <button
              onClick={() => navigateTo('landing')}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100px',
                height: '40px',
                background: 'transparent',
                border: '2px solid #1F1F1F',
                borderRadius: '8px',
                color: '#1F1F1F',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'JetBrains Mono, monospace'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1F1F1F';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#1F1F1F';
              }}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('documentation')}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100px',
                height: '40px',
                background: 'transparent',
                border: '2px solid #1F1F1F',
                borderRadius: '8px',
                color: '#1F1F1F',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'JetBrains Mono, monospace'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1F1F1F';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#1F1F1F';
              }}
            >
              Docs
            </button>
          </div>
        </div>

        {/* Account Info */}
        {authProfile && (
          <div style={{
            background: '#F5F5F5',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{
              color: '#1F1F1F',
              margin: '0 0 15px 0',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              Account Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              <div>
                <div style={{ color: '#7C7C7C', fontSize: '12px', marginBottom: '5px' }}>Email</div>
                <div style={{ color: '#1F1F1F', fontSize: '14px' }}>{authProfile.email}</div>
              </div>
              <div>
                <div style={{ color: '#7C7C7C', fontSize: '12px', marginBottom: '5px' }}>Plan</div>
                <div style={{
                  color: '#1F1F1F',
                  fontSize: '14px',
                  textTransform: 'capitalize',
                  fontWeight: '500'
                }}>
                  {authProfile.subscription_tier}
                </div>
              </div>
              <div>
                <div style={{ color: '#7C7C7C', fontSize: '12px', marginBottom: '5px' }}>Token Usage</div>
                <div style={{ color: '#1F1F1F', fontSize: '14px' }}>
                  {authProfile.tokens_used_this_month.toLocaleString()} / {authProfile.monthly_token_limit.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create New API Key */}
        <div style={{
          background: '#F5F5F5',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '25px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#1F1F1F',
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: '500'
          }}>
            Create New API Key
          </h3>
          
          {/* Key Type Selection */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#1F1F1F',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '10px',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              Key Type
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['input', 'output', 'overall'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewKeyType(type)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: newKeyType === type ? '#FF6B35' : '#E5E7EB',
                    background: newKeyType === type ? '#FFF4E6' : '#FFFFFF',
                    color: newKeyType === type ? '#FF6B35' : '#1F1F1F',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    fontFamily: 'JetBrains Mono, monospace',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize'
                  }}
                  onMouseEnter={(e) => {
                    if (newKeyType !== type) {
                      e.currentTarget.style.borderColor = '#FF6B35';
                      e.currentTarget.style.background = '#FFF8F3';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newKeyType !== type) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.background = '#FFFFFF';
                    }
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            <p style={{
              color: '#7C7C7C',
              fontSize: '12px',
              margin: '8px 0 0 0',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              Input: input compression only. Output: output reduction/routing. Overall: full pipeline (input+output).
            </p>
          </div>

          {/* Optimization Level Selector */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#1F1F1F',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '10px',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              Optimization Level
            </label>
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {(['minimal', 'moderate', 'aggressive'] as const).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setNewKeyOptimizationLevel(level)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: newKeyOptimizationLevel === level ? '#FF6B35' : '#E5E7EB',
                    background: newKeyOptimizationLevel === level ? '#FFF4E6' : '#FFFFFF',
                    color: newKeyOptimizationLevel === level ? '#FF6B35' : '#1F1F1F',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    fontFamily: 'JetBrains Mono, monospace',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize'
                  }}
                  onMouseEnter={(e) => {
                    if (newKeyOptimizationLevel !== level) {
                      e.currentTarget.style.borderColor = '#FF6B35';
                      e.currentTarget.style.background = '#FFF8F3';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newKeyOptimizationLevel !== level) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.background = '#FFFFFF';
                    }
                  }}
                >
                  {level}
                </button>
              ))}
            </div>
            <p style={{
              color: '#7C7C7C',
              fontSize: '12px',
              margin: '8px 0 0 0',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              {newKeyOptimizationLevel === 'minimal' && '20-30% reduction - Gentle compression, preserves most context'}
              {newKeyOptimizationLevel === 'moderate' && '40-60% reduction - Balanced compression, recommended for most cases'}
              {newKeyOptimizationLevel === 'aggressive' && '60-80% reduction - Maximum compression for maximum cost savings'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Enter API key name..."
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid #E5E7EB',
                background: '#FFFFFF',
                color: '#1F1F1F',
                fontSize: '14px',
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#FF6B35';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
              onKeyPress={(e) => e.key === 'Enter' && createApiKey()}
            />
            <button
              onClick={createApiKey}
              disabled={isCreating || !newKeyName.trim() || !userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isCreating || !newKeyName.trim() || !userId ? '#E5E7EB' : '#FF6B35',
                border: '2px solid',
                borderColor: isCreating || !newKeyName.trim() || !userId ? '#E5E7EB' : '#FF6B35',
                borderRadius: '8px',
                color: isCreating || !newKeyName.trim() || !userId ? '#7C7C7C' : '#000000',
                padding: '12px 20px',
                cursor: isCreating || !newKeyName.trim() || !userId ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'JetBrains Mono, monospace'
              }}
              onMouseEnter={(e) => {
                if (!isCreating && newKeyName.trim() && userId) {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.borderColor = '#000000';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isCreating && newKeyName.trim() && userId) {
                  e.currentTarget.style.background = '#FF6B35';
                  e.currentTarget.style.borderColor = '#FF6B35';
                  e.currentTarget.style.color = '#000000';
                }
              }}
            >
              <Plus size={18} />
              {isCreating ? 'Creating...' : 'Create Key'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#FFEBEE',
            border: '1px solid #FFCDD2',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '30px',
            color: '#C62828',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* API Keys List */}
        <div style={{
          background: '#F5F5F5',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '25px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{
              color: '#1F1F1F',
              margin: 0,
              fontSize: '18px',
              fontWeight: '500'
            }}>
              Your API Keys ({filteredKeys.length})
            </h3>
            
            <div />
          </div>
          
          {filteredKeys.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#7C7C7C',
              padding: '60px 20px',
              fontSize: '14px'
            }}>
              No API keys created yet. Create your first key above to get started!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredKeys.map((key) => {
                const displayKey = getKeyDisplay(key);
                return (
                  <div
                    key={key.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      padding: '20px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <Key size={18} style={{ color: '#FF6B35' }} />
                        <span style={{
                          color: '#1F1F1F',
                          fontSize: '16px',
                          fontWeight: '500'
                        }}>
                          {key.name}
                        </span>
                        <span style={{
                          background: key.key_type === 'input' ? '#2196F3' : '#FF6B35',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {key.key_type}
                        </span>
                        <span style={{
                          background: '#FF6B35',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {key.optimization_level}
                        </span>
                        <span style={{
                          background: '#4CAF50',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          Active
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => deleteApiKey(key.id)}
                          disabled={deletingKeyId === key.id}
                          style={{
                            background: deletingKeyId === key.id ? '#F5F5F5' : 'transparent',
                            border: '1px solid #DC2626',
                            borderRadius: '6px',
                            color: deletingKeyId === key.id ? '#7C7C7C' : '#DC2626',
                            padding: '8px 12px',
                            cursor: deletingKeyId === key.id ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontFamily: 'JetBrains Mono, monospace'
                          }}
                          onMouseEnter={(e) => {
                            if (deletingKeyId !== key.id) {
                              e.currentTarget.style.background = '#FEE2E2';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (deletingKeyId !== key.id) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <Trash2 size={14} />
                          {deletingKeyId === key.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      background: '#F5F5F5',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '12px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '13px',
                      color: '#1F1F1F',
                      wordBreak: 'break-all'
                    }}>
                      {displayKey}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#7C7C7C',
                      fontSize: '12px'
                    }}>
                      <span>Created: {formatDate(key.created_at)}</span>
                      {key.last_used_at && (
                        <span>Last used: {formatDate(key.last_used_at)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Usage Instructions */}
        <div style={{
          background: '#F5F5F5',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '25px',
          marginTop: '30px'
        }}>
          <h3 style={{
            color: '#1F1F1F',
            margin: '0 0 15px 0',
            fontSize: '18px',
            fontWeight: '500'
          }}>
            How to Use Your API Key
          </h3>
          <div style={{ color: '#1F1F1F', fontSize: '14px', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 15px 0' }}>Use your API key to optimize prompts programmatically:</p>
            <div style={{
              background: '#1F1F1F',
              borderRadius: '6px',
              padding: '15px',
              margin: '10px 0',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              overflow: 'auto',
              color: '#FFFFFF'
            }}>
              <div style={{ color: '#4CAF50' }}># Example API call</div>
              <div style={{ color: '#FFC107' }}>curl -X POST "http://localhost:8000/optimize/{userId}" \</div>
              <div style={{ color: '#FFC107' }}>  -H "Content-Type: application/json" \</div>
              <div style={{ color: '#FFC107' }}>{'  -d \'{"prompt": "Your long prompt here", "optimization_level": "moderate"}\''}</div>
            </div>
            <p style={{ margin: '15px 0 0 0' }}>
              Replace <code style={{
                background: '#E5E7EB',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '13px'
              }}>{userId}</code> with your actual user ID.
            </p>
          </div>
        </div>
      </div>

      {/* Footer (from LandingPage) */}
      <footer style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0px 0px',
        gap: '20px',
        width: '100%',
        maxWidth: '1550px',
        margin: '40px auto 0',
        borderTop: '1px solid #1F1F1F'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          position: 'relative'
        }}>
          <div style={{
            width: '350px',
            height: '18px',
            fontFamily: 'JetBrains Mono',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '14px',
            lineHeight: '18px',
            color: '#7C7C7C',
            textAlign: 'left',
          }}>2025 © PrompTrim. All rights reserved</div>

          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'JetBrains Mono',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '12px',
            lineHeight: '16px',
            color: '#FF6B35',
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}>
            Works with any LLM pipeline - if your app sends text in and gets text out, PrompTrim fits right in
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0px',
            gap: '16px',
            width: '208px',
            height: '40px',
          }}>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{
              boxSizing: 'border-box', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: '3px', gap: '10px', width: '40px', height: '40px', border: '1px solid #DBDBDB', borderRadius: '50px', textDecoration: 'none', color: 'inherit'
            }}>
              <Twitter style={{ width: '20px', height: '20px' }} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{
              boxSizing: 'border-box', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: '3px', gap: '10px', width: '40px', height: '40px', border: '1px solid #DBDBDB', borderRadius: '50px', textDecoration: 'none', color: 'inherit'
            }}>
              <Linkedin style={{ width: '20px', height: '20px' }} />
            </a>
            <a href="mailto:example@example.com" style={{
              boxSizing: 'border-box', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: '3px', gap: '10px', width: '40px', height: '40px', border: '1px solid #DBDBDB', borderRadius: '50px', textDecoration: 'none', color: 'inherit'
            }}>
              <Mail style={{ width: '20px', height: '20px' }} />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{
              boxSizing: 'border-box', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: '3px', gap: '10px', width: '40px', height: '40px', border: '1px solid #DBDBDB', borderRadius: '50px', textDecoration: 'none', color: 'inherit'
            }}>
              <Github style={{ width: '20px', height: '20px' }} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ApiKeyManager;
