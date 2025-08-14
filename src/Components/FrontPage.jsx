import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import company from '../assets/icons/companyLogo.svg';
import dnd from '../assets/icons/do_not_disturb_on_grey.svg';
import add from '../assets/icons/add_circle_grey.svg';
import upload from '../assets/icons/upload_image.svg';
import TripDurationPicker from './TripDurationPicker';

function CoverPage({ pageId, pageNumber, pageData, isPreview = false, onDataUpdate }) {
    const [base64Image, setBase64Image] = useState('');
    const [isHoveringBackground, setIsHoveringBackground] = useState(false); // State for all hover effects
    const [localData, setLocalData] = useState({
        backgroundImage: pageData?.backgroundImage || null,
        destinationName: pageData?.destinationName || '',
        adults: pageData?.adults || 0,
        children: pageData?.children || 0,
        tripDuration: pageData?.tripDuration || ''
    });

    const fileInputRef = useRef();

    const uniqueIds = useMemo(() => ({
        fileInput: `file-input-${pageId || 'default'}`,
        destinationInput: `destination-input-${pageId || 'default'}`,
        tripDurationContainer: `trip-duration-${pageId || 'default'}`,
        adultsContainer: `adults-container-${pageId || 'default'}`,
        childrenContainer: `children-container-${pageId || 'default'}`,
        adultsMinusBtn: `adults-minus-${pageId || 'default'}`,
        adultsPlusBtn: `adults-plus-${pageId || 'default'}`,
        childrenMinusBtn: `children-minus-${pageId || 'default'}`,
        childrenPlusBtn: `children-plus-${pageId || 'default'}`
    }), [pageId]);

    // Memoize styles to prevent recreation on every render
    const styles = useMemo(() => {
        // Define the two possible gradients for the background
        const defaultGradient = 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.72) 100%)';
        const hoverGradient = 'linear-gradient(180deg, rgba(0, 0, 0, 0.24) -87.69%, rgba(0, 0, 0, 0.72) 73.6%)';

        // Choose the gradient based on hover state (only if an image exists and not in preview)
        const activeGradient = isHoveringBackground && localData.backgroundImage && !isPreview ? hoverGradient : defaultGradient;

        return {
            container: {
                display: 'flex',
                width: '1088px',
                height: '100%',
                minHeight: '1540px',
                padding: '64px 64px 0 64px',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                // UPDATED: Dynamically set background image with the chosen gradient
                backgroundImage: `${activeGradient}, url(${localData.backgroundImage || ""})`,
                backgroundColor: '#0E1328',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-image 0.3s ease-in-out', // Smooth transition for the gradient change
            },
            hoverText: {
                position: 'absolute',
                top: '45%', // Adjusted for better centering in the visible area above the form
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#FFF',
                fontFamily: 'Lato',
                fontSize: '28px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '36px',
                pointerEvents: 'none', // Prevents text from capturing mouse events
                userSelect: 'none',   // Prevents text selection
                zIndex: 5,            // Ensures text is on top
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)', // Improves readability
                opacity: isHoveringBackground ? 1 : 0, // Controlled by hover state
                transition: 'opacity 0.3s ease-in-out',
            },
            backgroundClickArea: {
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                cursor: isPreview ? 'default' : 'pointer',
                zIndex: 1, // Sits above the background but below other content
            },
            logoContainer: {
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                height: '90px',
                position: 'relative',
                zIndex: 2, // Above the click area
            },
            logoWrapper: {
                display: 'flex',
                width: '272px',
                height: '90px',
                padding: '16px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '16px',
                background: 'rgba(14, 19, 40, 0.80)',
            },
            logo: {
                height: '46.918px',
                flexShrink: 0,
                alignSelf: 'stretch',
            },
            uploadPrompt: {
                display: 'flex',
                width: '960px',
                height: '600px',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                // border: '1px dashed rgba(255, 255, 255, 0.40)',
                borderRadius: '12px',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 2, // Above the click area
            },
            mainForm: {
                display: 'flex',
                padding: '32px 32px 64px 32px',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '16px',
                alignSelf: 'stretch',
                borderRadius: '32px 32px 0 0',
                background: 'rgba(14, 19, 40, 0.80)',
                position: 'relative',
                boxSizing: 'border-box',
                zIndex: 2, // Above the click area
            },
            // --- The rest of the styles are unchanged ---
            sectionContainer: { display: 'flex', padding: '8px 16px', alignItems: 'center', gap: '16px', alignSelf: 'stretch', borderRadius: '16px', height: '64px' },
            labelContainer: { display: 'flex', width: '210px', height: '32px', alignItems: 'center', justifyContent: 'space-between' },
            labelContainerTall: { display: "flex", alignItems: "center", width: "210px", height: "64px", justifyContent: 'space-between' },
            labelText: { color: "rgba(255, 255, 255, 0.70)", fontFamily: "Lato", fontSize: "24px", fontWeight: 400, lineHeight: "32px" },
            colon: { color: "rgba(255, 255, 255, 0.70)", fontFamily: "Lato", fontSize: "24px", fontWeight: 400, lineHeight: "32px" },
            counter: { display: "flex", height: "64px", width: "200px", padding: "0 16px", justifyContent: isPreview ? "flex-start" : "center", alignItems: "center", gap: "16px", borderRadius: "16px", background: isPreview ? "transparent" : "rgba(242, 244, 254, 0.12)" },
            adultsCounterText: { color: localData.adults === 0 ? "rgba(242, 244, 254, 0.12)" : "#FFFFFF", fontSize: isPreview ? "24px" : "24px", width: isPreview ? "auto" : "64px", textAlign: "center", fontFamily: 'Lato', fontWeight: 400, lineHeight: '1' },
            childrenCounterText: { color: localData.children === 0 ? "rgba(242, 244, 254, 0.12)" : "#FFFFFF", fontSize: isPreview ? "24px" : "24px", width: isPreview ? "auto" : "64px", textAlign: "center", fontFamily: 'Lato', fontWeight: 400, lineHeight: '1' },
            divider: { width: '1px', height: '24px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.16)', flexShrink: 0 },
            iconButton: { 
                cursor: "pointer", 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                width: '24px', 
                height: '24px',
                flexShrink: 0
            }
        };
    }, [localData.backgroundImage, isPreview, isHoveringBackground, localData.adults, localData.children]);

    useEffect(() => {
        setLocalData({
            backgroundImage: pageData?.backgroundImage || null,
            destinationName: pageData?.destinationName || '',
            adults: pageData?.adults || 0,
            children: pageData?.children || 0,
            tripDuration: pageData?.tripDuration || ''
        });
    }, [pageData]);

    useEffect(() => {
        fetch(company)
            .then((res) => res.blob())
            .then((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => setBase64Image(reader.result);
                reader.readAsDataURL(blob);
            });
    }, []);

    const handleDataChange = useCallback((field, value) => {
        const updatedData = { ...localData, [field]: value };
        setLocalData(updatedData);
        if (onDataUpdate) {
            onDataUpdate(updatedData);
        }
    }, [localData, onDataUpdate]);

    const handleUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("File size exceeds 10MB limit.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => handleDataChange('backgroundImage', reader.result);
        reader.readAsDataURL(file);
        e.target.value = '';
    }, [handleDataChange]);

    const triggerFileInput = useCallback(() => {
        if (!isPreview) {
            fileInputRef.current?.click();
        }
    }, [isPreview]);

    // Combined event handlers for the background area
    const handleBackgroundAreaEvents = {
        onClick: (e) => {
            // Check if the click is on the background area itself, not on child elements like the form
            if (e.target === e.currentTarget && !isPreview) {
                triggerFileInput();
            }
        },
        onMouseEnter: () => {
            if (!isPreview && localData.backgroundImage) {
                setIsHoveringBackground(true);
            }
        },
        onMouseLeave: () => {
            setIsHoveringBackground(false);
        },
    };

    // Handlers for Adults and Children counters
    const handleAdultsDecrease = useCallback(() => handleDataChange('adults', Math.max(0, localData.adults - 1)), [handleDataChange, localData.adults]);
    const handleAdultsIncrease = useCallback(() => handleDataChange('adults', localData.adults + 1), [handleDataChange, localData.adults]);
    const handleChildrenDecrease = useCallback(() => handleDataChange('children', Math.max(0, localData.children - 1)), [handleDataChange, localData.children]);
    const handleChildrenIncrease = useCallback(() => handleDataChange('children', localData.children + 1), [handleDataChange, localData.children]);

    return (
        <div style={styles.container} {...handleBackgroundAreaEvents}>
            {/* Hover text appears based on hover state */}
            <div style={styles.hoverText}>
                Click to change background image
            </div>
            
            <div style={styles.logoContainer}>
                <div style={styles.logoWrapper}>
                    {base64Image && <img src={base64Image} alt="Company Logo" style={styles.logo} />}
                </div>
            </div>

            {/* Upload prompt (only if no background image) */}
            {!localData.backgroundImage && !isPreview && (
                <div onClick={triggerFileInput} style={styles.uploadPrompt}>
                    <img src={upload} alt='upload' style={{ width: '64px', height: '64px' }} />
                    <div style={{ color: '#FFF', fontFamily: 'Lato', fontSize: '16px', fontWeight: 600 }}>Add Background Image</div>
                    <div style={{ color: 'rgba(255,255,255,0.64)', fontFamily: 'Lato', fontSize: '12px' }}>PNG, JPEG or SVG (Max. 2 MB)</div>
                </div>
            )}
            
            {/* Display for preview mode when no background is set */}
             {!localData.backgroundImage && isPreview && (
                 <div style={{ ...styles.uploadPrompt, border: 'none', cursor: 'default' }}>
                     {/* You can place a placeholder or leave it empty for preview */}
                 </div>
            )}

            {!isPreview && (
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    id={uniqueIds.fileInput}
                    style={{ display: 'none' }}
                    onChange={handleUpload}
                />
            )}

            {/* Main Form */}
            <div style={styles.mainForm}>
                {/* Destination */}
                <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}>
                    <div style={{ padding: '8px 16px' }}>
                        <div style={{ color: 'rgba(255, 255, 255, 0.70)', fontFamily: 'Lato', fontSize: '28px', lineHeight: '36px' }}>Trip to,</div>
                    </div>
                    <div style={{ padding: '8px 16px' }}>
                        {isPreview ? (
                            <div style={{ color: '#F33F3F', fontFamily: 'Lato', fontSize: '64px', fontWeight: '400', lineHeight: '80px', textTransform: 'capitalize', minHeight: '80px' }}>
                                {localData.destinationName || 'Enter Destination'}
                            </div>
                        ) : (
                            <input
                                type="text"
                                id={uniqueIds.destinationInput}
                                value={localData.destinationName}
                                onChange={(e) => handleDataChange('destinationName', e.target.value)}
                                placeholder="Enter Destination"
                                style={{ width: '100%', color: '#F33F3F', fontFamily: 'Lato', fontSize: '64px', fontWeight: '400', lineHeight: '80px', textTransform: 'capitalize', background: 'transparent', border: 'none', outline: 'none' }}
                            />
                        )}
                    </div>
                </div>

                {/* Trip Duration */}
                <div style={styles.sectionContainer}>
                    <div style={styles.labelContainer}>
                        <div style={styles.labelText}>Trip Duration</div>
                        {isPreview && <div style={styles.colon}>:</div>}
                    </div>
                    <TripDurationPicker
                        value={localData.tripDuration}
                        onChange={(val) => handleDataChange('tripDuration', val)}
                        isPreview={isPreview}
                    />
                </div>

                {/* Adults section */}
                <div style={styles.sectionContainer}>
                    <div style={styles.labelContainerTall}>
                        <div style={styles.labelText}>
                            Adults
                            <div style={{ color: "rgba(255, 255, 255, 0.50)", fontSize: "16px", lineHeight: "20px" }}>(Above 12 yrs)</div>
                        </div>
                        {isPreview && <div style={styles.colon}>:</div>}
                    </div>
                    <div style={styles.counter}>
                        {!isPreview && <div onClick={handleAdultsDecrease} style={styles.iconButton}><img src={dnd} alt="minus" width={30} height={30} /></div>}
                        {!isPreview && <div style={styles.divider} />}
                        <div style={styles.adultsCounterText}>{localData.adults}</div>
                        {!isPreview && <div style={styles.divider} />}
                        {!isPreview && <div onClick={handleAdultsIncrease} style={styles.iconButton}><img src={add} alt="plus" width={30} height={30} /></div>}
                    </div>
                </div>

                {/* Children section */}
                <div style={styles.sectionContainer}>
                    <div style={styles.labelContainerTall}>
                        <div style={styles.labelText}>
                            Children
                            <div style={{ color: "rgba(255, 255, 255, 0.50)", fontSize: "16px", lineHeight: "20px" }}>(Below 12 yrs)</div>
                        </div>
                        {isPreview && <div style={styles.colon}>:</div>}
                    </div>
                    <div style={styles.counter}>
                        {!isPreview && <div onClick={handleChildrenDecrease} style={styles.iconButton}><img src={dnd} alt="minus" width={30} height={30} /></div>}
                        {!isPreview && <div style={styles.divider} />}
                        <div style={styles.childrenCounterText}>{localData.children}</div>
                        {!isPreview && <div style={styles.divider} />}
                        {!isPreview && <div onClick={handleChildrenIncrease} style={styles.iconButton}><img src={add} alt="plus" width={30} height={30} /></div>}
                    </div>
                </div>

                {/* Note container */}
                <div style={{ padding: "16px", alignSelf: "stretch" }}>
                    <div style={{ color: "#C46E6F", fontFamily: "Lato", fontSize: "16px", lineHeight: "32px" }}>
                        Note: Children should be below 12 yrs of age on the date of travel
                    </div>
                </div>

                {/* Footer Section */}
                <div style={{ padding: "0 16px", alignSelf: "stretch" }}>
                    <div style={{ height: "1px", alignSelf: "stretch", background: "rgba(255, 255, 255, 0.12)" }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignSelf: 'stretch' }}>
                         <div style={{ color: "rgba(255, 255, 255, 0.50)", fontFamily: "Lato", fontSize: "16px", fontStyle: "italic", lineHeight: "36px" }}>
                             Prepared by, Route Your Travel on Feb 26, 2025.
                         </div>
                         <div style={{ color: "rgba(255, 255, 255, 0.50)", fontFamily: "Lato", fontSize: "16px", fontStyle: "italic", lineHeight: "36px" }}>
                             Version 1.0
                         </div>
                    </div>
                    <div style={{ color: "rgba(255, 255, 255, 0.50)", fontFamily: "Lato", fontSize: "16px", fontStyle: "italic", lineHeight: "36px" }}>
                        ** Terms and Conditions Apply
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CoverPage;
