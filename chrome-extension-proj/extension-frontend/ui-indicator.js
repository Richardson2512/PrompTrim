/**
 * PrompTrim UI Indicator Module
 * Handles rendering and positioning of floating indicators
 */

// Floating logo functionality removed - indicators now show dots only

function showSeverityIndicator(indicator, analysis) {
  // Don't override display style directly - let CSS classes handle visibility
  indicator.dataset.severity = analysis.severity;
  
  const dot = indicator.querySelector('.promptrim-dot');
  if (dot) {
    dot.className = `promptrim-dot severity-${analysis.severity}`;
  }
  
  const severityLabels = {
    red: '⚠️ High verbosity',
    orange: '⚡ Moderate verbosity',
    green: '✓ Optimal'
  };
  
  indicator.setAttribute('title', severityLabels[analysis.severity]);
  indicator.setAttribute('aria-label', severityLabels[analysis.severity]);
}

function hideSeverityIndicator(indicator) {
  indicator.style.display = 'none';
}

function findChatInputContainer(input) {
  let current = input.parentElement;
  const maxDepth = 5;
  let depth = 0;
  
  while (current && depth < maxDepth) {
    const computedStyle = window.getComputedStyle(current);
    const rect = current.getBoundingClientRect();
    
    if ((computedStyle.position === 'relative' || computedStyle.position === 'absolute') &&
        rect.width > 200 && rect.height > 30) {
      return current;
    }
    
    const classList = current.classList || [];
    const containerKeywords = ['container', 'input', 'textarea', 'chat', 'composer', 'toolbar'];
    if (containerKeywords.some(keyword => 
      current.className && typeof current.className === 'string' && 
      current.className.toLowerCase().includes(keyword))) {
      return current;
    }
    
    current = current.parentElement;
    depth++;
  }
  
  return null;
}

function scanContainerForButtons(container) {
  const elements = [];
  
  if (!container) return elements;
  
  const selectors = [
    'button', '[role="button"]', 'svg', 'img',
    '[class*="icon"]', '[class*="Icon"]', '[class*="button"]', '[class*="Button"]',
    '[class*="send"]', '[class*="Send"]', '[class*="submit"]', '[class*="Submit"]',
    '[class*="attach"]', '[class*="Attach"]', '[class*="mic"]', '[class*="Mic"]',
    '[class*="voice"]', '[class*="Voice"]', '[class*="emoji"]', '[class*="Emoji"]',
    'input[type="submit"]', 'input[type="button"]',
    '[aria-label*="send"]', '[aria-label*="Send"]', '[title*="Send"]', '[title*="Attach"]'
  ];
  
  selectors.forEach(selector => {
    try {
      const found = container.querySelectorAll(selector);
      found.forEach(el => {
        if (el !== container && isElementVisible(el)) {
          const rect = el.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(el);
          
          if (rect.width <= 0 || rect.height <= 0) return;
          
          const isRightAligned = 
            computedStyle.textAlign === 'right' ||
            computedStyle.float === 'right' ||
            (computedStyle.position === 'absolute' && rect.right > window.innerWidth - 50);
          
          const alignmentScore = calculateAlignmentScore(rect, container.getBoundingClientRect());
          
          elements.push({
            element: el,
            left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
            width: rect.width, height: rect.height,
            isRightAligned: isRightAligned || alignmentScore > 0.7,
            alignmentScore: alignmentScore
          });
        }
      });
    } catch (e) {
      // Ignore selector errors
    }
  });
  
  elements.sort((a, b) => b.right - a.right);
  return elements;
}

function calculateAlignmentScore(elementRect, containerRect) {
  if (elementRect.right >= containerRect.right - 20) {
    return 1.0;
  }
  const containerWidth = containerRect.right - containerRect.left;
  const elementRightFromLeft = elementRect.right - containerRect.left;
  return Math.max(0, Math.min(1, elementRightFromLeft / containerWidth));
}

function isElementVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0';
}

