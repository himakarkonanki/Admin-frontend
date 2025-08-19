import React, { useRef, useEffect, useState, useCallback } from 'react';
import FrontPage from './FrontPage';
import undo from '../assets/icons/undo.svg';
import redo from '../assets/icons/redo.svg';
import download from '../assets/icons/download.svg';
import forward from '../assets/icons/arrow_forward_ios.svg';
import DayPage from './DayPage';
import ThankYouPage from './ThankYouPage';
import PolicyPage from './PolicyPage';
import Footer from './Footer';
import PreviewPane from './PreviewPane';

function RightPanel({ pages, onPageDataUpdate, onAddPage }) {
  const scrollContainerRef = useRef(null);
  const sectionRefs = useRef({});
  const pageComponentRefs = useRef({}); // Add refs for page components
  const [showPreview, setShowPreview] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // Add navigation state

  // Function to get the latest policy page data by id
  const getPolicyPageData = React.useCallback((pageId) => {
    const page = pages.find(p => p.id === pageId && p.type === 'policy');
    if (!page) return null;
    // You can enhance this logic if your policy data is stored elsewhere
    return {
      title: page.title || 'Terms & Conditions',
      fields: page.fields || [
        {
          id: 1,
          type: 'details',
          content: 'Type your Terms & Conditions here…'
        }
      ]
    };
  }, [pages]);

  // History management state
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);
  const historyIndexRef = useRef(-1);

  // Initialize history with current pages state
  useEffect(() => {
    if (pages && pages.length > 0 && history.length === 0) {
      const initialState = JSON.parse(JSON.stringify(pages));
      setHistory([initialState]);
      setHistoryIndex(0);
      historyIndexRef.current = 0;
    }
  }, [pages, history.length]);

  // Keep ref in sync with state
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // Save state to history (called when page data changes)
  const saveToHistory = useCallback((newPages) => {
    if (isUndoRedoAction) return; // Don't save during undo/redo operations
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newPages)));
      
      // Limit history size to prevent memory issues (keep last 50 states)
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryIndex(prev => Math.max(0, prev - 1));
        return newHistory;
      }
      
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [historyIndex, isUndoRedoAction]);

// In your RightPanel component, update the undo/redo handlers:

const handleUndo = useCallback(async () => {
  if (historyIndex > 0) {
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setIsUndoRedoAction(true);
    
    const previousState = history[newIndex];
    if (onPageDataUpdate && previousState) {
      // First save current state of all editors
      await Promise.all(previousState.map(async page => {
        if (page.type === 'policy' && pageComponentRefs.current[page.id]?.current?.getCurrentData) {
          const currentData = await pageComponentRefs.current[page.id].current.getCurrentData();
          if (currentData) {
            page.blocks = currentData.blocks;
          }
        }
      }));

      // Then update all pages with previous state
      previousState.forEach(page => {
        onPageDataUpdate(page.id, page, true);
        
        if (page.type === 'policy' && pageComponentRefs.current[page.id]?.current?.restorePageData) {
          pageComponentRefs.current[page.id].current.restorePageData(page);
        }
      });
    }
    
    setTimeout(() => setIsUndoRedoAction(false), 100);
  }
}, [historyIndex, history, onPageDataUpdate]);

