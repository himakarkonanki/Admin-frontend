import 'react-quill/dist/quill.snow.css';
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

            const apiUrl = import.meta.env.VITE_PDF_API_URL || 'http://localhost:5000/api/generate-pdf';
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
            if (onProgress) onProgress('Generating HTML content...');

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
        // Inline Quill snow theme CSS (minified, partial for PDF, can be extended)
        const quillSnowCSS = `
                        /* Quill snow theme for .ql-editor, scoped to day pages only */
                        /* Quill formatting styles for day page PDF */
                        .pdf-page[data-page-type="day"] .ql-editor b,
                        .pdf-page[data-page-type="day"] .ql-editor strong {
                            font-weight: bold;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor i,
                        .pdf-page[data-page-type="day"] .ql-editor em {
                            font-style: italic;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor u {
                            text-decoration: underline;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor s {
                            text-decoration: line-through;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor a {
                            color: #1976d2;
                            text-decoration: underline;
                            cursor: pointer;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor blockquote {
                            border-left: 4px solid #ccc;
                            margin: 0 0 8px 0;
                            padding: 4px 0 4px 16px;
                            color: #555;
                            font-style: italic;
                            background: #f9f9f9;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor code {
                            background: #f3f3f3;
                            color: #c7254e;
                            font-family: 'Fira Mono', 'Consolas', 'Monaco', monospace;
                            padding: 2px 4px;
                            border-radius: 4px;
                            font-size: 0.95em;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor pre {
                            background: #f3f3f3;
                            color: #333;
                            font-family: 'Fira Mono', 'Consolas', 'Monaco', monospace;
                            padding: 8px 12px;
                            border-radius: 6px;
                            font-size: 0.98em;
                            margin: 8px 0;
                            overflow-x: auto;
                        }
                .pdf-page[data-page-type="day"] .ql-container {
                    box-sizing: border-box;
                    font-family: Lato, sans-serif;
                    font-size: 20px;
                    font-weight: 400;
                    height: 100%;
                    margin: 0;
                    position: relative;
                }
                        .pdf-page[data-page-type="day"] .ql-editor {
                            box-sizing: border-box;
                            line-height: 1.6;
                            height: 100%;
                            outline: none;
                            overflow-y: auto;
                            padding: 8px 0 8px 0;
                            tab-size: 4;
                            -moz-tab-size: 4;
                            text-align: left;
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            font-family: 'Lato', sans-serif;
                            font-size: 20px;
                            font-weight: 400;
                            color: #0E1328;
                            background: #fff;
                            border-radius: 12px;
                            min-height: 40px;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor > * { cursor: text; }
                        .pdf-page[data-page-type="day"] .ql-editor p {
                            margin: 0 0 10px 0;
                            padding: 0;
                        }
                            .pdf-page[data-page-type="day"] .ql-editor ol,
                            .pdf-page[data-page-type="day"] .ql-editor ul {
                                margin: 0 0 10px 0;
                                padding-left: 28px; /* Reduced for less indentation */
                            }
                        .pdf-page[data-page-type="day"] .ql-editor li {
                            list-style-type: none;
                            padding-left: 0.5em;
                            margin-bottom: 4px;
                            position: relative;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor li:before { position: absolute; left: -12px; }
                        .pdf-page[data-page-type="day"] .ql-editor li[data-list="bullet"]:before { content: "\\2022"; font-size: 1.2em; left: -12px; top: 0.1em; color: #0E1328; }
                        .pdf-page[data-page-type="day"] .ql-editor li[data-list="ordered"] {
                            counter-increment: ql-list-0;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor ol {
                            counter-reset: ql-list-0;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor li[data-list="ordered"]:before {
                            content: counter(ql-list-0, decimal) '. ';
                            font-size: 1.2em;
                            left: -12px;
                            top: 0.1em;
                            color: #0E1328;
                        }
                        .pdf-page[data-page-type="day"] .ql-editor .ql-align-center { text-align: center; }
                        .pdf-page[data-page-type="day"] .ql-editor .ql-align-justify { text-align: justify; }
                        .pdf-page[data-page-type="day"] .ql-editor .ql-align-right { text-align: right; }
                        .pdf-page[data-page-type="day"] .ql-editor img { max-width: 100%; }
                        .pdf-page[data-page-type="day"] .ql-editor.ql-blank::before {
                            color: rgba(0,0,0,0.6);
                            content: attr(data-placeholder);
                            font-style: italic;
                            left: 15px;
                            pointer-events: none;
                            position: absolute;
                            right: 15px;
                        }
                /* End Quill snow theme for day page only */
                `;
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Itinerary PDF</title>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link
  rel="stylesheet"
  href="https://unpkg.com/react-quill@1.3.3/dist/quill.snow.css"
/>
    <style>
        ${this.getGlobalStyles()}
        ${quillSnowCSS}
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

        /* ===== PDF PAGE LAYOUT (MATCH PREVIEWPANE) ===== */
        /* Watermark centering for PDF output */
        .watermark-container {
            position: absolute !important;
            top: 250px;
            left: 50px;
            width: 1000.739px;
            height: 1000.999px;
            aspect-ratio: 143/98;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            z-index: 2;
        }
        .watermark-svg {
            opacity: 4;
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            filter: brightness(2.5);
            display: block;
            margin: 0 auto;
        }
        .pdf-page[data-page-type="day"] {
            display: flex;
            width: 1088px;
            flex-direction: column;
            align-items: center;
            flex-shrink: 0;
            align-self: stretch;
            border-radius: 0;
            overflow: visible;
            background: #FFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            page-break-after: always;
            page-break-inside: avoid;
        }
        .pdf-page[data-page-type="day"]:last-child {
            page-break-after: avoid;
        }
        /* PDF container for day pages */
        .pdf-page[data-page-type="day"] > * {
            width: 100%;
        }

        /* PDF IMAGE SECTION (for day page) */
        .pdf-image-section {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 24px !important;
            width: 100% !important;
        }
        .pdf-image-container {
            padding: 0px 0px 0px 16px !important;
            margin-left: -16px !important;
            margin-right: 16px !important;
            align-self: stretch !important;
            width: auto !important;
            position: relative !important;
        }
        .pdf-image {
            width: 920px !important;
            height: 300px !important;
            object-fit: cover !important;
            border-radius: 16px !important;
            display: block !important;
        }

        /* ===== PAGE LAYOUT STYLES (fallback for non-day) ===== */
        .pdf-page {
            page-break-after: always;
            page-break-inside: avoid;
            overflow: visible !important;
        }
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
}