function calculateSafePosition(inputRect, containerRect, childElements, iconSize) {
  const MANDATORY_MARGIN = 12;
  const EDGE_PADDING = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let left = inputRect.right - iconSize - EDGE_PADDING;
  let top = inputRect.top + (inputRect.height / 2) - (iconSize / 2);
  
  let rightmostRightAligned = inputRect.right;
  let collisionDetected = false;
  
  childElements.forEach(child => {
    if (child.isRightAligned || child.right >= inputRect.right - 30) {
      const ourRight = left + iconSize;
      const ourLeft = left;
      
      const wouldOverlap = !(
        ourRight + MANDATORY_MARGIN < child.left || 
        ourLeft > child.right + MANDATORY_MARGIN
      );
      
      if (wouldOverlap) {
        collisionDetected = true;
        if (child.right > rightmostRightAligned) {
          rightmostRightAligned = child.right;
        }
      }
    }
  });
  
  if (collisionDetected) {
    left = rightmostRightAligned - iconSize - MANDATORY_MARGIN;
    
    if (left < inputRect.left + EDGE_PADDING) {
      const spaceInsideInput = inputRect.right - inputRect.left;
      
      if (spaceInsideInput >= iconSize + MANDATORY_MARGIN + EDGE_PADDING) {
        left = inputRect.left + EDGE_PADDING;
      } else {
        if (inputRect.top >= iconSize + MANDATORY_MARGIN) {
          left = inputRect.right - iconSize - EDGE_PADDING;
          top = inputRect.top - iconSize - MANDATORY_MARGIN;
        } else {
          left = Math.min(
            inputRect.right - iconSize - EDGE_PADDING,
            viewportWidth - iconSize - MANDATORY_MARGIN
          );
          top = inputRect.bottom + MANDATORY_MARGIN;
        }
      }
    }
  }
  
  left = Math.max(MANDATORY_MARGIN, Math.min(left, viewportWidth - iconSize - MANDATORY_MARGIN));
  top = Math.max(MANDATORY_MARGIN, Math.min(top, viewportHeight - iconSize - MANDATORY_MARGIN));
  
  return { left, top };
}

function fallbackPosition(indicator) {
  indicator.style.position = 'fixed';
  indicator.style.bottom = '20px';
  indicator.style.right = '20px';
  indicator.style.top = 'auto';
  indicator.style.left = 'auto';
  indicator.style.zIndex = '2147483647';
}

function detectBackgroundColor(element) {
  try {
    const style = window.getComputedStyle(element);
    let bgColor = style.backgroundColor;
    
    if (bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
      let current = element.parentElement;
      let depth = 0;
      while (current && depth < 3) {
        const parentStyle = window.getComputedStyle(current);
        bgColor = parentStyle.backgroundColor;
        if (bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
          break;
        }
        current = current.parentElement;
        depth++;
      }
    }
    
    const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return { isLight: brightness > 128, color: bgColor };
    }
    
    return { isLight: true, color: bgColor };
  } catch (e) {
    return { isLight: true, color: '#ffffff' };
  }
}

function enableDragging(indicator, cleanupCallback) {
  const savedPos = localStorage.getItem(`promptrim-pos-${indicator.id}`);
  let hasBeenDragged = false;
  
  if (savedPos) {
    try {
      const pos = JSON.parse(savedPos);
      indicator.style.position = 'fixed';
      indicator.style.top = `${pos.top}px`;
      indicator.style.left = `${pos.left}px`;
      indicator.dataset.isDragged = 'true';
      hasBeenDragged = true;
      // Cleanup event listeners immediately if already dragged
      if (cleanupCallback) {
        cleanupCallback();
      }
    } catch (e) {}
  }
  
  let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
  
  const dragStart = (e) => {
    if (e.button !== 0 && e.type !== 'touchstart') return;
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    initialX = clientX - xOffset;
    initialY = clientY - yOffset;
    
    if (e.target === indicator || indicator.contains(e.target)) {
      isDragging = true;
      document.body.style.userSelect = 'none';
    }
  };
  
  const dragEnd = (e) => {
    if (isDragging) {
      const clientX = e.type && e.type.includes('touch') ? 
        (e.changedTouches[0]?.clientX || 0) : e.clientX || 0;
      const clientY = e.type && e.type.includes('touch') ? 
        (e.changedTouches[0]?.clientY || 0) : e.clientY || 0;
      
      const movedX = Math.abs(clientX - initialX - xOffset);
      const movedY = Math.abs(clientY - initialY - yOffset);
      
      if (movedX < 5 && movedY < 5) {
        isDragging = false;
        document.body.style.userSelect = '';
        return;
      }
      
      const currentPos = indicator.style.transform;
      localStorage.setItem(`promptrim-pos-${indicator.id}`, 
        JSON.stringify({ transform: currentPos, top: indicator.style.top, left: indicator.style.left }));
      indicator.dataset.isDragged = 'true';
      isDragging = false;
      
      // Call cleanup callback only once when user first drags the indicator
      if (cleanupCallback && !hasBeenDragged) {
        cleanupCallback();
        hasBeenDragged = true;
      }
    }
    document.body.style.userSelect = '';
  };
  
  const drag = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    currentX = clientX - initialX;
    currentY = clientY - initialY;
    
    xOffset = currentX;
    yOffset = currentY;
    
    setTranslate(currentX, currentY, indicator);
  };
  
  const setTranslate = (xPos, yPos, el) => {
    el.style.position = 'fixed';
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    el.style.webkitTransform = `translate(${xPos}px, ${yPos}px)`;
  };
  
  indicator.addEventListener('mousedown', dragStart);
  indicator.addEventListener('touchstart', dragStart);
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('touchend', dragEnd);
  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag);
}

// Export to window
window.PrompTrimUI = {
  showSeverityIndicator,
  hideSeverityIndicator,
  findChatInputContainer,
  scanContainerForButtons,
  calculateSafePosition,
  fallbackPosition,
  detectBackgroundColor,
  enableDragging
};

