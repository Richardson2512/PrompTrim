import { Mail, Github, Linkedin, Twitter, Sparkles } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { ChatAssistant } from './ChatAssistant';

const LandingPage = () => {
  const { navigateTo, setIntendedRoute } = useRouter();
  const { user, profile } = useAuth();
  const typingTextRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Helper function to handle navigation based on auth state
  const handleNavigation = (targetRoute: 'dashboard' | 'api-keys' | 'login' = 'dashboard') => {
    if (user) {
      // User is already logged in, navigate to their target page
      console.log('✅ User logged in, navigating to', targetRoute);
      navigateTo(targetRoute);
    } else {
      // User is not logged in, determine where to send them
      if (targetRoute === 'api-keys') {
        // For api-keys, set intended route and go to login
        console.log('🔑 Setting intended route to api-keys and navigating to login');
        setIntendedRoute('api-keys');
        navigateTo('login');
      } else {
        // For dashboard, just go to login
        console.log('🔑 Navigating to login');
        navigateTo('login');
      }
    }
  };

  useEffect(() => {
    const typingText = typingTextRef.current;
    const subLogoContainer = document.getElementById('sub-logo-container');
    const trimPopup = document.getElementById('trim-popup');
    const subLogoImg = subLogoContainer?.querySelector('img');
    
    if (!typingText) return;

    const prompt = 'I need you to write a very detailed and comprehensive marketing strategy document for a brand new AI-powered productivity application that is specifically designed to help business teams and organizations optimize their daily workflow processes and significantly reduce their operational costs by approximately 50 percent. Please include market analysis, target audience research, competitive positioning, pricing strategies, distribution channels, promotional campaigns, budget allocation, timeline implementation, success metrics, and detailed action plans for each marketing channel including digital marketing, content marketing, social media marketing, email marketing, influencer partnerships, PR activities, and traditional advertising methods.';
    const trimmedPrompt = 'Create a comprehensive marketing strategy for an AI productivity tool that reduces costs by 50%. Include market analysis, target audience, competitive positioning, pricing, distribution channels, promotional campaigns, budget allocation, timeline, and success metrics.';
    let i = 0;
    let isActive = true;
    let isResetting = false;
    let timeouts: NodeJS.Timeout[] = [];
    const maxLines = 3;
    let isVisible = true;
    
    function showSubLogo() {
      if (subLogoContainer) {
        subLogoContainer.style.opacity = '1';
      }
      if (subLogoImg) {
        subLogoImg.style.filter = 'drop-shadow(0 0 8px #FF6B35)';
      }
    }
    
    function showPopup() {
      if (trimPopup) {
        trimPopup.style.opacity = '1';
        trimPopup.style.transform = 'translateY(-50%)';
      }
    }
    
    function hidePopup() {
      if (trimPopup) {
        trimPopup.style.opacity = '0';
        trimPopup.style.transform = 'translateY(-50%)';
      }
    }
    
    function trimPrompt() {
      if (!isActive || !typingText) return;
      typingText.innerHTML = '';
      i = 0;
      
      function typeTrimmed() {
        if (!isActive || !typingText || i >= trimmedPrompt.length) return;
        typingText.innerHTML = trimmedPrompt.substring(0, i + 1) + '<span class="cursor">|</span>';
        i++;
        const timer = setTimeout(typeTrimmed, 30);
        timeouts.push(timer);
      }
      
      typeTrimmed();
    }
    
    function typeWriter() {
      if (!isActive || !typingText) return;
      
      if (i < prompt.length) {
        const currentText = prompt.substring(0, i + 1);
        
        // Split text into lines based on character count (roughly 60 chars per line)
        const words = currentText.split(' ');
        let lines: string[] = [];
        let currentLine = '';
        
        for (const word of words) {
          if ((currentLine + word).length > 60 && currentLine.length > 0) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine += word + ' ';
          }
        }
        
        // Add the current incomplete line
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        
        // Keep only the last 3 lines
        if (lines.length > maxLines) {
          lines = lines.slice(-maxLines);
        }
        
        // Update display
        typingText.innerHTML = lines.map(line => 
          line === lines[lines.length - 1] ? line + '<span class="cursor">|</span>' : line
        ).join('<br>');
        
        i++;
        const timer = setTimeout(typeWriter, 35);
        timeouts.push(timer);
      } else {
        // Show sub-logo and popup when typing is complete
        showSubLogo();
        const showTimer = setTimeout(showPopup, 500);
        timeouts.push(showTimer);
        
        // Auto-trim after 2 seconds
        const trimTimer = setTimeout(() => {
          hidePopup();
          trimPrompt();
        }, 2000);
        timeouts.push(trimTimer);
        
        // Reset after showing trimmed version with 5-second pause
        const resetTimer = setTimeout(() => {
          if (!isActive || !typingText || isResetting) return;
          
          isResetting = true;
          
          // Clear all timeouts to prevent conflicts
          timeouts.forEach(timeout => clearTimeout(timeout));
          timeouts = [];
          
          // Reset UI elements
          hidePopup();
          if (subLogoContainer) {
            subLogoContainer.style.opacity = '0';
          }
          if (subLogoImg) {
            subLogoImg.style.filter = 'none';
          }
          
          // Clear text and reset state
          typingText.innerHTML = '';
          i = 0;
          
          // Small delay before restarting to ensure clean state
          const restartTimer = setTimeout(() => {
            if (isActive && typingText) {
              isResetting = false;
              typeWriter();
            }
          }, 200);
          timeouts.push(restartTimer);
        }, 10000); // Increased from 5000ms to 10000ms (5 seconds pause after trimmed prompt)
        timeouts.push(resetTimer);
      }
    }
    
    const initialTimer = setTimeout(typeWriter, 1000);
    timeouts.push(initialTimer);
    
    // Stop animation when page is not visible
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (!isVisible) {
        // Clear all timers when page is hidden
        timeouts.forEach(timeout => clearTimeout(timeout));
        timeouts = [];
      } else if (isActive && !typingText.innerHTML.trim()) {
        // Restart animation when page becomes visible again
        i = 0;
        const timer = setTimeout(typeWriter, 500);
        timeouts.push(timer);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      timeouts.forEach(timeout => clearTimeout(timeout));
      timeouts = [];
      if (typingText) {
        typingText.innerHTML = '';
      }
    };
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#FFFFFF',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '0px',
        gap: '14px',
        position: 'absolute',
        width: '1550px',
        height: '70px',
        left: 'calc(50% - 1550px/2)',
        top: '46px'
      }}>
        {/* Logo */}
        <button
          onClick={() => navigateTo('landing')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0px',
            margin: '0 auto',
            width: '300px',
            height: '300px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            flex: 'none',
            order: 0,
            flexGrow: 0,
            position: 'relative',
            zIndex: 9999
          }}
        >
          <img 
            src="/logo.png" 
            alt="PromptTrim Logo" 
            style={{
              width: '300px',
              height: '300px',
              objectFit: 'contain',
              background: 'transparent',
              position: 'relative',
              zIndex: 10000
            }}
          />
        </button>

        {/* Row */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '0px',
          gap: '12px',
          margin: '0 auto',
          width: '260px',
          height: '50px',
          flex: 'none',
          order: 1,
          flexGrow: 0
        }}>
          {/* Conditional: Show user info if logged in, otherwise show login/signup */}
          {user && profile ? (
            <>
              {/* User Email */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '40px',
                padding: '0 12px',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
                fontWeight: '400',
                color: '#1F1F1F',
                order: 0
              }}>
                {profile.email}
              </div>

              {/* Chat Assistant Button */}
              <button 
                onClick={() => setIsChatOpen(true)}
                title="Chat Assistant"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '40px',
                  height: '40px',
                  border: '2px solid #FF6B35',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #000000 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flex: 'none',
                  order: 1,
                  flexGrow: 0,
                  position: 'relative',
                  boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
                  animation: 'glow 2s ease-in-out infinite alternate'
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.boxShadow = '0 0 30px rgba(255, 107, 53, 0.8)';
                  target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.5)';
                  target.style.transform = 'scale(1)';
                }}
              >
                <Sparkles 
                  size={20} 
                  style={{ 
                    color: '#FFFFFF',
                    filter: 'drop-shadow(0 0 4px #FF6B35)'
                  }} 
                />
              </button>

              {/* Dashboard Button */}
              <button 
                onClick={() => navigateTo('dashboard')}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100px',
                  height: '40px',
                  border: '2px solid #FF6B35',
                  borderRadius: '8px',
                  background: '#FF6B35',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flex: 'none',
                  order: 2,
                  flexGrow: 0,
                  fontFamily: 'JetBrains Mono',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#000000'
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.background = '#000000';
                  target.style.color = '#FFFFFF';
                  target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.background = '#FF6B35';
                  target.style.color = '#000000';
                  target.style.transform = 'scale(1)';
                }}
              >
                Dashboard
              </button>
            </>
          ) : (
            <>
              {/* Chat Assistant Button */}
              <button 
                onClick={() => setIsChatOpen(true)}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '40px',
                  height: '40px',
                  border: '2px solid #FF6B35',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #000000 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flex: 'none',
                  order: 0,
                  flexGrow: 0,
                  position: 'relative',
                  boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)',
                  animation: 'glow 2s ease-in-out infinite alternate'
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.boxShadow = '0 0 30px rgba(255, 107, 53, 0.8)';
                  target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.5)';
                  target.style.transform = 'scale(1)';
                }}
              >
                <Sparkles 
                  size={20} 
                  style={{ 
                    color: '#FFFFFF',
                    filter: 'drop-shadow(0 0 4px #FF6B35)'
                  }} 
                />
              </button>

              {/* Login Button */}
              <button 
                onClick={() => handleNavigation('dashboard')}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '80px',
                  height: '40px',
                  border: '2px solid #FF6B35',
                  borderRadius: '8px',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flex: 'none',
                  order: 0,
                  flexGrow: 0,
                  fontFamily: 'JetBrains Mono',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#000000'
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.background = '#000000';
                  target.style.color = '#FFFFFF';
                  target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.background = 'transparent';
                  target.style.color = '#000000';
                  target.style.transform = 'scale(1)';
                }}
              >
                Login
              </button>

              {/* Get Started Button */}
              <button 
                onClick={() => handleNavigation('api-keys')}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100px',
                  height: '40px',
                  border: '2px solid #FF6B35',
                  borderRadius: '8px',
                  background: '#FF6B35',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flex: 'none',
                  order: 1,
                  flexGrow: 0,
                  fontFamily: 'JetBrains Mono',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#000000'
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.background = '#000000';
                  target.style.color = '#FFFFFF';
                  target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget as HTMLButtonElement;
                  target.style.background = '#FF6B35';
                  target.style.color = '#000000';
                  target.style.transform = 'scale(1)';
                }}
              >
                Get Started
              </button>
            </>
          )}

          {/* Menu Button */}
          <button style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '50px',
            height: '40px',
            border: '2px solid #FF6B35',
            borderRadius: '8px',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            flex: 'none',
            order: 2,
            flexGrow: 0
          }}
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.background = '#000000';
            target.style.transform = 'scale(1.05)';
            // Change hamburger lines to white on hover
            const lines = target.querySelectorAll('div > div');
            lines.forEach((line: any) => {
              line.style.background = '#FFFFFF';
            });
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLButtonElement;
            target.style.background = 'transparent';
            target.style.transform = 'scale(1)';
            // Change hamburger lines back to black
            const lines = target.querySelectorAll('div > div');
            lines.forEach((line: any) => {
              line.style.background = '#000000';
            });
          }}
          >
            {/* Hamburger Menu Icon */}
            <div style={{
              width: '20px',
              height: '16px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {/* Top line */}
              <div style={{
                width: '100%',
                height: '2px',
                background: '#000000',
                borderRadius: '1px'
              }}></div>
              {/* Middle line */}
              <div style={{
                width: '100%',
                height: '2px',
                background: '#000000',
                borderRadius: '1px'
              }}></div>
              {/* Bottom line */}
              <div style={{
                width: '100%',
                height: '2px',
                background: '#000000',
                borderRadius: '1px'
              }}></div>
            </div>
          </button>
        </div>
      </header>

      {/* Title */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0px',
        gap: '12px',
        position: 'absolute',
        width: '768px',
        height: '92px',
        left: 'calc(50% - 768px/2)',
        top: '268px'
      }}>
        {/* Minimalist Landing Page */}
        <h1 style={{
          width: '650px',
          height: '56px',
          fontFamily: 'JetBrains Mono',
          fontStyle: 'normal',
          fontWeight: '500',
          fontSize: '42px',
          lineHeight: '56px',
          color: '#1F1F1F',
          flex: 'none',
          order: 0,
          flexGrow: 0,
          margin: '0'
        }}>Cut Your AI Costs in Half</h1>
        
        {/* Make your own portfolio web page */}
        <p style={{
          width: '768px',
          height: '32px',
          fontFamily: 'JetBrains Mono',
          fontStyle: 'normal',
          fontWeight: '400',
          fontSize: '24px',
          lineHeight: '32px',
          textAlign: 'center',
          color: '#FF6B35',
          flex: 'none',
          order: 1,
          alignSelf: 'stretch',
          flexGrow: 0,
          margin: '0'
        }}>Reduce token usage by half. Track every dollar saved. Scale AI features without scaling costs</p>
      </div>

      {/* Frame 1 */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0px',
        gap: '32px',
        position: 'absolute',
        width: '413px',
        height: '171.62px',
        left: 'calc(50% - 413px/2 - 230.5px)',
        top: '420px'
      }}>
        {/* Card */}
        <div style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          gap: '15px',
          width: '350px',
          height: '140px',
          background: '#FF6B35',
          border: '1.15385px solid #FF6B35',
          boxShadow: '0px 32.3077px 12.6923px rgba(0, 0, 0, 0.01), 0px 18.4615px 10.3846px rgba(0, 0, 0, 0.05), 0px 8.07692px 8.07692px rgba(0, 0, 0, 0.09), 0px 2.30769px 4.61538px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1)',
          borderRadius: '9.23077px',
          flex: 'none',
          order: 0,
          flexGrow: 0
        }}>
          {/* Description */}
          <p style={{
            fontFamily: 'JetBrains Mono',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '14px',
            lineHeight: '20px',
            color: '#FFFFFF',
            margin: '0',
            textAlign: 'center',
            maxWidth: '320px'
          }}>Experience the power of AI optimization and see how much you can save on your AI costs.</p>
          
          {/* Get API Button */}
          <button
            onClick={() => {
              console.log('🔍 LandingPage - Get API clicked, user:', !!user);
              if (user) {
                // User is already logged in, navigate directly to api-keys
                console.log('✅ User logged in, navigating to api-keys');
                navigateTo('api-keys');
              } else {
                // User is not logged in, set intended route and go to login
                console.log('🔑 Setting intended route to api-keys and navigating to login');
                setIntendedRoute('api-keys');
                navigateTo('login');
              }
            }}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 20px',
              gap: '8px',
              width: '260px',
              height: '36px',
              background: 'transparent',
              border: '1.5px solid #FFFFFF',
              borderRadius: '25px',
              fontFamily: 'JetBrains Mono',
              fontStyle: 'normal',
              fontWeight: '500',
              fontSize: '13px',
              lineHeight: '20px',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              flex: 'none',
              order: 0,
              flexGrow: 0,
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.background = '#FFFFFF';
              target.style.color = '#FF6B35';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.background = 'transparent';
              target.style.color = '#FFFFFF';
            }}
          >
            Get your API key for free
          </button>
        </div>

        {/* Tag */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0px',
          gap: '12px',
          width: '429.6px',
          height: '133.2px',
          flex: 'none',
          order: 1,
          flexGrow: 0
        }}>
          {/* Row */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '0px',
            gap: '9.6px',
            width: '429.6px',
            height: '36.4px',
            flex: 'none',
            order: 0,
            flexGrow: 0
          }}>
            {/* Watch Demo Button */}
            <button
              onClick={() => handleNavigation('dashboard')}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7.2px 16.8px',
                gap: '12px',
                width: '154.6px',
                height: '36.4px',
                background: '#1F1F1F',
                border: '1.2px solid #7C7C7C',
                borderRadius: '60px',
                flex: 'none',
                order: 0,
                flexGrow: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#FF6B35';
                target.style.border = '1.2px solid #FF6B35';
                target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#1F1F1F';
                target.style.border = '1.2px solid #7C7C7C';
                target.style.transform = 'scale(1)';
              }}
            >
              <span style={{
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#FFFFFF',
                flex: 'none',
                order: 0,
                flexGrow: 0
              }}>Watch Demo</span>
            </button>
            
            {/* Mockup Button */}
            <button
              onClick={() => handleNavigation('dashboard')}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7.2px 16.8px',
                gap: '12px',
                width: '94.6px',
                height: '36.4px',
                background: 'transparent',
                border: '1.2px solid #7C7C7C',
                borderRadius: '60px',
                flex: 'none',
                order: 1,
                flexGrow: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#FF6B35';
                target.style.border = '1.2px solid #FF6B35';
                target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.border = '1.2px solid #7C7C7C';
                target.style.transform = 'scale(1)';
              }}
            >
              <span style={{
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#1F1F1F',
                flex: 'none',
                order: 0,
                flexGrow: 0
              }}>Mockup</span>
            </button>
            
            {/* Tools Button */}
            <button
              onClick={() => handleNavigation('dashboard')}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7.2px 16.8px',
                gap: '12px',
                width: '84.6px',
                height: '36.4px',
                background: 'transparent',
                border: '1.2px solid #7C7C7C',
                borderRadius: '60px',
                flex: 'none',
                order: 2,
                flexGrow: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#FF6B35';
                target.style.border = '1.2px solid #FF6B35';
                target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.border = '1.2px solid #7C7C7C';
                target.style.transform = 'scale(1)';
              }}
            >
              <span style={{
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#1F1F1F',
                flex: 'none',
                order: 0,
                flexGrow: 0
              }}>Tools</span>
            </button>
            
            {/* About Button */}
            <button
              onClick={() => handleNavigation('dashboard')}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7.2px 16.8px',
                gap: '12px',
                width: '84.6px',
                height: '36.4px',
                background: 'transparent',
                border: '1.2px solid #7C7C7C',
                borderRadius: '60px',
                flex: 'none',
                order: 3,
                flexGrow: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#FF6B35';
                target.style.border = '1.2px solid #FF6B35';
                target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.border = '1.2px solid #7C7C7C';
                target.style.transform = 'scale(1)';
              }}
            >
              <span style={{
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#1F1F1F',
                flex: 'none',
                order: 0,
                flexGrow: 0
              }}>About</span>
            </button>
            
            
          </div>

          {/* Row */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '0px',
            gap: '9.6px',
            width: '429.6px',
            height: '36.4px',
            flex: 'none',
            order: 1,
            flexGrow: 0
          }}>
            {/* Contact Us Button */}
            <button
              onClick={() => handleNavigation('dashboard')}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7.2px 16.8px',
                gap: '12px',
                width: '150px',
                height: '36.4px',
                background: 'transparent',
                border: '1.2px solid #7C7C7C',
                borderRadius: '60px',
                flex: 'none',
                order: 0,
                flexGrow: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#FF6B35';
                target.style.border = '1.2px solid #FF6B35';
                target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.border = '1.2px solid #7C7C7C';
                target.style.transform = 'scale(1)';
              }}
            >
              <span style={{
                width: '120px',
                height: '22px',
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#1F1F1F',
                flex: 'none',
                order: 0,
                flexGrow: 0
              }}>Contact Us</span>
            </button>
            
            {/* Photos Button */}
            <button
              onClick={() => handleNavigation('dashboard')}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7.2px 16.8px',
                gap: '12px',
                width: '94.6px',
                height: '36.4px',
                background: 'transparent',
                border: '1.2px solid #7C7C7C',
                borderRadius: '60px',
                flex: 'none',
                order: 6,
                flexGrow: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#FF6B35';
                target.style.border = '1.2px solid #FF6B35';
                target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.border = '1.2px solid #7C7C7C';
                target.style.transform = 'scale(1)';
              }}
            >
              <span style={{
                width: '61px',
                height: '22px',
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#1F1F1F',
                flex: 'none',
                order: 6,
                flexGrow: 0
              }}>Pricing</span>
            </button>
            
            {/* Typography Button */}
            <button
              onClick={() => handleNavigation('dashboard')}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7.2px 16.8px',
                gap: '12px',
                width: '200px',
                height: '36.4px',
                background: 'transparent',
                border: '1.2px solid #7C7C7C',
                borderRadius: '60px',
                flex: 'none',
                order: 6,
                flexGrow: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#FF6B35';
                target.style.border = '1.2px solid #FF6B35';
                target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.border = '1.2px solid #7C7C7C';
                target.style.transform = 'scale(1)';
              }}
            >
              <span style={{
                width: '170px',
                height: '22px',
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#1F1F1F',
                flex: 'none',
                order: 6,
                flexGrow: 0
              }}>Chrome Extension</span>
            </button>
            
            
          </div>

          {/* Row */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '0px',
            gap: '9.6px',
            width: '429.6px',
            height: '36.4px',
            flex: 'none',
            order: 2,
            flexGrow: 0
          }}>
            {/* Documentations Button */}
            <button
              onClick={() => navigateTo('documentation')}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7.2px 16.8px',
                gap: '12px',
                width: '200px',
                height: '36.4px',
                background: 'transparent',
                border: '1.2px solid #7C7C7C',
                borderRadius: '60px',
                flex: 'none',
                order: 0,
                flexGrow: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#FF6B35';
                target.style.border = '1.2px solid #FF6B35';
                target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.border = '1.2px solid #7C7C7C';
                target.style.transform = 'scale(1)';
              }}
            >
              <span style={{
                width: '170px',
                height: '22px',
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#1F1F1F',
                flex: 'none',
                order: 0,
                flexGrow: 0
              }}>Documentations</span>
            </button>
            
            {/* Plugin Button */}
            <button
              onClick={() => handleNavigation('dashboard')}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7.2px 16.8px',
                gap: '12px',
                width: '140px',
                height: '36.4px',
                background: 'transparent',
                border: '1.2px solid #7C7C7C',
                borderRadius: '60px',
                flex: 'none',
                order: 1,
                flexGrow: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#FF6B35';
                target.style.border = '1.2px solid #FF6B35';
                target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.border = '1.2px solid #7C7C7C';
                target.style.transform = 'scale(1)';
              }}
            >
              <span style={{
                width: '110px',
                height: '22px',
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#1F1F1F',
                flex: 'none',
                order: 0,
                flexGrow: 0
              }}>IDE plugin</span>
            </button>
            
            {/* Quotes Button */}
            <button
              onClick={() => handleNavigation('dashboard')}
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7.2px 16.8px',
                gap: '12px',
                width: '94.6px',
                height: '36.4px',
                background: 'transparent',
                border: '1.2px solid #7C7C7C',
                borderRadius: '60px',
                flex: 'none',
                order: 6,
                flexGrow: 0,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = '#FF6B35';
                target.style.border = '1.2px solid #FF6B35';
                target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.background = 'transparent';
                target.style.border = '1.2px solid #7C7C7C';
                target.style.transform = 'scale(1)';
              }}
            >
              <span style={{
                width: '61px',
                height: '22px',
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#1F1F1F',
                flex: 'none',
                order: 6,
                flexGrow: 0
              }}>Privacy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Interface with Sub-logo */}
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '200px',
        left: 'calc(50% - 800px/2)',
        top: '610px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '700px',
          minHeight: '120px',
          background: '#FFFFFF',
          borderRadius: '15px',
          border: '2px solid #E5E7EB',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          padding: '20px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {/* Chat Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '10px',
            borderBottom: '1px solid #F3F4F6'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10B981',
                borderRadius: '50%'
              }}></div>
              <span style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
                color: '#6B7280',
                fontWeight: '500'
              }}>Chat Assistant</span>
            </div>
            <div style={{
              display: 'flex',
              gap: '5px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                background: '#F59E0B',
                borderRadius: '50%'
              }}></div>
              <div style={{
                width: '12px',
                height: '12px',
                background: '#EF4444',
                borderRadius: '50%'
              }}></div>
            </div>
          </div>

          {/* Chat Content */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '15px',
            flex: 1
          }}>
            {/* Chat Box Icon */}
            <div style={{
              width: '32px',
              height: '32px',
              background: '#3B82F6',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
              position: 'relative'
            }}>
              {/* Chat bubble icon */}
              <div style={{
                width: '16px',
                height: '12px',
                background: '#FFFFFF',
                borderRadius: '2px',
                position: 'relative'
              }}>
                {/* Chat bubble tail */}
                <div style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: '4px',
                  width: '0',
                  height: '0',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '4px solid #FFFFFF'
                }}></div>
              </div>
            </div>

            {/* Message Content */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '14px',
                color: '#1F1F1F',
                lineHeight: '1.5',
                minHeight: '20px'
              }}>
                <div ref={typingTextRef} className="typing-text" style={{
                  display: 'inline'
                }}></div>
                <div style={{
                  width: '2px',
                  height: '16px',
                  background: '#1F1F1F',
                  display: 'inline-block',
                  marginLeft: '2px',
                  animation: 'blink 1s infinite'
                }}></div>
              </div>

              {/* Sub-logo with Glow Effect */}
              <div id="sub-logo-container" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              }}>
                <img 
                  src="/sub-logo.png" 
                  alt="PromptTrim" 
                  style={{
                    width: '24px',
                    height: '24px',
                    filter: 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
                <span style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                  color: '#6B7280'
                }}>PromptTrim detected</span>
              </div>
            </div>
          </div>

          {/* Popup for Trim Prompt - positioned next to sub-logo */}
          <div id="trim-popup" style={{
            position: 'absolute',
            top: '50%',
            right: '-120px',
            transform: 'translateY(-50%)',
            background: '#FF6B35',
            color: '#FFFFFF',
            padding: '8px 12px',
            borderRadius: '6px',
            fontFamily: 'JetBrains Mono',
            fontSize: '11px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
            opacity: 0,
            transition: 'all 0.3s ease',
            zIndex: 1000,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}>
            ✂️ Trim prompt
            <div style={{
              position: 'absolute',
              left: '-6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '0',
              height: '0',
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '6px solid #FF6B35'
            }}></div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        .cursor {
          animation: blink 1s infinite;
          color: #FF6B35;
        }
        
        .typing-text {
          font-family: 'JetBrains Mono', monospace;
          line-height: 1.4;
          word-wrap: break-word;
          white-space: pre-wrap;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      
      @keyframes glow {
        0% {
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
        }
        100% {
          box-shadow: 0 0 35px rgba(255, 107, 53, 0.9), 0 0 50px rgba(255, 107, 53, 0.5);
        }
      }
      `}</style>


      {/* Footer */}
      <footer style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0px 0px',
        gap: '20px',
        position: 'absolute',
        width: '1550px',
        minHeight: '60px',
        left: 'calc(50% - 1550px/2)',
        bottom: '47px',
        borderTop: '1px solid #1F1F1F'
      }}>
        {/* Main footer row */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          position: 'relative'
        }}>
          {/* 2025 © PrompTrim. All rights reserved */}
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
            flex: 'none',
            order: 0,
            flexGrow: 0
          }}>2025 © PrompTrim. All rights reserved</div>
          
          {/* Centered Text - Absolutely positioned */}
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

          
          {/* Socmed */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0px',
            gap: '16px',
            width: '208px',
            height: '40px',
            flex: 'none',
            order: 1,
            flexGrow: 0
          }}>
          {/* X (Twitter) */}
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3px',
            gap: '10px',
            width: '40px',
            height: '40px',
            border: '1px solid #DBDBDB',
            borderRadius: '50px',
            flex: 'none',
            order: 0,
            flexGrow: 0,
            textDecoration: 'none',
            color: 'inherit'
          }}>
            {/* Vector */}
            <Twitter style={{
              width: '20px',
              height: '20px',
              flex: 'none',
              order: 0,
              flexGrow: 0
            }} />
          </a>
          
          {/* LinkedIn */}
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3px',
            gap: '10px',
            width: '40px',
            height: '40px',
            border: '1px solid #DBDBDB',
            borderRadius: '50px',
            flex: 'none',
            order: 1,
            flexGrow: 0,
            textDecoration: 'none',
            color: 'inherit'
          }}>
            {/* Vector */}
            <Linkedin style={{
              width: '20px',
              height: '20px',
              flex: 'none',
              order: 0,
              flexGrow: 0
            }} />
          </a>
          
          {/* Email */}
          <a href="mailto:example@example.com" style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3px',
            gap: '10px',
            width: '40px',
            height: '40px',
            border: '1px solid #DBDBDB',
            borderRadius: '50px',
            flex: 'none',
            order: 2,
            flexGrow: 0,
            textDecoration: 'none',
            color: 'inherit'
          }}>
            {/* Vector */}
            <Mail style={{
              width: '20px',
              height: '20px',
              flex: 'none',
              order: 0,
              flexGrow: 0
            }} />
          </a>
          
          {/* Github */}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3px',
            gap: '10px',
            width: '40px',
            height: '40px',
            border: '1px solid #DBDBDB',
            borderRadius: '50px',
            flex: 'none',
            order: 3,
            flexGrow: 0,
            textDecoration: 'none',
            color: 'inherit'
          }}>
            {/* Vector */}
            <Github style={{
              width: '20px',
              height: '20px',
              flex: 'none',
              order: 0,
              flexGrow: 0
            }} />
          </a>
        </div>
        </div>
      </footer>

      {/* Chat Assistant Modal */}
      <ChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default LandingPage;