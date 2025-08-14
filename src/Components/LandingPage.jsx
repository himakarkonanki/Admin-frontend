import React, { useState, useEffect } from 'react'
import '../App.css'
import RightPanel from './RightPanel'
import LeftPanel from './LeftPanel'

function LandingPage() {
  const [pages, setPages] = useState([
    { 
      id: 1, 
      type: 'cover', 
      title: 'Cover Page',
      destinationName: '',
      adults: 0,
      children: 0,
      tripDuration: '',
      backgroundImage: null
    },
    { 
      id: 2, 
      type: 'thankyou', 
      title: 'Thank You Page',
      thankYouTitle: '',
      thankYouMessage: '',
      phoneNumber: '',
      emailAddress: '',
      websiteOrInstagram: ''
    }
  ]);

  const addPage = (pageType) => {
    let newPage;
    
    if (pageType === 'day') {
      const dayPageCount = pages.filter(p => p.type === 'day').length;
      newPage = {
        id: Date.now(),
        type: 'day',
        title: `Day Page ${dayPageCount + 1}`,
        destination: '',
        arrivalDetails: '',
        transferDetails: '',
        dropDetails: '',
        activityDetails: ['', '', ''],
        uploadedImage: null,
        mealSelections: { breakfast: false, lunch: false, dinner: false },
        icons: { arrival: 'PlaneLanding', transfer: 'CarFront', drop: 'CarFront', activity: 'Landmark' },
        sectionHeadings: { arrival: 'Arrival', transfer: 'Transfer', activity: 'Activities', drop: 'Drop' },
        dynamicSections: []
      };
    } else if (pageType === 'policy') {
      const policyPageCount = pages.filter(p => p.type === 'policy').length;
      newPage = {
        id: Date.now(),
        type: 'policy',
        title: `Policy Page ${policyPageCount + 1}`,
        detailFields: [{ id: 1, type: 'details', hasContent: false, data: {} }],
        titleContent: ''
      };
    }

    if (newPage) {
      // Insert new page before thank you page
      const coverPages = pages.filter(p => p.type === 'cover');
      const dayPages = pages.filter(p => p.type === 'day');
      const policyPages = pages.filter(p => p.type === 'policy');
      const thankYouPages = pages.filter(p => p.type === 'thankyou');
      
      if (pageType === 'day') {
        setPages([...coverPages, ...dayPages, newPage, ...policyPages, ...thankYouPages]);
      } else if (pageType === 'policy') {
        setPages([...coverPages, ...dayPages, ...policyPages, newPage, ...thankYouPages]);
      }
    }
  };

  const duplicatePage = (pageId) => {
    const pageToDuplicate = pages.find(p => p.id === pageId);
    if (pageToDuplicate && (pageToDuplicate.type === 'day' || pageToDuplicate.type === 'policy')) {
      const duplicatedPage = {
        ...pageToDuplicate,
        id: Date.now(),
        title: `${pageToDuplicate.title} Copy`
      };

      // Insert the duplicated page right after the original
      const pageIndex = pages.findIndex(p => p.id === pageId);
      const newPages = [...pages];
      newPages.splice(pageIndex + 1, 0, duplicatedPage);
      setPages(newPages);
    }
  };

  const deletePage = (pageId) => {
    const pageToDelete = pages.find(p => p.id === pageId);
    // Only allow deletion of day and policy pages
    if (pageToDelete && (pageToDelete.type === 'day' || pageToDelete.type === 'policy')) {
      setPages(pages.filter(p => p.id !== pageId));
    }
  };

  // Add browser reload confirmation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Check if there's any user data to protect
      const hasUserData = pages.some(page => {
        if (page.type === 'cover') {
          return page.destinationName || page.adults > 0 || page.children > 0 || page.tripDuration;
        }
        if (page.type === 'day') {
          return page.destination || page.arrivalDetails || page.transferDetails || page.dropDetails || 
                 page.activityDetails.some(activity => activity) || page.uploadedImage;
        }
        if (page.type === 'policy') {
          return page.titleContent || (page.detailFields && page.detailFields.some(field => field.hasContent));
        }
        if (page.type === 'thankyou') {
          return page.thankYouTitle || page.thankYouMessage || page.phoneNumber || page.emailAddress || page.websiteOrInstagram;
        }
        return false;
      });

      if (hasUserData) {
        // Set returnValue to trigger browser's default confirmation dialog
        event.preventDefault();
        event.returnValue = ''; // This is required for Chrome
        return ''; // For other browsers
      }
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pages]);

  // Handler to update page data (for real-time preview synchronization)
  const handlePageDataUpdate = (pageId, updatedData) => {
    console.log('handlePageDataUpdate called:', { pageId, updatedData });
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId 
          ? { ...page, ...updatedData }
          : page
      )
    );
  };

  // Fixed: Use setPages instead of setPage
  const handleReorderPages = (reorderedPages) => {
    setPages(reorderedPages);
  };

  // Scroll to page functionality
  const scrollToPage = (pageId) => {
    // Method 1: Using data-page-id attribute (most reliable)
    const pageElement = document.querySelector(`[data-page-id="${pageId}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      return;
    }

    // Method 2: Alternative approach - find by class and index
    const pageElements = document.querySelectorAll('.page-component, .pdf-page');
    const pageIndex = pages.findIndex(page => page.id === pageId);
    
    if (pageElements[pageIndex]) {
      pageElements[pageIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      return;
    }

    // Method 3: If using a specific scroll container in RightPanel
    const rightPanelContainer = document.querySelector('.right-panel-scroll-container');
    if (rightPanelContainer) {
      const targetPageElement = rightPanelContainer.querySelector(`[data-page-id="${pageId}"]`);
      if (targetPageElement) {
        const containerRect = rightPanelContainer.getBoundingClientRect();
        const elementRect = targetPageElement.getBoundingClientRect();
        const scrollTop = rightPanelContainer.scrollTop + elementRect.top - containerRect.top;
        
        rightPanelContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }

    // Fallback: Log for debugging
    console.log(`Attempting to scroll to page with ID: ${pageId}`);
  };

  return (
    <div style={{
      display: "flex",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      background: '#E7E9F5',
    }}>
      <LeftPanel 
        pages={pages} 
        onAddPage={addPage}
        onDuplicatePage={duplicatePage}
        onDeletePage={deletePage}
        onReorderPages={handleReorderPages}
        onPageClick={scrollToPage} // Add the scroll functionality
      />
      <div style={{ marginLeft: '320px', flex: 1 }}>
        <RightPanel 
          pages={pages} 
          onPageDataUpdate={handlePageDataUpdate}
        />
      </div>
    </div>
  );
}

export default LandingPage;
