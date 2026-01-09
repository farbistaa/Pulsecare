import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function usePageBackground(): void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use a try/catch to safely get the current path
  let pathname = '/';
  try {
    // Try to get the path from React Router's context
    pathname = useLocation().pathname;
  } catch (error) {
    // If it fails (e.g., not in a Router context), fall back to the window object
    // This is a safe fallback for components outside the router
    if (typeof window !== 'undefined') {
      pathname = window.location.pathname;
    }
  }
  
  useEffect(() => {
    // Function to set the body background to match the page background
    const setBodyBackground = () => {
      // Get the main content area
      const mainElement = document.querySelector('main');
      if (!mainElement) return;

      let targetElement = null;
      
      // Check if we're on the home page using the safely obtained pathname
      const isHomePage = pathname === '/' || pathname === '/home';
      
      if (isHomePage) {
        // For home page, first try the V1 approach (which was working)
        let v1TargetElement = mainElement.firstElementChild;
        
        // If the first child is a div (like ImmersiveHome), look inside it
        if (v1TargetElement && v1TargetElement.tagName === 'DIV') {
          v1TargetElement = v1TargetElement.firstElementChild;
        }
        
        // Check if V1 approach found a valid background
        if (v1TargetElement) {
          const computedStyle = window.getComputedStyle(v1TargetElement);
          const background = computedStyle.background;
          const backgroundColor = computedStyle.backgroundColor;
          
          if ((background && background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') ||
              (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent')) {
            targetElement = v1TargetElement;
          }
        }
        
        // If V1 approach didn't work, try the V2 approach
        if (!targetElement) {
          const heroSelectors = [
            '.hero-section',
            '.hero',
            '.page-hero',
            '.banner',
            '[data-hero="true"]',
            '.bg-gradient-to-r',
            '.bg-gradient-to-b',
            '.bg-gradient-to-l',
            '.bg-gradient-to-t',
            '.bg-gradient' // General gradient class
          ];
          
          for (const selector of heroSelectors) {
            const element = mainElement.querySelector(selector);
            if (element) {
              // Check if this element is large enough to be a hero section
              const rect = element.getBoundingClientRect();
              if (rect.width >= 300 && rect.height >= 200) {
                targetElement = element;
                break;
              }
            }
          }
          
          // If no hero section found, look for the first large container element
          if (!targetElement) {
            const allElements = mainElement.querySelectorAll('div, section');
            const elementsArray = Array.from(allElements);
            
            for (const element of elementsArray) {
              // Skip small elements
              const rect = element.getBoundingClientRect();
              if (rect.width < 300 || rect.height < 200) {
                continue;
              }
              
              // Skip navigation, sidebar, footer, and small decorative elements
              if (element.closest('nav, .sidebar, .side-panel, footer, header')) {
                continue;
              }
              
              // Skip elements that are likely decorative (small rounded elements, etc.)
              const classList = element.classList;
              if (classList.contains('rounded-full') || 
                  classList.contains('w-8') || 
                  classList.contains('h-8') ||
                  classList.contains('pulse-glow')) {
                continue;
              }
              
              targetElement = element;
              break;
            }
          }
        }
      } else {
        // For all other pages, use the V2 logic (which is working)
        const heroSelectors = [
          '.hero-section',
          '.hero',
          '.page-hero',
          '.banner',
          '[data-hero="true"]'
        ];
        
        for (const selector of heroSelectors) {
          const element = mainElement.querySelector(selector);
          if (element) {
            targetElement = element;
            break;
          }
        }
        
        // If no hero section found, look for the first element with a background
        if (!targetElement) {
          const allElements = mainElement.querySelectorAll('*');
          const elementsArray = Array.from(allElements);
          
          for (const element of elementsArray) {
            // Skip sidebar and navigation elements
            if (element.closest('.sidebar, .side-panel, [data-sidebar="true"], nav')) {
              continue;
            }
            
            // Skip small decorative elements
            const rect = element.getBoundingClientRect();
            if (rect.width < 100 || rect.height < 100) {
              continue;
            }
            
            // Skip elements that are likely decorative
            const classList = element.classList;
            if (classList.contains('rounded-full') || 
                classList.contains('w-8') || 
                classList.contains('h-8') ||
                classList.contains('pulse-glow')) {
              continue;
            }
            
            const computedStyle = window.getComputedStyle(element);
            const backgroundColor = computedStyle.backgroundColor;
            const backgroundImage = computedStyle.backgroundImage;
            
            if ((backgroundColor && 
                 backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                 backgroundColor !== 'transparent') ||
                (backgroundImage && backgroundImage !== 'none')) {
              targetElement = element;
              break;
            }
          }
        }
      }
      
      // If still no target element, use the main element itself
      if (!targetElement) {
        targetElement = mainElement;
      }
      
      if (!targetElement) return;

      // Get the computed background style of the target element
      const computedStyle = window.getComputedStyle(targetElement);
      const backgroundColor = computedStyle.backgroundColor;
      const backgroundImage = computedStyle.backgroundImage;
      const background = computedStyle.background;

      // Skip red/pink gradients from small decorative elements
      if (backgroundImage && backgroundImage.includes('rgb(239, 68, 68)') && backgroundImage.includes('rgb(236, 72, 153)')) {
        document.body.style.background = '#ffffff';
        return;
      }

      // Set the background on the body
      if (backgroundImage && backgroundImage !== 'none') {
        document.body.style.background = background;
        document.body.style.backgroundAttachment = computedStyle.backgroundAttachment || 'fixed';
        document.body.style.backgroundSize = computedStyle.backgroundSize || 'cover';
        document.body.style.backgroundRepeat = computedStyle.backgroundRepeat || 'no-repeat';
        document.body.style.backgroundPosition = computedStyle.backgroundPosition || 'center';
      } else if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
        document.body.style.background = backgroundColor;
      } else {
        // Fallback to white background
        document.body.style.background = '#ffffff';
      }
    };

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the background immediately
    setBodyBackground();
    
    // Set the background again after a short delay to ensure the page is fully rendered
    timeoutRef.current = setTimeout(setBodyBackground, 100);
    
    // Set up a MutationObserver to detect changes in the main content
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    const observer = new MutationObserver(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(setBodyBackground, 50);
    });

    observer.observe(mainElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]); // Re-run effect when the path changes
}