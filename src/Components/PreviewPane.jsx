import React, { useRef, useState, useEffect, useCallback } from 'react'
import close from '../assets/icons/close.svg'
import dnd from '../assets/icons/do_not_disturb_on.svg'
import download from '../assets/icons/download.svg'
import add from '../assets/icons/add_circle.svg'
import FrontPage from './FrontPage'
import DayPage from './DayPage'
import PolicyPage from './PolicyPage'
import PolicyPagePreview from './PolicyPagePreview'
import ThankYouPage from './ThankYouPage'
import { PDFGenerator } from './pdf/PDFGenerator'

function PreviewPane({ onClose, pages, getPolicyPageData }) {
    const pagesContainerRef = useRef(null);
    const pdfContainerRef = useRef(null); // New PDF-specific container
    const [zoomLevel, setZoomLevel] = useState(75);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [policyPageData, setPolicyPageData] = useState({});
    const scrollContainerRef = useRef(null);

    // Zoom level options
    const zoomLevels = [50, 67, 75, 90, 100, 125, 150, 175, 200];

    // Zoom functions
    const zoomIn = () => {
        const currentIndex = zoomLevels.findIndex(level => level === zoomLevel);
        if (currentIndex < zoomLevels.length - 1) {
            setZoomLevel(zoomLevels[currentIndex + 1]);
        }
    };

    const zoomOut = () => {
        const currentIndex = zoomLevels.findIndex(level => level === zoomLevel);
        if (currentIndex > 0) {
            setZoomLevel(zoomLevels[currentIndex - 1]);
        }
    };

    // Reset zoom to fit
    const resetZoom = () => {
        setZoomLevel(50);
    };

    // Function to extract data from the actual PolicyPage DOM elements
    const extractDataFromDOM = useCallback((pageId) => {
        try {
            // Try to find the PolicyPage component in the main application
            // This looks for contentEditable elements with the policy page structure
            const policyPageElements = document.querySelectorAll('[contenteditable="true"]');
            
            for (let element of policyPageElements) {
                // Check if this element belongs to our policy page
                const parentContainer = element.closest('[data-page-type="policy"]') || 
                                      element.closest('.policy-page') ||
                                      // Look for the specific structure from PolicyPage.jsx
                                      (element.style.fontSize === '64px' ? element.parentNode : null);
                
                if (parentContainer) {
                    // Found a policy page container, extract data
                    const titleElement = parentContainer.querySelector('[contenteditable="true"][style*="font-size: 64px"], [contenteditable="true"][style*="fontSize: 64px"]') ||
                                        Array.from(parentContainer.querySelectorAll('[contenteditable="true"]')).find(el => 
                                            el.style.fontSize === '64px' || 
                                            getComputedStyle(el).fontSize === '64px'
                                        );
                    
                    const editorElement = Array.from(parentContainer.querySelectorAll('[contenteditable="true"]')).find(el => 
                        el !== titleElement && 
                        (el.style.fontSize === '24px' || getComputedStyle(el).fontSize === '24px')
                    );

                    if (titleElement && editorElement) {
                        const title = titleElement.textContent || titleElement.innerText || 'Terms & Conditions';
                        const fields = extractFieldsFromEditor(editorElement);
                        
                        return { title, fields };
                    }
                }
            }
        } catch (error) {
            console.error('Error extracting data from DOM:', error);
        }
        
        return null;
    }, []);

    // Helper function to extract fields from editor element
    const extractFieldsFromEditor = (editorElement) => {
        const fields = [];
        let fieldId = 1;

        const processNode = (node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                
                switch (tagName) {
                    case 'h2':
                        fields.push({
                            id: fieldId++,
                            type: 'title',
                            content: node.textContent || node.innerText || ''
                        });
                        break;
                        
                    case 'p':
                        const textContent = node.textContent || node.innerText || '';
                        if (textContent.trim() && !textContent.includes('Type your Terms & Conditions here')) {
                            fields.push({
                                id: fieldId++,
                                type: 'details',
                                content: node.innerHTML || textContent
                            });
                        }
                        break;
                        
                    case 'ul':
                    case 'ol':
                        const listItems = Array.from(node.querySelectorAll('li'))
                            .map(li => {
                                const text = li.textContent || li.innerText || '';
                                return text.trim();
                            })
                            .filter(text => text !== ''); // Remove empty items
                            
                        if (listItems.length > 0) {
                            fields.push({
                                id: fieldId++,
                                type: 'list',
                                style: tagName === 'ol' ? 'ordered' : 'unordered',
                                content: listItems
                            });
                        }
                        break;
                        
                    case 'table':
                        const tableData = extractTableDataFromElement(node);
                        if (tableData && tableData.length > 0) {
                            fields.push({
                                id: fieldId++,
                                type: 'table',
                                content: tableData
                            });
                        }
                        break;
                }
            }
        };

        Array.from(editorElement.childNodes).forEach(processNode);
        
        // If no fields found, add default
        if (fields.length === 0) {
            fields.push({
                id: 1,
                type: 'details',
                content: 'Type your Terms & Conditions here…'
            });
        }

        return fields;
    };

    // Helper function to extract table data from DOM element
    const extractTableDataFromElement = (tableElement) => {
        const rows = [];
        
        // Extract all rows from the table, regardless of thead/tbody structure
        const allRows = Array.from(tableElement.querySelectorAll('tr'));
        allRows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td, th')).map(cell => {
                return cell.textContent || cell.innerText || '';
            });
            if (cells.length > 0) {
                rows.push(cells);
            }
        });
        
        return rows;
    };

    // Update policy page data periodically or when pages change
    useEffect(() => {
        const updatePolicyData = () => {
            const policyPages = pages.filter(page => page.type === 'policy');
            
            policyPages.forEach(page => {
                // Try multiple approaches to get the data
                let pageData = null;
                
                // Approach 1: Use callback function if provided
                if (getPolicyPageData && typeof getPolicyPageData === 'function') {
                    try {
                        pageData = getPolicyPageData(page.id);
                    } catch (error) {
                        console.error('Error from getPolicyPageData callback:', error);
                    }
                }
                
                // Approach 2: Extract from DOM
                if (!pageData) {
                    pageData = extractDataFromDOM(page.id);
                }
                
                // Approach 3: Use page data directly
                if (!pageData) {
                    pageData = {
                        title: page.title || 'Terms & Conditions',
                        fields: page.fields || [{
                            id: 1,
                            type: 'details',
                            content: 'Type your Terms & Conditions here…'
                        }]
                    };
                }
                
                if (pageData) {
                    setPolicyPageData(prev => ({
                        ...prev,
                        [page.id]: pageData
                    }));
                }
            });
        };

        updatePolicyData();
        
        // Set up interval to periodically update data
        const interval = setInterval(updatePolicyData, 1000);
        
        return () => clearInterval(interval);
    }, [pages, getPolicyPageData, extractDataFromDOM]);

    // Function to render page component based on type
    const renderPageComponent = (page, pageNumber) => {
        let dayNumber = 1;
        if (page.type === 'day') {
            const currentPageIndex = pages.findIndex(p => p.id === page.id);
            const dayPagesBefore = pages.slice(0, currentPageIndex).filter(p => p.type === 'day').length;
            dayNumber = dayPagesBefore + 1;
        }

        const pageProps = {
            pageId: page.id,
            pageNumber: pageNumber,
            pageData: page,
            isPreview: true,
            ...(page.type === 'day' && { dayNumber }),
        };

        try {
            switch (page.type) {
                case 'cover':
                    return <FrontPage {...pageProps} />;
                case 'day':
                    return <DayPage {...pageProps} />;
                case 'policy':
                    // Use the latest extracted data
                    const currentPolicyData = policyPageData[page.id] || {
                        title: page.title || 'Terms & Conditions',
                        fields: page.fields || [{
                            id: 1,
                            type: 'details',
                            content: 'Type your Terms & Conditions here…'
                        }]
                    };
                    return (
                        <PolicyPagePreview 
                            data={currentPolicyData} 
                            pageNumber={pageNumber} 
                        />
                    );
                case 'thankyou':
                    return <ThankYouPage {...pageProps} />;
                default:
                    return (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            height: '100%', 
                            fontFamily: 'Lato', 
                            fontSize: '18px', 
                            color: '#666' 
                        }}>
                            Unknown page type: {page.type}
                        </div>
                    );
            }
        } catch (error) {
            console.error('Error rendering page component:', error);
            return (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%', 
                    fontFamily: 'Lato', 
                    fontSize: '18px', 
                    color: '#f44336',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div>Error loading page</div>
                    <div style={{ fontSize: '14px', color: '#999' }}>
                        Page ID: {page.id}, Type: {page.type}
                    </div>
                </div>
            );
        }
    };

    // Function to render PDF-optimized page components (no height restrictions)
    const renderPDFPageComponent = (page, pageNumber) => {
        let dayNumber = 1;
        if (page.type === 'day') {
            const currentPageIndex = pages.findIndex(p => p.id === page.id);
            const dayPagesBefore = pages.slice(0, currentPageIndex).filter(p => p.type === 'day').length;
            dayNumber = dayPagesBefore + 1;
        }

        const pageProps = {
            pageId: page.id,
            pageNumber: pageNumber,
            pageData: page,
            isPreview: true,
            isPDFMode: true, // Add PDF mode flag
            ...(page.type === 'day' && { dayNumber }),
        };

        try {
            switch (page.type) {
                case 'cover':
                    return <FrontPage {...pageProps} />;
                case 'day':
                    return <DayPage {...pageProps} />;
                case 'policy':
                    // Use the latest extracted data with PDF mode
                    const currentPolicyData = policyPageData[page.id] || {
                        title: page.title || 'Terms & Conditions',
                        fields: page.fields || [{
                            id: 1,
                            type: 'details',
                            content: 'Type your Terms & Conditions here…'
                        }]
                    };
                    return (
                        <PolicyPagePreview 
                            data={currentPolicyData} 
                            pageNumber={pageNumber}
                            isPDFMode={true}
                        />
                    );
                case 'thankyou':
                    return <ThankYouPage {...pageProps} />;
                default:
                    return (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            height: '100%', 
                            fontFamily: 'Lato', 
                            fontSize: '18px', 
                            color: '#666' 
                        }}>
                            Unknown page type: {page.type}
                        </div>
                    );
            }
        } catch (error) {
            console.error('Error rendering PDF page component:', error);
            return (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%', 
                    fontFamily: 'Lato', 
                    fontSize: '18px', 
                    color: '#f44336',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div>Error loading PDF page</div>
                    <div style={{ fontSize: '14px', color: '#999' }}>
                        Page ID: {page.id}, Type: {page.type}
                    </div>
                </div>
            );
        }
    };

    // Extract all policy page data before PDF generation
    const extractAllPolicyPageData = () => {
        const policyPages = pages.filter(page => page.type === 'policy');
        const extractedData = {};
        
        policyPages.forEach(page => {
            extractedData[page.id] = policyPageData[page.id] || {
                title: page.title || 'Terms & Conditions',
                fields: page.fields || []
            };
        });

        return extractedData;
    };

    // PDF Download Function
    const downloadAsPDF = async () => {
        if (!pages || pages.length === 0) {
            alert('No pages to download');
            return;
        }

        if (isGeneratingPDF) {
            return;
        }

        setIsGeneratingPDF(true);

        try {
            const allPolicyData = extractAllPolicyPageData();
            
            await PDFGenerator.generateAndDownload({
                pages,
                pagesContainerRef: pdfContainerRef.current, // Use PDF container instead
                policyPageData: allPolicyData,
                onProgress: (message) => console.log(message)
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000, background: 'transparent', animation: 'slideUpFromBottom 0.3s ease-out forwards' }}>
            <div style={{ display: 'flex', width: '100%', height: '100%', paddingTop: '64px', justifyContent: 'center', alignItems: 'center', background: 'transparent' }}>
                <div style={{ display: 'flex', padding: '0 24px', flexDirection: 'column', alignItems: 'flex-start', gap: '24px', flex: '1 0 0', alignSelf: 'stretch', background: '#FFF', borderRadius: '32px 32px 0 0' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        padding: '24px 12px 0 12px',
                        minHeight: '56px',
                        boxSizing: 'border-box',
                        position: 'relative'
                    }}>
                        {/* Left: Heading */}
                        <div style={{
                            flex: '1 0 0',
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: 0
                        }}>
                            <div style={{
                                color: '#11121F',
                                fontFamily: 'Lato',
                                fontSize: '20px',
                                fontWeight: 600,
                                lineHeight: '24px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                Itinerary Preview
                            </div>
                        </div>

                        {/* Center: Zoom + Download */}
                        <div style={{
                            flex: '0 0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            height: '40px'
                        }}>
                            {/* Zoom Controls */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'rgba(14, 19, 40, 0.04)',
                                borderRadius: '16px',
                                height: '40px',
                                padding: '0 12px'
                            }}>
                                {/* Zoom Out */}
                                <div
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: zoomLevel > zoomLevels[0] ? 'pointer' : 'not-allowed',
                                        opacity: zoomLevel > zoomLevels[0] ? 1 : 0.5,
                                        borderRadius: '4px',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={zoomLevel > zoomLevels[0] ? zoomOut : undefined}
                                    title="Zoom Out"
                                >
                                    <img src={dnd} alt="zoom-out" />
                                </div>
                                {/* Zoom Value */}
                                <div style={{
                                    minWidth: '52px',
                                    textAlign: 'center',
                                    fontFamily: 'Lato',
                                    fontSize: '18px',
                                    fontWeight: 500,
                                    color: '#11121F',
                                    cursor: 'pointer',
                                    lineHeight: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }} onClick={resetZoom} title="Reset Zoom (Click to fit)">
                                    {zoomLevel}%
                                </div>
                                {/* Zoom In */}
                                <div
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: zoomLevel < zoomLevels[zoomLevels.length - 1] ? 'pointer' : 'not-allowed',
                                        opacity: zoomLevel < zoomLevels[zoomLevels.length - 1] ? 1 : 0.5,
                                        borderRadius: '4px',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={zoomLevel < zoomLevels[zoomLevels.length - 1] ? zoomIn : undefined}
                                    title="Zoom In"
                                >
                                    <img src={add} alt="zoom-in" />
                                </div>
                            </div>

                            {/* Download PDF Button */}
                            <div
                                style={{
                                    borderRadius: '24px',
                                    background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.30), rgba(0, 0, 0, 0.30)), #3874FF',
                                    display: 'flex',
                                    height: '40px',
                                    padding: '0 16px',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
                                    opacity: isGeneratingPDF ? 0.5 : 1,
                                }}
                                onClick={isGeneratingPDF ? undefined : downloadAsPDF}
                                title="Download as PDF"
                            >
                                <img src={download} alt="download-icon" style={{ width: '24px', height: '24px' }} />
                                <span style={{
                                    color: '#FFF',
                                    fontFamily: 'Lato',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                }}>
                                    {isGeneratingPDF ? 'Generating...' : 'Download as PDF'}
                                </span>
                            </div>
                        </div>

                        {/* Right: Close Button */}
                        <div style={{
                            flex: '1 0 0',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            minWidth: 0
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: '28px',
                                background: 'rgba(0, 0, 0, 0.08)',
                                cursor: 'pointer'
                            }} onClick={onClose}>
                                <img src={close} alt="close icon" style={{ width: '24px', height: '24px' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '24px', flex: '1 0 0', alignSelf: 'stretch' }}>
                        {/* Scrollable container with zoom applied */}
                        <div
                            ref={scrollContainerRef}
                            style={{
                                display: 'flex',
                                padding: '32px',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '24px',
                                flex: '1 0 0',
                                alignSelf: 'stretch',
                                borderRadius: '24px 24px 0 0',
                                background: '#EEF0F3',
                                overflowY: 'auto',
                                overflowX: 'auto',
                                maxHeight: 'calc(100vh - 150px)'
                            }}
                        >

                            {/* Pages container with zoom transformation */}
                            <div
                                ref={pagesContainerRef}
                                style={{
                                    display: 'flex',
                                    width: '1088px',
                                    maxWidth: 'none',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '24px',
                                    transform: `scale(${zoomLevel / 100})`,
                                    transformOrigin: 'center top',
                                    transition: 'transform 0.3s ease'
                                }}
                            >
                                {/* Render all pages dynamically */}
                                {pages && pages.length > 0 ? pages.map((page, index) => (
                                    <div
                                        key={page.id || index}
                                        className="pdf-page"
                                        data-page-id={page.id}
                                        data-page-type={page.type}
                                        style={{
                                            display: 'flex',
                                            width: '100%',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            alignItems: 'center',
                                            flexShrink: 0,
                                            alignSelf: 'stretch',
                                            borderRadius: '0',
                                            overflow: 'visible',
                                            background: '#FFF',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        {/* Render the actual page content */}
                                        {renderPageComponent(page, index + 1)}
                                    </div>
                                )) : (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '200px',
                                        fontFamily: 'Lato',
                                        fontSize: '18px',
                                        color: '#666'
                                    }}>
                                        No pages to preview
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden PDF container - used only for PDF generation */}
            <div
                ref={pdfContainerRef}
                style={{
                    position: 'absolute',
                    top: '-10000px',
                    left: '-10000px',
                    visibility: 'hidden',
                    width: '1088px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0px'
                }}
            >
                {/* Render PDF-optimized pages */}
                {pages && pages.length > 0 ? pages.map((page, index) => (
                    <div
                        key={`pdf-${page.id || index}`}
                        className="pdf-page"
                        data-page-id={page.id}
                        data-page-type={page.type}
                        style={{
                            display: 'flex',
                            width: '100%',
                            flexDirection: 'column',
                            background: '#FFF',
                            overflow: 'visible'
                        }}
                    >
                        {/* Render PDF-optimized page content */}
                        {renderPDFPageComponent(page, index + 1)}
                    </div>
                )) : null}
            </div>

            {/* Global styles */}
            <style jsx="true" global="true">{`
                /* Custom scrollbar for zoom container */
                div[style*="overflowY: auto"]::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                div[style*="overflowY: auto"]::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                }
                
                div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 4px;
                }
                
                div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.3);
                }

                /* Animation for the preview pane */
                @keyframes slideUpFromBottom {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                /* Add data attributes for easier DOM querying */
                .policy-page {
                    position: relative;
                }
                
                .policy-page::before {
                    content: attr(data-page-type);
                    position: absolute;
                    top: -20px;
                    left: 0;
                    font-size: 10px;
                    color: #999;
                    display: none;
                }
            `}</style>
        </div>
    )
}

export default PreviewPane