const handleRedo = useCallback(async () => {
  if (historyIndex < history.length - 1) {
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setIsUndoRedoAction(true);
    
    const nextState = history[newIndex];
    if (onPageDataUpdate && nextState) {
      // First save current state of all editors
      await Promise.all(nextState.map(async page => {
        if (page.type === 'policy' && pageComponentRefs.current[page.id]?.current?.getCurrentData) {
          const currentData = await pageComponentRefs.current[page.id].current.getCurrentData();
          if (currentData) {
            page.blocks = currentData.blocks;
          }
        }
      }));

      // Then update all pages with next state
      nextState.forEach(page => {
        onPageDataUpdate(page.id, page, true);
        
        if (page.type === 'policy' && pageComponentRefs.current[page.id]?.current?.restorePageData) {
          pageComponentRefs.current[page.id].current.restorePageData(page);
        }
      });
    }
    
    setTimeout(() => setIsUndoRedoAction(false), 100);
  }
}, [historyIndex, history, onPageDataUpdate]);

  // Enhanced page data update handler
  const handlePageDataUpdate = useCallback((pageId, updatedData, isBulkUpdate = false) => {
    if (onPageDataUpdate) {
      onPageDataUpdate(pageId, updatedData, isBulkUpdate);
      
      // Save to history only if it's not a bulk update (undo/redo)
      if (!isBulkUpdate && !isUndoRedoAction) {
        // Use current pages prop directly to get the most up-to-date state
        const updatedPages = pages.map(page => {
          if (page.id === pageId) {
            return { ...page, ...updatedData };
          }
          return page;
        });
        
        // Save to history immediately without setTimeout
        setHistory(prev => {
          const currentIndex = historyIndexRef.current;
          const newHistory = prev.slice(0, currentIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(updatedPages)));
          
          // Limit history size
          if (newHistory.length > 50) {
            newHistory.shift();
            const nextIndex = Math.max(0, newHistory.length - 1);
            setHistoryIndex(nextIndex);
            historyIndexRef.current = nextIndex;
            return newHistory;
          }
          
          const nextIndex = newHistory.length - 1;
          setHistoryIndex(nextIndex);
          historyIndexRef.current = nextIndex;
          return newHistory;
        });
      }
    }
  }, [onPageDataUpdate, pages, isUndoRedoAction]);

  // Check if undo/redo is available
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  // Create refs for each page dynamically
  useEffect(() => {
    pages.forEach(page => {
      if (!sectionRefs.current[page.id]) {
        sectionRefs.current[page.id] = React.createRef();
      }
      if (!pageComponentRefs.current[page.id]) {
        pageComponentRefs.current[page.id] = React.createRef();
      }
    });
    
    // Clean up refs for pages that no longer exist
    const existingPageIds = pages.map(p => p.id);
    Object.keys(sectionRefs.current).forEach(pageId => {
      if (!existingPageIds.includes(parseInt(pageId))) {
        delete sectionRefs.current[pageId];
      }
    });
    Object.keys(pageComponentRefs.current).forEach(pageId => {
      if (!existingPageIds.includes(parseInt(pageId))) {
        delete pageComponentRefs.current[pageId];
      }
    });
  }, [pages]);

  // Function to find current visible section
  const getCurrentSectionIndex = () => {
    const container = scrollContainerRef.current;
    if (!container) return 0;

    const containerTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const navigationOffset = 120; // Increased offset for better detection
    
    // Use a more reliable detection point - top third of viewport
    const detectionPoint = containerTop + navigationOffset + 50;

    // Find the section that contains our detection point
    let currentIndex = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < pages.length; i++) {
      const section = sectionRefs.current[pages[i].id]?.current;
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        // Check if detection point is within section bounds
        if (detectionPoint >= sectionTop && detectionPoint <= sectionBottom) {
          return i;
        }
        
        // If not in bounds, find the closest section
        const distanceToTop = Math.abs(detectionPoint - sectionTop);
        if (distanceToTop < minDistance) {
          minDistance = distanceToTop;
          currentIndex = i;
        }
      }
    }
    
    return currentIndex;
  };

  // Navigation functions
  const scrollToSection = (index) => {
    if (index >= 0 && index < pages.length) {
      const pageId = pages[index].id;
      const section = sectionRefs.current[pageId]?.current;
      if (section) {
        const container = scrollContainerRef.current;
        if (container) {
          // Calculate the target scroll position with offset to keep navigation arrows visible
          const sectionTop = section.offsetTop;
          const navigationOffset = 120; // Increased offset for better visibility
          const targetScrollTop = Math.max(0, sectionTop - navigationOffset);
          
          // Force scroll completion and ensure state updates
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
          
          // Additional fallback for immediate scroll if smooth doesn't work
          setTimeout(() => {
            if (Math.abs(container.scrollTop - targetScrollTop) > 10) {
              container.scrollTop = targetScrollTop;
            }
          }, 50);
        }
      }
    }
  };

  const navigateUp = () => {
    if (isNavigating) return; // Prevent rapid navigation
    
    const currentIndex = getCurrentSectionIndex();
    const previousIndex = Math.max(0, currentIndex - 1);
    
    // Prevent navigation if already at the top
    if (currentIndex === 0 && previousIndex === 0) {
      return;
    }
    
    setIsNavigating(true);
    console.log(`Navigating up from section ${currentIndex} to ${previousIndex}`);
    scrollToSection(previousIndex);
    
    // Reset navigation state after animation completes
    setTimeout(() => setIsNavigating(false), 800);
  };

  const navigateDown = () => {
    if (isNavigating) return; // Prevent rapid navigation
    
    const currentIndex = getCurrentSectionIndex();
    const nextIndex = Math.min(pages.length - 1, currentIndex + 1);
    
    // Prevent navigation if already at the bottom
    if (currentIndex === pages.length - 1 && nextIndex === pages.length - 1) {
      return;
    }
    
    setIsNavigating(true);
    console.log(`Navigating down from section ${currentIndex} to ${nextIndex}`);
    scrollToSection(nextIndex);
    
    // Reset navigation state after animation completes
    setTimeout(() => setIsNavigating(false), 800);
  };

  // Handle wheel events on the entire right panel
  const handleWheel = useCallback((event) => {
    // Allow normal scrolling behavior
  }, []);

  // Preview handlers
  const handlePreviewClick = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  // Page component rendering
  const renderPageComponent = (page, pageNumber) => {
    const pageStyle = {
      position: 'relative',
      width: '100%',
      height: '100%',
    };

    let dayNumber = 1;
    if (page.type === 'day') {
      const currentPageIndex = pages.findIndex(p => p.id === page.id);
      const dayPagesBefore = pages.slice(0, currentPageIndex).filter(p => p.type === 'day').length;
      dayNumber = dayPagesBefore + 1;
    }

    const commonProps = {
      pageId: page.id,
      pageNumber: pageNumber,
      pageData: page,
      isPreview: false,
      ...(page.type === 'day' && { dayNumber }),
    };

    let pageProps;
    if (page.type === 'thankyou') {
      pageProps = {
        ...commonProps,
        onDataChange: (updatedData) => handlePageDataUpdate(page.id, updatedData)
      };
    } else {
      pageProps = {
        ...commonProps,
        onDataUpdate: (updatedData) => handlePageDataUpdate(page.id, updatedData)
      };
    }

    let pageContent;
    switch (page.type) {
      case 'cover':
        pageContent = <FrontPage {...pageProps} />;
        break;
      case 'day':
        pageContent = <DayPage {...pageProps} />;
        break;
      case 'policy':
        pageContent = <PolicyPage {...pageProps} ref={pageComponentRefs.current[page.id]} />;
        break;
      case 'thankyou':
        pageContent = <ThankYouPage {...pageProps} />;
        break;
      default:
        pageContent = <div>Unknown page type</div>;
        break;
    }

    const shouldShowFooter = page.type !== 'cover' && page.type !== 'thankyou';

    return (
      <div style={pageStyle}>
        {pageContent}
        {shouldShowFooter && <Footer pageNumber={pageNumber} />}
      </div>
    );
  };

  // Get page title based on type
  const getPageTitle = (page) => {
    switch (page.type) {
      case 'cover':
        return 'FRONT PAGE'; // This ensures the cover page gets the correct title
      case 'day':
        return 'DAY PAGE';
      case 'policy':
        return 'TERMS & CONDITIONS';
      case 'thankyou':
        return 'THANK YOU PAGE';
      default:
        return page.title?.toUpperCase() || 'UNKNOWN PAGE';
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="right-panel-scroll-container" // Add class for scroll targeting
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: '1 0 0',
        height: '100vh',
        overflow: 'auto',
        position: 'relative',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitScrollbar: 'none',
      }}
      onWheel={handleWheel}
    >
      <div
        style={{
          display: 'flex',
          width: '1088px',
          minHeight: '100vh',
          flexDirection: 'column',
          borderRadius: '32px 32px 0 0',
          overflow: 'visible',
        }}
      >
        {/* Control Section (Fixed at top) */}
        <div
          style={{
            display: 'flex',
            padding: '16px',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'stretch',
            borderRadius: '0 0 32px 32px',
            background: 'rgba(231, 233, 245, 0.92)',
            flexShrink: 0,
            zIndex: 10,
            position: 'fixed',
            top: 0,
            width: '1088px',
            backdropFilter: 'blur(50px)',
            WebkitBackdropFilter: 'blur(50px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                ...iconWrapper,
                opacity: canUndo ? 1 : 0.5,
                cursor: canUndo ? 'pointer' : 'not-allowed'
              }}
              onClick={canUndo ? handleUndo : undefined}
              title={canUndo ? 'Undo (Ctrl+Z)' : 'Nothing to undo'}
            >
              <img src={undo} alt="undo" draggable={false} style={{ userSelect: 'none' }} />
            </div>
            <div 
              style={{
                ...iconWrapper,
                opacity: canRedo ? 1 : 0.5,
                cursor: canRedo ? 'pointer' : 'not-allowed'
              }}
              onClick={canRedo ? handleRedo : undefined}
              title={canRedo ? 'Redo (Ctrl+Y)' : 'Nothing to redo'}
            >
              <img src={redo} alt="redo" draggable={false} style={{ userSelect: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{...buttonWrapper, cursor: 'pointer'}} onClick={handlePreviewClick}>
              <div style={label}>Preview & Download</div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            padding: '32px 0',
            paddingTop: '80px', // Add padding to avoid content being hidden by the fixed header
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          <div
            style={{
              width: '1088px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0px',
            }}
          >
            {/* RENDER ALL PAGES DYNAMICALLY */}
            {pages && pages.map((page, index) => (
              <div 
                key={page.id}
                ref={sectionRefs.current[page.id]}
                data-page-id={page.id} // CRITICAL: Add this attribute for scroll functionality
                className="page-component" // CRITICAL: Add this class for scroll functionality
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  width: '100%',
                  marginBottom: '96px',
                }}
              >
                {/* ACTION ROW: Renders for ALL pages, including the Front Page */}
                <div style={actionRow}>
                  <div style={sectionTitle}>{getPageTitle(page)}</div>
                  <div style={{...downArrowIcon, cursor: 'pointer'}} onClick={navigateDown}>
                    <img src={forward} alt="down" draggable={false} style={{ userSelect: 'none' }} />
                  </div>
                  <div style={{...upArrowIcon, cursor: 'pointer'}} onClick={navigateUp}>
                    <img src={forward} alt="up" draggable={false} style={{ userSelect: 'none' }} />
                  </div>
                </div>

                {/* PAGE WRAPPER: Renders the specific page component below the action row */}
                <div style={
                  page.type === 'cover' ? frontPageWrapper : 
                  page.type === 'policy' ? policyPageWrapper : 
                  dayPageWrapper
                }>
                  {renderPageComponent(page, index + 1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Preview Overlay */}

      {showPreview && (
        <PreviewPane onClose={handleClosePreview} pages={pages} getPolicyPageData={getPolicyPageData} />
      )}

      {/* Global CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          div::-webkit-scrollbar { width: 0px; background: transparent; }
          div::-webkit-scrollbar-thumb { background: transparent; }
          @keyframes slideUpFromBottom {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `
      }} />
    </div>
  );
}

// Style objects remain the same
const iconWrapper = {
  display: 'flex',
  width: '48px',
  height: '48px',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '24px',
  background: '#F2F4FE',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
};

const buttonWrapper = {
  display: 'flex',
  height: '48px',
  padding: '0 16px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  borderRadius: '24px',
  background: '#F2F4FE',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
};

const icon = {
  width: '24px',
  height: '24px',
  aspectRatio: '1 / 1',
  userSelect: 'none',
};

const divider = {
  width: '1px',
  height: '24px',
  borderRadius: '2px',
  background: 'rgba(14, 19, 40, 0.08)',
};

const label = {
  color: '#0E1328',
  fontFamily: 'Lato',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '20px',
  userSelect: 'none',
};

const actionRow = {
  display: 'flex',
  padding: '8px',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
};

const sectionTitle = {
  flex: '1 0 0',
  color: 'rgba(14, 19, 40, 0.80)',
  fontFamily: 'Lato',
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: '27px',
  userSelect: 'none',
};

const downArrowIcon = {
  width: '24px',
  height: '24px',
  transform: 'rotate(360deg)',
  aspectRatio: '1 / 1',
  userSelect: 'none',
};

const upArrowIcon = {
  width: '24px',
  height: '24px',
  transform: 'rotate(180deg)',
  aspectRatio: '1 / 1',
  userSelect: 'none',
};

const frontPageWrapper = {
  display: 'flex',
  width: '1088px',
  height: '1540px',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  aspectRatio: '272/385',
  flexShrink: 0,
  position: 'relative',
};

const dayPageWrapper = {
  display: 'flex',
  width: '1088px',
  height: '1540px',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexShrink: 0,
  position: 'relative',
  overflow: 'hidden',
};

const policyPageWrapper = {
  display: 'flex',
  width: '1088px',
  maxHeight: '1540px',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexShrink: 0,
  position: 'relative',
  overflow: 'hidden', // Allow editor toolbars to be visible
};

export default RightPanel;