export class PDFGenerator {
    // PDF generation main method
    static async generateAndDownload({ pages, pagesContainerRef, onProgress }) {
        let loadingDiv = null;

        try {
            // Show enhanced loading indicator
            loadingDiv = this.createLoadingIndicator(pages.length);
            document.body.appendChild(loadingDiv);

            if (onProgress) onProgress('Starting PDF generation process...');

            // Generate HTML content for all pages
            const htmlContent = await this.generateHTMLContent(pages, pagesContainerRef, onProgress);

            if (onProgress) onProgress('Sending request to backend...');

            // Send HTML to separate Node.js backend for PDF generation
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 100000); // 60 second timeout

            const apiUrl = import.meta.env.PDF_API_URL || 'http://localhost:5000/api/generate-pdf';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
                body: JSON.stringify({
                    html: htmlContent,
                    options: {
                        format: 'A4',
                        printBackground: true,
                        margin: {
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0
                        }
                    }
                })
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: Failed to generate PDF`);
            }

            if (onProgress) onProgress('📄 Receiving PDF from backend...');

            // Get the PDF blob
            const pdfBlob = await response.blob();

            if (pdfBlob.size === 0) {
                throw new Error('Received empty PDF file');
            }

            if (onProgress) onProgress(`PDF size: ${(pdfBlob.size / 1024 / 1024).toFixed(2)} MB`);

            // Create download link
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            link.download = `itinerary-pages-${timestamp}.pdf`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            if (onProgress) onProgress('PDF downloaded successfully using Puppeteer backend');

        } finally {
            // Clean up loading indicator
            if (loadingDiv && document.body.contains(loadingDiv)) {
                document.body.removeChild(loadingDiv);
            }
        }
    }

    // Create loading indicator
    static createLoadingIndicator(pageCount) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'pdf-loading-indicator';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-family: Lato;
            font-size: 18px;
            flex-direction: column;
            gap: 15px;
        `;
        loadingDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 20px; height: 20px; border: 2px solid #fff; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <span>Generating PDF... Please wait.</span>
            </div>
            <div style="font-size: 14px; opacity: 0.8;">Processing ${pageCount} page(s)...</div>
            <div style="font-size: 12px; opacity: 0.6;">This may take a few moments</div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        return loadingDiv;
    }

    // Generate HTML content for PDF
    static async generateHTMLContent(pages, pagesContainerRef, onProgress) {
        try {
            if (onProgress) onProgress('🔄 Generating HTML content...');
            
            // Wait for all fonts and assets to load
            await document.fonts.ready;

            let pagesHTML = '';

            // Generate HTML for each page individually to reduce memory usage
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                if (onProgress) onProgress(`Processing page ${i + 1}/${pages.length}: ${page.type}`);
                
                // Get the existing rendered page element from the preview
                const existingPageElement = pagesContainerRef?.querySelector(`[data-page-id="${page.id}"]`);
                
                if (existingPageElement) {
                    // Create a simplified clone without zoom transforms
                    const cleanHTML = existingPageElement.innerHTML
                        .replace(/style="[^"]*transform:[^"]*scale[^"]*"/g, '') // Remove zoom transforms
                        .replace(/data-reactroot/g, '') // Remove React artifacts
                        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
                        .replace(/\s+/g, ' ') // Normalize whitespace
                        .trim();
                    
                    pagesHTML += `
                    <div class="pdf-page" data-page-id="${page.id}" style="
                        width: 1088px;
                        min-height: auto;
                        background: white;
                        page-break-after: always;
                        page-break-inside: auto;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        font-family: 'Lato', sans-serif;
                        position: relative;
                        overflow: visible;
                    ">
                        ${cleanHTML}
                    </div>`;
                } else {
                    console.warn(`Could not find existing page element for ${page.id}`);
                    pagesHTML += `
                    <div class="pdf-page" data-page-id="${page.id}" style="
                        width: 1088px;
                        min-height: 1540px;
                        background: white;
                        page-break-after: always;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: 'Lato', sans-serif;
                    ">
                        <div>Page ${i + 1} - ${page.type}</div>
                    </div>`;
                }
            }

            // Create optimized HTML document using integrated styles
            const completeHTML = this.createHTMLDocument(pagesHTML);

            if (onProgress) onProgress('HTML content generated successfully');
            return completeHTML;

        } catch (error) {
            console.error('Error generating HTML content:', error);
            throw new Error(`Failed to generate HTML content: ${error.message}`);
        }
    }

    // ===== INTEGRATED PDF STYLES SECTION =====

    // Create complete HTML document with styles
    static createHTMLDocument(pagesHTML) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Itinerary PDF</title>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        ${this.getGlobalStyles()}
    </style>
