import { useEffect } from 'react';

/**
 * Custom hook to add galaxy-themed interactive effects to the Numdum app
 */
const useGalaxyEffects = () => {
  useEffect(() => {
    // Mouse following effect for interactive elements
    const initMouseFollowEffect = () => {
      const interactiveElements = document.querySelectorAll(
        '.btn-primary, .BottomNavigation button, .card, .input, .textarea, .select, .btn-secondary, .btn-ghost'
      );
      
      interactiveElements.forEach(element => {
        element.addEventListener('mousemove', function(e) {
          const rect = element.getBoundingClientRect();
          const x = e.clientX - rect.left; // x position within the element
          const y = e.clientY - rect.top;  // y position within the element
          
          element.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
          element.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });
        
        // Reset on mouse leave
        element.addEventListener('mouseleave', function() {
          element.style.setProperty('--mouse-x', '50%');
          element.style.setProperty('--mouse-y', '50%');
        });
      });
    };

    // Enhanced toast animations
    const initToastEnhancements = () => {
      const toastContainer = document.querySelector('.fixed.bottom-4.right-4');
      if (toastContainer) {
        toastContainer.style.setProperty('gap', '0.75rem');
        
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1 && node.classList.contains('Toast')) {
                // Add galaxy sparkle effect
                node.style.setProperty('animation', 'toastAppear 0.5s ease-out forwards, sparkle 2s ease-in-out infinite');
                
                // Remove sparkle after a few seconds to prevent performance issues
                setTimeout(() => {
                  node.style.setProperty('animation', 'toastAppear 0.5s ease-out forwards');
                }, 5000);
              }
            });
          });
        });
        
        observer.observe(toastContainer, { childList: true });
      }
    };

    // Page transition effects
    const initPageTransitions = () => {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.style.setProperty('transition', 'opacity 0.3s ease-out');
        
        // Listen for route changes
        window.addEventListener('popstate', function() {
          mainContent.style.setProperty('opacity', '0');
          setTimeout(() => {
            mainContent.style.setProperty('opacity', '1');
          }, 50);
        });
      }
    };

    // Checklist item animations
    const initChecklistAnimations = () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList.contains('checklist-item')) {
              const checkbox = node.querySelector('input[type="checkbox"]');
              if (checkbox) {
                checkbox.addEventListener('change', function() {
                  if (this.checked) {
                    node.classList.add('completed');
                    // Remove completed class after animation ends
                    setTimeout(() => {
                      node.classList.remove('completed');
                    }, 500);
                  }
                });
              }
            }
          });
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
    };

    // Button press feedback
    const initButtonFeedback = () => {
      const buttons = document.querySelectorAll('button');
      
      buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
          this.style.setProperty('transform', 'scale(0.97)');
        });
        
        button.addEventListener('mouseup', function() {
          this.style.setProperty('transform', '');
        });
        
        button.addEventListener('mouseleave', function() {
          this.style.setProperty('transform', '');
        });
      });
    };

    // Floating notification buttons enhancement
    const initFabEnhancements = () => {
      const fabButtons = document.querySelectorAll(
        '.btn-primary.fixed, .btn-secondary.fixed'
      );
      
      fabButtons.forEach(button => {
        button.style.setProperty('animation', 'pulseFloat 3s ease-in-out infinite');
        
        button.addEventListener('mouseenter', function() {
          this.style.setProperty('animation', 'pulseFloat 1.5s ease-in-out infinite');
        });
        
        button.addEventListener('mouseleave', function() {
          this.style.setProperty('animation', 'pulseFloat 3s ease-in-out infinite');
        });
      });
    };

    // Performance optimizations
    const initPerformanceOptimizations = () => {
      // Reduce animations for users who prefer reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const style = document.createElement('style');
        style.textContent = `
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        `;
        document.head.appendChild(style);
      }
      
      // Lazy load off-screen images
      const images = document.querySelectorAll('img[loading], img[data-src]');
      if ('loading' in HTMLImageElement.prototype) {
        images.forEach(img => {
          img.loading = 'lazy';
        });
      } else {
        // Fallback for browsers without native lazy loading
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              obs.unobserve(img);
            }
          });
        });
        
        images.forEach(img => {
          observer.observe(img);
        });
      }
    };

    // Initialize all effects
    initMouseFollowEffect();
    initToastEnhancements();
    initPageTransitions();
    initChecklistAnimations();
    initButtonFeedback();
    initFabEnhancements();
    initPerformanceOptimizations();

    // Cleanup function
    return () => {
      // Cleanup would go here if needed
    };
  }, []);

  return null;
};

export default useGalaxyEffects;