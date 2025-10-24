import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { useEffect, useRef } from 'react';

const LandingPage = () => {
  const { navigateTo } = useRouter();
  const typingTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const typingText = typingTextRef.current;
    const subLogoContainer = document.getElementById('sub-logo-container');
    const trimPopup = document.getElementById('trim-popup');
    const subLogoImg = subLogoContainer?.querySelector('img');
    
    if (!typingText) return;

    const prompt = 'Write a comprehensive marketing strategy for a new AI-powered productivity tool that helps teams optimize their workflow and reduce costs by 50%';
    const trimmedPrompt = 'Write a marketing strategy for an AI productivity tool that reduces costs by 50%';
    let i = 0;
    let isActive = true;
    let timeouts: NodeJS.Timeout[] = [];
    let isTrimmed = false;
    
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
        trimPopup.style.transform = 'translateY(0)';
      }
    }
    
    function hidePopup() {
      if (trimPopup) {
        trimPopup.style.opacity = '0';
        trimPopup.style.transform = 'translateY(10px)';
      }
    }
    
    function trimPrompt() {
      if (!isActive || !typingText) return;
      isTrimmed = true;
      typingText.textContent = '';
      i = 0;
      
      function typeTrimmed() {
        if (!isActive || !typingText || i >= trimmedPrompt.length) return;
        typingText.textContent += trimmedPrompt.charAt(i);
        i++;
        const timer = setTimeout(typeTrimmed, 30);
        timeouts.push(timer);
      }
      
      typeTrimmed();
    }
    
    function typeWriter() {
      if (!isActive || !typingText) return;
      
      if (i < prompt.length) {
        typingText.textContent += prompt.charAt(i);
        i++;
        const timer = setTimeout(typeWriter, 50);
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
          if (!isActive || !typingText) return;
          hidePopup();
          if (subLogoContainer) {
            subLogoContainer.style.opacity = '0';
          }
          if (subLogoImg) {
            subLogoImg.style.filter = 'none';
          }
          typingText.textContent = '';
          i = 0;
          isTrimmed = false;
          typeWriter();
        }, 10000); // Increased from 5000ms to 10000ms (5 seconds pause after trimmed prompt)
        timeouts.push(resetTimer);
      }
    }
    
    const initialTimer = setTimeout(typeWriter, 1000);
    timeouts.push(initialTimer);
    
    return () => {
      isActive = false;
      timeouts.forEach(timeout => clearTimeout(timeout));
      if (typingText) {
        typingText.textContent = '';
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
          {/* Login Button */}
          <button 
            onClick={() => navigateTo('login')}
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
            onClick={() => navigateTo('signup')}
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
        top: '288px'
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
        top: '440px'
      }}>
        {/* Card */}
        <div style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: '18.4615px',
          gap: '18.46px',
          width: '413.08px',
          height: '171.62px',
          background: '#FF6B35',
          border: '1.15385px solid #FF6B35',
          boxShadow: '0px 32.3077px 12.6923px rgba(0, 0, 0, 0.01), 0px 18.4615px 10.3846px rgba(0, 0, 0, 0.05), 0px 8.07692px 8.07692px rgba(0, 0, 0, 0.09), 0px 2.30769px 4.61538px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1)',
          borderRadius: '9.23077px',
          flex: 'none',
          order: 0,
          flexGrow: 0,
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.background = '#000000';
          target.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.background = '#FF6B35';
          target.style.transform = 'scale(1)';
        }}
        >
          {/* Photo */}
          <div style={{
            width: '60px',
            height: '60px',
            background: '#7C7C7C',
            borderRadius: '6.92308px',
            flex: 'none',
            order: 0,
            flexGrow: 0
          }}></div>
          
          {/* Desc */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '0px',
            gap: '6.92px',
            width: '297.69px',
            height: '134.69px',
            flex: 'none',
            order: 1,
            flexGrow: 1
          }}>
            {/* Dribbble.com */}
            <h3 style={{
              width: '133px',
              height: '24px',
              fontFamily: 'JetBrains Mono',
              fontStyle: 'normal',
              fontWeight: '500',
              fontSize: '18.4615px',
              lineHeight: '24px',
              color: '#FFFFFF',
              flex: 'none',
              order: 0,
              flexGrow: 0,
              margin: '0'
            }}>Dribbble.com</h3>
            
            {/* Lorem ipsum dolor sit amet consectetur. Elit eget ate at cursus amet facilisi. */}
            <p style={{
              width: '297.69px',
              height: '63px',
              fontFamily: 'JetBrains Mono',
              fontStyle: 'normal',
              fontWeight: '400',
              fontSize: '16.1538px',
              lineHeight: '21px',
              color: '#FFFFFF',
              flex: 'none',
              order: 1,
              alignSelf: 'stretch',
              flexGrow: 0,
              margin: '0'
            }}>Lorem ipsum dolor sit amet consectetur. Elit eget ate at cursus amet facilisi.</p>
            
            {/* Tag */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '0px',
              gap: '9.23px',
              width: '115.31px',
              height: '33.85px',
              flex: 'none',
              order: 2,
              flexGrow: 0
            }}>
              {/* Label */}
              <div style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 28px',
                gap: '11.54px',
                width: '150px',
                height: '42px',
                border: '1.15385px solid #FFFFFF',
                borderRadius: '57.6923px',
                flex: 'none',
                order: 0,
                flexGrow: 0
              }}>
                {/* Inspirations */}
                <span style={{
                  width: '100px',
                  height: '26px',
                  fontFamily: 'JetBrains Mono',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  fontSize: '16.1538px',
                  lineHeight: '26px',
                  color: '#FFFFFF',
                  flex: 'none',
                  order: 0,
                  flexGrow: 0,
                  textAlign: 'center'
                }}>Inspirations</span>
              </div>
            </div>
          </div>
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
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '154.6px',
              height: '36.4px',
              background: '#1F1F1F',
              border: '1.2px solid #7C7C7C',
              boxShadow: '0px 33.6px 13.2px rgba(0, 0, 0, 0.01), 0px 19.2px 10.8px rgba(0, 0, 0, 0.05), 0px 8.4px 8.4px rgba(0, 0, 0, 0.09), 0px 2.4px 4.8px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1)',
              borderRadius: '60px',
              flex: 'none',
              order: 0,
              flexGrow: 0
            }}>
              {/* Inspirations */}
              <span style={{
                width: '121px',
                height: '22px',
                fontFamily: 'JetBrains Mono',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '16.8px',
                lineHeight: '22px',
                color: '#FFFFFF',
                flex: 'none',
                order: 0,
                flexGrow: 0
              }}>Inspirations</span>
            </div>
            
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '84.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 1,
              flexGrow: 0
            }}>
              {/* Icons */}
              <span style={{
                width: '51px',
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
              }}>Icons</span>
            </div>
            
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '164.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 2,
              flexGrow: 0
            }}>
              {/* Illustrations */}
              <span style={{
                width: '131px',
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
              }}>Illustrations</span>
            </div>
            
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '104.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 3,
              flexGrow: 0
            }}>
              {/* Pattern */}
              <span style={{
                width: '71px',
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
              }}>Pattern</span>
            </div>
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
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '94.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 0,
              flexGrow: 0
            }}>
              {/* Photos */}
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
                order: 0,
                flexGrow: 0
              }}>Photos</span>
            </div>
            
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '134.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 1,
              flexGrow: 0
            }}>
              {/* Typography */}
              <span style={{
                width: '101px',
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
              }}>Typography</span>
            </div>
            
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '94.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 2,
              flexGrow: 0
            }}>
              {/* Colors */}
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
                order: 0,
                flexGrow: 0
              }}>Colors</span>
            </div>
            
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '54.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 3,
              flexGrow: 0
            }}>
              {/* 3D */}
              <span style={{
                width: '21px',
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
              }}>3D</span>
            </div>
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
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '94.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 0,
              flexGrow: 0
            }}>
              {/* Mockup */}
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
                order: 0,
                flexGrow: 0
              }}>Mockup</span>
            </div>
            
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '84.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 1,
              flexGrow: 0
            }}>
              {/* Tools */}
              <span style={{
                width: '51px',
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
              }}>Tools</span>
            </div>
            
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '94.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 2,
              flexGrow: 0
            }}>
              {/* Plugin */}
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
                order: 0,
                flexGrow: 0
              }}>Plugin</span>
            </div>
            
            {/* Label */}
            <div style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              padding: '7.2px 16.8px',
              gap: '12px',
              width: '94.6px',
              height: '36.4px',
              border: '1.2px solid #7C7C7C',
              borderRadius: '60px',
              flex: 'none',
              order: 3,
              flexGrow: 0
            }}>
              {/* Quotes */}
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
                order: 0,
                flexGrow: 0
              }}>Quotes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface with Sub-logo */}
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '200px',
        left: 'calc(50% - 800px/2)',
        top: '630px',
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
                <div ref={typingTextRef} style={{
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

          {/* Popup for Trim Prompt */}
          <div id="trim-popup" style={{
            position: 'absolute',
            top: '-80px',
            right: '20px',
            background: '#FF6B35',
            color: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '8px',
            fontFamily: 'JetBrains Mono',
            fontSize: '12px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(255,107,53,0.3)',
            opacity: 0,
            transform: 'translateY(10px)',
            transition: 'all 0.3s ease',
            zIndex: 1000,
            cursor: 'pointer'
          }}>
            ✂️ Trim this prompt
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              right: '20px',
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #FF6B35'
            }}></div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>


      {/* Footer */}
      <footer style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0px 0px',
        gap: '20px',
        position: 'absolute',
        width: '1550px',
        height: '60px',
        left: 'calc(50% - 1550px/2)',
        bottom: '47px',
        borderTop: '1px solid #1F1F1F'
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
      </footer>
    </div>
  );
};

export default LandingPage;