</head>
<body>
    ${pagesHTML}
</body>
</html>`;
    }

    // Get all PDF styling rules
    static getGlobalStyles() {
        return `
        /* ===== BASE STYLES ===== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Lato', sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        body {
            font-family: 'Lato', sans-serif !important;
            line-height: 1.4;
            color: #0E1328;
            background: white;
            margin: 0;
            padding: 0;
        }
        
        /* ===== PAGE LAYOUT STYLES ===== */
        .pdf-page {
            page-break-after: always;
            page-break-inside: avoid;
            overflow: visible !important;
        }
        
        /* Special handling for policy pages - allow content to break across pages */
        .pdf-page[data-page-id*="policy"] {
            page-break-inside: auto !important;
            min-height: auto !important;
        }
        
        .pdf-page:last-child {
            page-break-after: avoid;
        }
        
        /* ===== MEDIA ELEMENTS ===== */
        img {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
        }
        
        /* ===== TABLE STYLES ===== */
        table {
            border-collapse: collapse !important;
            width: 100% !important;
            page-break-inside: avoid !important;
        }
        
        /* ===== TYPOGRAPHY STYLES ===== */
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Lato', sans-serif !important;
            page-break-after: avoid !important;
        }
        
        p {
            font-family: 'Lato', sans-serif !important;
            orphans: 3 !important;
            widows: 3 !important;
        }
        
        /* ===== PAGE SETTINGS ===== */
        @page {
            size: A4;
            margin: 0;
        }
        
        /* ===== PRINT STYLES ===== */
        @media print {
            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .pdf-page {
                page-break-after: always !important;
                page-break-inside: avoid !important;
            }
            
            .pdf-page[data-page-id*="policy"] {
                page-break-inside: auto !important;
            }
            
            /* Ensure colors are preserved in print */
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
        
        /* ===== CUSTOM ITINERARY STYLES ===== */
        .itinerary-content {
            font-family: 'Lato', sans-serif !important;
        }
        
        .day-header {
            page-break-after: avoid !important;
            margin-bottom: 0 !important;
        }
        
        .activity-block {
            page-break-inside: avoid !important;
        }
        
        /* ===== ENHANCED RESPONSIVE ELEMENTS ===== */
        .responsive-text {
            font-size: inherit !important;
            line-height: inherit !important;
        }
        
        .flex-container {
            display: flex !important;
            align-items: center !important;
        }
        
        /* ===== BACKGROUND AND BORDERS ===== */
        .with-background {
            background-color: inherit !important;
            -webkit-print-color-adjust: exact !important;
        }
        
        .with-border {
            border: inherit !important;
        }
        
        /* ===== UTILITY CLASSES ===== */
        .no-break {
            page-break-inside: avoid !important;
        }
        
        .force-break {
            page-break-before: always !important;
        }
        
        .text-center {
            text-align: center !important;
        }
        
        .text-left {
            text-align: left !important;
        }
        
        .text-right {
            text-align: right !important;
        }
        
        /* ===== SPACING UTILITIES ===== */
        .margin-top-small {
            margin-top: 8px !important;
        }
        
        .margin-top-medium {
            margin-top: 16px !important;
        }
        
        .margin-top-large {
            margin-top: 24px !important;
        }
        
        .margin-bottom-small {
            margin-bottom: 8px !important;
        }
        
        .margin-bottom-medium {
            margin-bottom: 16px !important;
        }
        
        .margin-bottom-large {
            margin-bottom: 24px !important;
        }`;
    }

    // Additional utility methods for styling
    static getCustomPageStyles(pageType) {
        const customStyles = {
            cover: `
                .cover-page {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    text-align: center;
                }
            `,
            day: `
                .day-page {
                    padding: 20px;
                }
                .day-title {
                    font-size: 24px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    page-break-after: avoid;
                }
            `,
            policy: `
                .policy-page {
                    padding: 30px;
                    font-size: 14px;
                    line-height: 1.6;
                }
                .policy-section {
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }
            `,
            thankyou: `
                .thankyou-page {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 40px;
                }
            `
        };

        return customStyles[pageType] || '';
    }

    // Method to inject additional CSS if needed
    static injectCustomCSS(additionalCSS) {
        return `
        ${this.getGlobalStyles()}
        
        /* ===== CUSTOM INJECTED STYLES ===== */
        ${additionalCSS}
        `;
    }
}
