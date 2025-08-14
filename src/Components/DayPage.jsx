import React, { useState, useEffect, useRef } from 'react';
import deleteIcon from '../assets/icons/delete.svg'
import hotel from '../assets/icons/Hotel_orange.svg'
import fork_spoon from '../assets/icons/Restaurant_orange.svg'
import table from '../assets/icons/table.svg'
import custom from '../assets/icons/custom.svg'
import flightland from '../assets/icons/flight_land.svg'
import interest from '../assets/icons/interests.svg'
import taxi from '../assets/icons/local_taxi.svg'


// Import components
import AddSectionTray from './AddSectionTray';
import ImageUpload from './ImageUpload';
import Footer from './Footer';

const ICON_OPTIONS = {
    PlaneLanding: flightland,
    Landmark: interest,
    CarFront: taxi,
    Hotel: hotel,
    Restaurant: fork_spoon,
    Table: table,
    Custom: custom
};

const SECTION_OPTIONS = [
    { value: 'PlaneLanding', label: 'Flight', heading: 'Arrival' },
    { value: 'Landmark', label: 'Activity', heading: 'Activities' },
    { value: 'CarFront', label: 'Car', heading: 'Transfer' },
    { value: 'Restaurant', label: 'Restaurant', heading: 'Dining' },
    { value: 'Hotel', label: 'Hotel', heading: 'Hotel' },
    { value: 'Custom', label: 'Custom', heading: 'Custom' }
];

function DayPage({ pageId, pageNumber, pageData, isPreview = false, onDataUpdate, dayNumber }) {
    // Initialize local state from pageData
    const [localData, setLocalData] = useState({
        destination: '',
        arrivalDetails: [''], // Array of sub-fields
        transferDetails: [''], // Array of sub-fields
        dropDetails: [''], // Array of sub-fields
        activityDetails: [''], // Single field by default for activities
        uploadedImage: null,
        mealSelections: {
            breakfast: false,
            lunch: false,
            dinner: false
        },
        icons: {
            arrival: 'PlaneLanding',
            transfer: 'CarFront',
            drop: 'CarFront',
            activity: 'Landmark',
        },
        sectionHeadings: {
            arrival: 'Arrival',
            transfer: 'Transfer',
            activity: 'Activities',
            drop: 'Drop',
        },
        dynamicSections: [],
        // Track which sections are visible
        visibleSections: {
            arrival: true,
            transfer: true,
            activity: true,
            drop: true
        }
    });

    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const [hoveredSection, setHoveredSection] = useState(null);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    // Generate unique IDs based on pageId
    const getUniqueId = (fieldName, index = null) => {
        const baseId = `page_${pageId}_${fieldName}`;
        return index !== null ? `${baseId}_${index}` : baseId;
    };

    // Sync local state with incoming pageData when it changes
    useEffect(() => {
        if (pageData) {
            // Helper function to ensure data is in array format
            const ensureArray = (data) => {
                if (!data) return [''];
                if (Array.isArray(data)) return data.length > 0 ? data : [''];
                if (typeof data === 'string') return data ? [data] : [''];
                return [''];
            };

            // Special handling for activities - only single field if it's empty or first load
            const ensureActivityArray = (data) => {
                if (!data) return [''];
                if (Array.isArray(data)) {
                    // If all fields are empty, show only one
                    const nonEmptyFields = data.filter(item => item && item.trim());
                    if (nonEmptyFields.length === 0) return [''];
                    return data.length > 0 ? data : [''];
                }
                if (typeof data === 'string') return data ? [data] : [''];
                return [''];
            };

            setLocalData({
                destination: pageData.destination || '',
                arrivalDetails: ensureArray(pageData.arrivalDetails),
                transferDetails: ensureArray(pageData.transferDetails),
                dropDetails: ensureArray(pageData.dropDetails),
                activityDetails: ensureActivityArray(pageData.activityDetails), // Special handling
                uploadedImage: pageData.uploadedImage || null,
                mealSelections: pageData.mealSelections || {
                    breakfast: false,
                    lunch: false,
                    dinner: false
                },
                icons: pageData.icons || {
                    arrival: 'PlaneLanding',
                    transfer: 'CarFront',
                    drop: 'CarFront',
                    activity: 'Landmark',
                },
                sectionHeadings: pageData.sectionHeadings || {
                    arrival: 'Arrival',
                    transfer: 'Transfer',
                    activity: 'Activities',
                    drop: 'Drop',
                },
                dynamicSections: (pageData.dynamicSections || []).map(section => ({
                    ...section,
                    details: Array.isArray(section.details) ? section.details : [section.details || '']
                })),
                visibleSections: pageData.visibleSections || {
                    arrival: true,
                    transfer: true,
                    activity: true,
                    drop: true
                }
            });
        }
    }, [pageData]);

    useEffect(() => {
        // Force re-render when dayNumber changes
        // This ensures the component updates when pages are reordered
    }, [dayNumber]);

    // Helper to update data and notify parent
    const updateParent = (updatedFields) => {
        const updatedData = { ...localData, ...updatedFields };
        setLocalData(updatedData);
        if (onDataUpdate) onDataUpdate(updatedData);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownIndex(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper function to calculate total content fields for responsive image height
    const getTotalContentHeight = () => {
        let totalFields = 0;
        if (localData.visibleSections.arrival) totalFields += localData.arrivalDetails.length;
        if (localData.visibleSections.transfer) totalFields += localData.transferDetails.length;
        if (localData.visibleSections.activity) totalFields += localData.activityDetails.length;
        if (localData.visibleSections.drop) totalFields += localData.dropDetails.length;
        localData.dynamicSections.forEach(section => {
            totalFields += Array.isArray(section.details) ? section.details.length : 1;
        });
        const visibleMainSections = Object.values(localData.visibleSections).filter(Boolean).length;
        const totalSections = visibleMainSections + localData.dynamicSections.length;
        const baseFields = totalSections; // One field per section as baseline
        // Each additional field beyond the base reduces height by 20px
        const extraFields = Math.max(0, totalFields - baseFields);
        // Each additional section beyond 4 also reduces height by 30px
        const extraSections = Math.max(0, totalSections - 4);
        const sectionReduction = extraSections * 30;
        return extraFields * 20 + sectionReduction;
    };

    // Helper function to check if any section has 3+ subfields (restricts further content)
    const hasRestrictiveSubfields = () => {
        if (localData.arrivalDetails.length >= 3) return true;
        if (localData.transferDetails.length >= 3) return true;
        if (localData.activityDetails.length >= 3) return true;
        if (localData.dropDetails.length >= 3) return true;
        return localData.dynamicSections.some(section => 
            Array.isArray(section.details) ? section.details.length >= 3 : false
        );
    };

    // Helper function to check if any section has 5 subfields (maximum allowed)
    const hasMaxSubfields = () => {
        if (localData.arrivalDetails.length >= 5) return true;
        if (localData.transferDetails.length >= 5) return true;
        if (localData.activityDetails.length >= 5) return true;
        if (localData.dropDetails.length >= 5) return true;
        return localData.dynamicSections.some(section => 
            Array.isArray(section.details) ? section.details.length >= 5 : false
        );
    };

    // Helper function to check if current section can add more fields
    const canSectionAddField = (sectionKey, sectionId = null) => {
        const currentSectionLength = sectionId 
            ? localData.dynamicSections.find(s => s.id === sectionId)?.details?.length || 0
            : localData[`${sectionKey}Details`]?.length || 0;
        // Allow each section up to 5 fields maximum
        return currentSectionLength < 5 && getTotalFields() < 20;
    };

// Helper function to calculate total number of fields (subsections) across all sections
const getTotalFields = () => {
    let total = 0;
    if (localData.visibleSections.arrival) total += localData.arrivalDetails.length;
    if (localData.visibleSections.transfer) total += localData.transferDetails.length;
    if (localData.visibleSections.activity) total += localData.activityDetails.length;
    if (localData.visibleSections.drop) total += localData.dropDetails.length;
    localData.dynamicSections.forEach(section => {
        total += Array.isArray(section.details) ? section.details.length : 1;
    });
    return total;
};

// Helper function to calculate approximate content height
const calculateContentHeight = () => {
    // ...existing code...
    const responsiveReduction = getTotalContentHeight();
    const imageHeight = Math.max(284, 584 - responsiveReduction);
    const titleSectionHeight = 160;
    const sectionBaseHeight = 60;
    const fieldHeight = 32;

    let totalFieldHeight = 0;
    totalFieldHeight += localData.arrivalDetails.length * fieldHeight;
    totalFieldHeight += localData.transferDetails.length * fieldHeight;
    totalFieldHeight += localData.activityDetails.length * fieldHeight;
    totalFieldHeight += localData.dropDetails.length * fieldHeight;

    let dynamicSectionHeight = 0;
    localData.dynamicSections.forEach(section => {
        dynamicSectionHeight += sectionBaseHeight;
        dynamicSectionHeight += (Array.isArray(section.details) ? section.details.length : 1) * fieldHeight;
    });

    const spacing = localData.dynamicSections.length * 12;
    const padding = 24; // Further reduced for less gap

    return imageHeight + titleSectionHeight + (4 * sectionBaseHeight) + totalFieldHeight + dynamicSectionHeight + spacing + padding;
};

// Helper to count total number of sections (main + dynamic, visible only)
const getTotalSections = () => {
    let count = 0;
    if (localData.visibleSections.arrival) count++;
    if (localData.visibleSections.transfer) count++;
    if (localData.visibleSections.activity) count++;
    if (localData.visibleSections.drop) count++;
    count += localData.dynamicSections.length;
    return count;
};

const canAddMoreContent = () => {
    const maxAllowedHeight = 1480; // Allow more content before hitting the footer
    const currentHeight = calculateContentHeight();
    const minimumGapFromFooter = 24; // Match the new padding
    const estimatedNewContentHeight = 36; // Slightly less for more flexibility
    const totalHeightWithNewContent = currentHeight + estimatedNewContentHeight;
    // Enforce both field and section limits
    return (
        totalHeightWithNewContent <= (maxAllowedHeight - minimumGapFromFooter)
        && getTotalFields() < 20
        && getTotalSections() < 5
    );
};

    // Handle sub-field changes
    const handleSubFieldChange = (sectionKey, index, value) => {
        const fieldName = `${sectionKey}Details`;
        const newSubFields = [...localData[fieldName]];
        newSubFields[index] = value;
        updateParent({ [fieldName]: newSubFields });
    };

    // Handle Enter key press for general sections (not activities)
    const handleSubFieldKeyPress = (e, sectionKey, index) => {
        const fieldName = `${sectionKey}Details`;
        const currentValue = localData[fieldName][index];
        if (e.key === 'Enter') {
            e.preventDefault();
            // Always add a new subfield below if current field is not empty and limits are not exceeded
            const canAddToThisSection = canSectionAddField(sectionKey);
            const hasSpace = canAddMoreContent();
            if (currentValue && currentValue.trim() && canAddToThisSection && hasSpace) {
                const newSubFields = [...localData[fieldName]];
                newSubFields.splice(index + 1, 0, '');
                updateParent({ [fieldName]: newSubFields });
                setTimeout(() => {
                    const newFieldId = getUniqueId(`${sectionKey}_details`, index + 1);
                    const newField = document.getElementById(newFieldId);
                    if (newField) newField.focus();
                }, 0);
            }
        } else if (e.key === 'Backspace') {
            // Remove empty field if backspace is pressed and it's not the only field
            if (!currentValue && localData[fieldName].length > 1) {
                e.preventDefault();
                const newSubFields = [...localData[fieldName]];
                newSubFields.splice(index, 1);
                updateParent({ [fieldName]: newSubFields });
                setTimeout(() => {
                    const prevIndex = index > 0 ? index - 1 : 0;
                    const prevFieldId = getUniqueId(`${sectionKey}_details`, prevIndex);
                    const prevField = document.getElementById(prevFieldId);
                    if (prevField) prevField.focus();
                }, 0);
            }
        }
    };

    // Special handler for activities section
    const handleActivityKeyPress = (e, index) => {
        const currentValue = localData.activityDetails[index];
        if (e.key === 'Enter') {
            e.preventDefault();
            // Always add a new subfield below if current field is not empty and limits are not exceeded
            const canAddToThisSection = canSectionAddField('activity');
            const hasSpace = canAddMoreContent();
            if (currentValue && currentValue.trim() && canAddToThisSection && hasSpace) {
                const newActivityDetails = [...localData.activityDetails];
                newActivityDetails.splice(index + 1, 0, '');
                updateParent({ activityDetails: newActivityDetails });
                setTimeout(() => {
                    const newFieldId = getUniqueId('activity_details', index + 1);
                    const newField = document.getElementById(newFieldId);
                    if (newField) newField.focus();
                }, 0);
            }
        } else if (e.key === 'Backspace') {
            if (!currentValue && localData.activityDetails.length > 1) {
                e.preventDefault();
                const newActivityDetails = [...localData.activityDetails];
                newActivityDetails.splice(index, 1);
                updateParent({ activityDetails: newActivityDetails });
                setTimeout(() => {
                    const prevIndex = index > 0 ? index - 1 : 0;
                    const prevFieldId = getUniqueId('activity_details', prevIndex);
                    const prevField = document.getElementById(prevFieldId);
                    if (prevField) prevField.focus();
                }, 0);
            }
        }
    };

    // Handle meal toggle
    const handleMealToggle = (meal) => {
        const updatedMeals = {
            ...localData.mealSelections,
            [meal]: !localData.mealSelections[meal]
        };
        updateParent({ mealSelections: updatedMeals });
    };

    const handleSectionHeadingChange = (key, value) => {
        const updatedHeadings = {
            ...localData.sectionHeadings,
            [key]: value
        };
        updateParent({ sectionHeadings: updatedHeadings });
    };

    const handleDynamicSectionChange = (sectionId, field, value, index = null) => {
        const updatedSections = localData.dynamicSections.map(section => {
            if (section.id === sectionId) {
                if (field === 'details' && index !== null) {
                    // Handle array details
                    const newDetails = [...section.details];
                    newDetails[index] = value;
                    return { ...section, details: newDetails };
                } else {
                    // Handle other fields like heading
                    return { ...section, [field]: value };
                }
            }
            return section;
        });
        updateParent({ dynamicSections: updatedSections });
    };

    // Handle Enter key press for dynamic sections
    const handleDynamicSectionKeyPress = (e, sectionId, index) => {
        const section = localData.dynamicSections.find(s => s.id === sectionId);
        const currentValue = section.details[index];
        if (e.key === 'Enter') {
            e.preventDefault();
            // Always add a new subfield below if current field is not empty and limits are not exceeded
            const canAddToThisSection = canSectionAddField(null, sectionId);
            const hasSpace = canAddMoreContent();
            if (currentValue && currentValue.trim() && canAddToThisSection && hasSpace) {
                const updatedSections = localData.dynamicSections.map(sec =>
                    sec.id === sectionId
                        ? { ...sec, details: [...sec.details.slice(0, index + 1), '', ...sec.details.slice(index + 1)] }
                        : sec
                );
                updateParent({ dynamicSections: updatedSections });
                setTimeout(() => {
                    const newFieldId = getUniqueId('dynamic_section_details', `${sectionId}_${index + 1}`);
                    const newField = document.getElementById(newFieldId);
                    if (newField) newField.focus();
                }, 0);
            }
        } else if (e.key === 'Backspace') {
            if (!currentValue && section.details.length > 1) {
                e.preventDefault();
                const updatedSections = localData.dynamicSections.map(sec =>
                    sec.id === sectionId
                        ? { ...sec, details: sec.details.filter((_, i) => i !== index) }
                        : sec
                );
                updateParent({ dynamicSections: updatedSections });
                setTimeout(() => {
                    const prevIndex = index > 0 ? index - 1 : 0;
                    const prevFieldId = getUniqueId('dynamic_section_details', `${sectionId}_${prevIndex}`);
                    const prevField = document.getElementById(prevFieldId);
                    if (prevField) prevField.focus();
                }, 0);
            }
        }
    };

    const handleAddSection = (newSection) => {
        // Enforce a maximum of 5 total sections (main + dynamic)
        if (getTotalSections() >= 5) {
            console.log('Section limit reached');
            return;
        }
        // Enforce a maximum of 20 total fields
        if (getTotalFields() >= 20) {
            console.log('Field limit reached');
            return;
        }
        const hasSpace = canAddMoreContent();
        if (!hasSpace) {
            console.log('No space available');
            return;
        }
        // Ensure details is an array with exactly one field
        const sectionWithArrayDetails = {
            ...newSection,
            details: [''] // Always start with a single empty field
        };
        const updatedSections = [...localData.dynamicSections, sectionWithArrayDetails];
        updateParent({ dynamicSections: updatedSections });
    };

    const removeSection = (sectionId) => {
        const updatedSections = localData.dynamicSections.filter(section => section.id !== sectionId);
        updateParent({ dynamicSections: updatedSections });
    };

    // Function to handle deleting main sections
    const handleDeleteMainSection = (sectionKey) => {
        const updatedVisibleSections = {
            ...localData.visibleSections,
            [sectionKey]: false
        };

        // Also clear the data for the deleted section
        const clearedData = {};
        const fieldName = `${sectionKey}Details`;
        clearedData[fieldName] = [''];

        updateParent({
            visibleSections: updatedVisibleSections,
            ...clearedData
        });
    };

    const handleImageUpload = (file, imageUrl) => {
        updateParent({ uploadedImage: imageUrl });
        console.log('Image uploaded:', file);
    };

    const handleIconChange = (key, iconValue, heading) => {
        const updatedIcons = { ...localData.icons, [key]: iconValue };
        const updatedHeadings = { ...localData.sectionHeadings, [key]: heading };
        updateParent({
            icons: updatedIcons,
            sectionHeadings: updatedHeadings
        });
        setOpenDropdownIndex(null);
    };

    // Handle icon change for dynamic sections
    const handleDynamicIconChange = (sectionId, iconValue, heading) => {
        const updatedSections = localData.dynamicSections.map(section =>
            section.id === sectionId
                ? { ...section, icon: iconValue, heading: heading }
                : section
        );
        updateParent({ dynamicSections: updatedSections });
        setOpenDropdownIndex(null);
    };

    const renderDropdown = (key, index, isDynamic = false, sectionId = null) => {
        if (isPreview) return null;

        return openDropdownIndex === index ? (
            <div ref={dropdownRef} style={{ position: 'absolute', top: '40px', left: '0', zIndex: 100, backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', width: '180px', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }} onDragStart={e => e.preventDefault()}>
                {SECTION_OPTIONS.map((opt) => (
                    <div 
                        key={opt.value} 
                        onClick={() => {
                            if (isDynamic && sectionId) {
                                handleDynamicIconChange(sectionId, opt.value, opt.heading);
                            } else {
                                handleIconChange(key, opt.value, opt.heading);
                            }
                        }} 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }} 
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'} 
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'} 
                        onDragStart={e => e.preventDefault()}
                    >
                        <img src={ICON_OPTIONS[opt.value]} alt={opt.label} width={16} height={16} draggable={false} onDragStart={e => e.preventDefault()} style={{ userSelect: 'none', pointerEvents: 'none' }} />
                        <span style={{ fontFamily: 'Lato', fontSize: '14px', color: '#333', userSelect: 'none' }}>{opt.label}</span>
                    </div>
                ))}
            </div>
        ) : null;
    };

  // Replace the renderMainSection function with this updated version:

const renderDynamicSection = (section, index) => {
    // Calculate a unique dropdown index for dynamic sections
    const dynamicDropdownIndex = `dynamic_${section.id}`;
    const sectionHoverId = `dynamic_${section.id}`;
    
    return (
        <div
            key={section.id}
            style={{ display: 'flex', width: '928px', padding: '4px', alignItems: 'flex-start', position: 'relative' }}
            onMouseEnter={() => setHoveredSection(sectionHoverId)}
            onMouseLeave={() => setHoveredSection(null)}
        >
            <div 
                style={{ 
                    display: 'flex', 
                    padding: '8px', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '8px', 
                    borderRadius: '28px', 
                    background: 'rgba(243, 63, 63, 0.06)', 
                    position: 'relative',
                    cursor: isPreview ? 'default' : 'pointer',
                    userSelect: 'none', 
                    WebkitUserSelect: 'none', 
                    MozUserSelect: 'none', 
                    msUserSelect: 'none' 
                }} 
                onClick={!isPreview ? () => setOpenDropdownIndex(openDropdownIndex === dynamicDropdownIndex ? null : dynamicDropdownIndex) : undefined} 
                onDragStart={e => e.preventDefault()}
            >
                <div style={{ width: '20px', height: '20px', aspectRatio: '1 / 1', userSelect: 'none' }}>
                    <img src={ICON_OPTIONS[section.icon]} alt={section.type} draggable={false} onDragStart={e => e.preventDefault()} style={{ userSelect: 'none', pointerEvents: 'none' }} />
                </div>
                {renderDropdown(null, dynamicDropdownIndex, true, section.id)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', flex: '1 0 0' }}>
                <div style={{ display: 'flex', padding: '0 0 4px 16px', alignItems: 'center', alignSelf: 'stretch' }}>
                    {isPreview ? (
                        <div style={{ color: 'rgba(14, 19, 40, 0.64)', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 500, lineHeight: '32px', textTransform: 'uppercase', flex: '1 0 0' }}>
                            {section.heading}
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={section.heading}
                            id={getUniqueId('dynamic_section_heading', section.id)}
                            name={getUniqueId('dynamic_section_heading', section.id)}
                            onChange={(e) => handleDynamicSectionChange(section.id, 'heading', e.target.value)}
                            style={{ color: 'rgba(14, 19, 40, 0.64)', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 500, lineHeight: '32px', textTransform: 'uppercase', flex: '1 0 0', border: 'none', outline: 'none', background: 'transparent', minWidth: '0' }}
                        />
                    )}
                    
                    {!isPreview && hoveredSection === sectionHoverId && (
                        <>
                            {/* Divider */}
                            <div style={{ 
                                width: '1px', 
                                height: '16px', 
                                backgroundColor: 'rgba(14, 19, 40, 0.2)', 
                                marginLeft: '8px', 
                                marginRight: '8px' 
                            }} />
                            {/* Delete button */}
                            <div 
                                onClick={() => removeSection(section.id)}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    gap: '4px'
                                }}
                                onDragStart={e => e.preventDefault()}
                            >
                                <span style={{ 
                                    color: '#F33F3F', 
                                    fontFamily: 'Lato', 
                                    fontSize: '16px', 
                                    fontWeight: 600, 
                                    userSelect: 'none' 
                                }}>
                                    Delete
                                </span>
                                <img 
                                    src={deleteIcon} 
                                    alt="remove" 
                                    width={20} 
                                    height={20} 
                                    draggable={false} 
                                    onDragStart={e => e.preventDefault()} 
                                    style={{ userSelect: 'none', pointerEvents: 'none' }} 
                                />
                            </div>
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', padding: '0px 0px 0px 16px', alignItems: 'flex-start', flexDirection: 'column', alignSelf: 'stretch' }}>
                    {Array.isArray(section.details) ? (
                        section.details.map((detail, detailIndex) => (
                            isPreview ? (
                                detail ? (
                                    <div key={detailIndex} style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', marginBottom: detailIndex < section.details.length - 1 ? '0px' : '0px', color: '#0E1328', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', flex: '1 0 0' }}>
                                        {detail}
                                    </div>
                                ) : null
                            ) : (
                                <div key={detailIndex} style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', marginBottom: detailIndex < section.details.length - 1 ? '0px' : '0px' }}>
                                    <input
                                        type="text"
                                        value={detail}
                                        id={getUniqueId('dynamic_section_details', `${section.id}_${detailIndex}`)}
                                        name={getUniqueId('dynamic_section_details', `${section.id}_${detailIndex}`)}
                                        onChange={(e) => handleDynamicSectionChange(section.id, 'details', e.target.value, detailIndex)}
                                        onKeyDown={(e) => handleDynamicSectionKeyPress(e, section.id, detailIndex)}
                                        placeholder={`Enter ${section.heading.toLowerCase()} details`}
                                        style={{ color: detail ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', width: '820px', border: 'none', outline: 'none', background: 'transparent' }}
                                    />
                                </div>
                            )
                        ))
                    ) : (
                        // Fallback for old format - single detail field
                        isPreview ? (
                            section.details ? (
                                <div style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', flex: '1 0 0' }}>
                                    {section.details}
                                </div>
                            ) : null
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch' }}>
                                <input
                                    type="text"
                                    value={section.details}
                                    id={getUniqueId('dynamic_section_details', section.id)}
                                    name={getUniqueId('dynamic_section_details', section.id)}
                                    onChange={(e) => handleDynamicSectionChange(section.id, 'details', e.target.value)}
                                    onKeyDown={(e) => handleDynamicSectionKeyPress(e, section.id, 0)}
                                    placeholder={`Enter ${section.heading.toLowerCase()} details`}
                                    style={{ color: section.details ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', width: '820px', border: 'none', outline: 'none', background: 'transparent' }}
                                />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
// Also update the renderDynamicSection function:
const renderMainSection = (sectionKey, dropdownIndex, sectionData) => {
    if (!localData.visibleSections[sectionKey]) {
        return null; // Don't show deleted sections
    }

    const sectionHoverId = `main_${sectionKey}`;

    // Render the section normally
    return (
        <div
            style={{ display: 'flex', width: '928px', padding: '4px', alignItems: 'flex-start', position: 'relative' }}
            onMouseEnter={() => setHoveredSection(sectionHoverId)}
            onMouseLeave={() => setHoveredSection(null)}
        >
            <div style={{ display: 'inline-flex', padding: '8px', justifyContent: 'center', alignItems: 'center', gap: '8px', borderRadius: '28px', background: 'rgba(243, 63, 63, 0.06)', position: 'relative', cursor: isPreview ? 'default' : 'pointer', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }} onClick={!isPreview ? () => setOpenDropdownIndex(openDropdownIndex === dropdownIndex ? null : dropdownIndex) : undefined} onDragStart={e => e.preventDefault()}>
                <div style={{ width: '20px', height: '20px', aspectRatio: '1 / 1', userSelect: 'none' }}>
                    <img src={ICON_OPTIONS[localData.icons[sectionKey]]} alt={sectionKey} draggable={false} onDragStart={e => e.preventDefault()} style={{ userSelect: 'none', pointerEvents: 'none' }} />
                </div>
                {renderDropdown(sectionKey, dropdownIndex)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', flex: '1 0 0' }}>
                <div style={{ display: 'flex', padding: '0 0 4px 16px', alignItems: 'center', alignSelf: 'stretch' }}>
                    {isPreview ? (
                        <div style={{ color: 'rgba(14, 19, 40, 0.64)', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 500, lineHeight: '32px', textTransform: 'uppercase', flex: '1 0 0' }}>
                            {localData.sectionHeadings[sectionKey]}
                        </div>
                    ) : (
                        <input
                            type="text"
                            id={getUniqueId(`${sectionKey}_heading`)}
                            name={getUniqueId(`${sectionKey}_heading`)}
                            value={localData.sectionHeadings[sectionKey]}
                            onChange={(e) => handleSectionHeadingChange(sectionKey, e.target.value)}
                            style={{ color: 'rgba(14, 19, 40, 0.64)', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 500, lineHeight: '32px', textTransform: 'uppercase', flex: '1 0 0', border: 'none', outline: 'none', background: 'transparent', minWidth: '0' }}
                        />
                    )}
                    
                    {!isPreview && hoveredSection === sectionHoverId && (
                        <>
                            {/* Divider */}
                            <div style={{ 
                                width: '1px', 
                                height: '16px', 
                                backgroundColor: 'rgba(14, 19, 40, 0.2)', 
                                marginLeft: '8px', 
                                marginRight: '8px' 
                            }} />
                            {/* Delete button */}
                            <div 
                                onClick={() => handleDeleteMainSection(sectionKey)}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    gap: '4px'
                                }}
                                onDragStart={e => e.preventDefault()}
                            >
                                <span style={{ 
                                    color: '#F33F3F', 
                                    fontFamily: 'Lato', 
                                    fontSize: '16px', 
                                    fontWeight: 600, 
                                    userSelect: 'none' 
                                }}>
                                    Delete
                                </span>
                                <img 
                                    src={deleteIcon} 
                                    alt="remove" 
                                    width={20} 
                                    height={20} 
                                    draggable={false} 
                                    onDragStart={e => e.preventDefault()} 
                                    style={{ userSelect: 'none', pointerEvents: 'none' }} 
                                />
                            </div>
                        </>
                    )}
                </div>

                {sectionData}
            </div>
        </div>
    );
};

    return (
        <div style={{ display: 'flex', width: '1088px', height: '1540px', flexDirection: 'column', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
            {/* Hidden file input for both initial upload and changing image */}
            {!isPreview && (
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={e => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                            alert("File size exceeds 2MB limit.");
                            return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                            handleImageUpload(file, reader.result);
                        };
                        reader.readAsDataURL(file);
                    }}
                />
            )}
            {/* Main Content Area */}
            <div style={{ display: 'flex', width: '100%', padding: '0 64px', flexDirection: 'column', alignItems: 'center', gap: '32px', flex: 1, paddingBottom: '0px' }}>
                {/* Image Upload Component - Dynamic height based on all content */}
                {localData.uploadedImage ? (
                    <div style={{
                        display: 'flex',
                        width: '1088px',
                        height: `${Math.max(284, 584 - getTotalContentHeight())}px`, // Responsive to all content
                        minHeight: '284px', // Minimum height
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: isPreview ? 'default' : 'pointer',
                        marginLeft: '-64px',
                        marginRight: '-64px',
                    }}
                        onClick={!isPreview ? () => fileInputRef.current?.click() : undefined}
                    >
                        <img
                            src={localData.uploadedImage}
                            alt="Day"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>
                ) : (
                    !isPreview && (
                        <div style={{
                            width: '1088px',
                            marginLeft: '-64px',
                            marginRight: '-64px',
                        }}>
                            <ImageUpload 
                                heightReduction={getTotalContentHeight()}
                                onImageUpload={handleImageUpload} 
                                existingImage={localData.uploadedImage} 
                            />
                        </div>
                    )
                )}

                {/* Show placeholder in preview mode when no image */}
                {!localData.uploadedImage && isPreview && (
                    <div style={{
                        display: 'flex',
                        width: '1088px',
                        height: `${Math.max(284, 584 - getTotalContentHeight())}px`, // Responsive to all content
                        minHeight: '284px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexShrink: 0,
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 24.03%, rgba(243, 63, 63, 0.06) 100%)',
                        borderRadius: '32px 32px 0 0',
                        marginLeft: '-64px',
                        marginRight: '-64px',
                        border: '2px dashed rgba(243, 63, 63, 0.3)',
                    }}>
                        <div style={{
                            color: 'rgba(14, 19, 40, 0.5)',
                            fontFamily: 'Lato',
                            fontSize: '16px',
                            fontWeight: 600,
                        }}>
                            No image uploaded
                        </div>
                    </div>
                )}

                {/* Title Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', alignSelf: 'stretch' }}>
                    <div style={{ display: 'flex', padding: '8px 16px', alignItems: 'center', alignSelf: 'stretch', borderRadius: '16px' }}>
                        <div style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '24px', fontStyle: 'normal', fontWeight: 500, lineHeight: '36px' }}>
                            DAY {dayNumber || 1}
                        </div>
                    </div>

                    <div style={{ display: 'flex', width: '960px', padding: '8px 16px', alignItems: 'center', borderRadius: '16px' }}>
                        {isPreview ? (
                            <div style={{ color: localData.destination ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: '36px', fontStyle: 'normal', fontWeight: 400, lineHeight: '56px', textTransform: 'capitalize', width: '920px', flexShrink: 0 }}>
                                {localData.destination || 'Enter Destination'}
                            </div>
                        ) : (
                            <input
                                type="text"
                                value={localData.destination}
                                id={getUniqueId('destination')}
                                name={getUniqueId('destination')}
                                onChange={(e) => updateParent({ destination: e.target.value })}
                                placeholder="Enter Destination"
                                style={{ color: localData.destination ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: '36px', fontStyle: 'normal', fontWeight: 400, lineHeight: '56px', textTransform: 'capitalize', width: '920px', flexShrink: 0, border: 'none', outline: 'none', background: 'transparent' }}
                            />
                        )}
                    </div>

                    {/* Meal Options */}
                    <div style={{ display: 'flex', padding: '8px 16px', alignItems: 'center', gap: '12px', alignSelf: 'stretch', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            {['breakfast', 'lunch', 'dinner']
                                .filter(meal => {
                                    return isPreview ? localData.mealSelections[meal] : true;
                                })
                                .map((meal) => {
                                    const selected = localData.mealSelections[meal];
                                    return (
                                        <div
                                            key={meal}
                                            onClick={!isPreview ? () => handleMealToggle(meal) : undefined}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '8px 16px',
                                                borderRadius: '999px',
                                                gap: '8px',
                                                backgroundColor: '#F4F4F6', // Always light grey
                                                border: '1px solid transparent',
                                                cursor: isPreview ? 'default' : 'pointer',
                                                boxShadow: (selected && !isPreview) ? '0 0 0 1px rgba(0,0,0,0.04)' : 'none',
                                                userSelect: 'none',
                                                WebkitUserSelect: 'none',
                                                MozUserSelect: 'none',
                                                msUserSelect: 'none'
                                            }}
                                            onDragStart={e => e.preventDefault()}
                                        >
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: selected ? 'none' : '2px solid #A3A3A3', backgroundColor: selected ? '#0E1328' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
                                                {selected && (
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M3 6.2L5 8.2L9 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span style={{ fontFamily: 'Lato', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', color: selected ? '#0E1328' : '#A3A3A3', userSelect: 'none' }}>
                                                {meal}
                                            </span>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Main Content Frame - Reduced gap for better spacing */}
                <div style={{ display: 'flex', padding: '0 16px', flexDirection: 'column', alignItems: 'flex-start', gap: '16px', alignSelf: 'stretch', marginBottom: '0px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', alignSelf: 'stretch' }}>

                        {/* Arrival Section */}
                        {renderMainSection('arrival', 0, (
                            <div>
                                {localData.arrivalDetails.map((detail, index) => (
                                    <div key={index} style={{ display: 'flex', padding: '0px 0px 0px 16px', alignItems: 'center', alignSelf: 'stretch' }}>
                                    {isPreview ? (
                                        detail ? (
                                            <div style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', flex: '1 0 0' }}>
                                                {detail}
                                            </div>
                                        ) : null
                                    ) : (
                                            <input
                                                type="text"
                                                id={getUniqueId('arrival_details', index)}
                                                name={getUniqueId('arrival_details', index)}
                                                value={detail}
                                                onChange={(e) => handleSubFieldChange('arrival', index, e.target.value)}
                                                onKeyDown={(e) => handleSubFieldKeyPress(e, 'arrival', index)}
                                                placeholder="Enter the arrival details"
                                                style={{ color: detail ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', width: '820px', border: 'none', outline: 'none', background: 'transparent' }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Transfer Section */}
                        {renderMainSection('transfer', 1, (
                            <div>
                                {localData.transferDetails.map((detail, index) => (
                                    <div key={index} style={{ display: 'flex', padding: '0px 0px 0px 16px', alignItems: 'center', alignSelf: 'stretch' }}>
                                    {isPreview ? (
                                        detail ? (
                                            <div style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', flex: '1 0 0' }}>
                                                {detail}
                                            </div>
                                        ) : null
                                    ) : (
                                            <input
                                                type="text"
                                                id={getUniqueId('transfer_details', index)}
                                                name={getUniqueId('transfer_details', index)}
                                                value={detail}
                                                onChange={(e) => handleSubFieldChange('transfer', index, e.target.value)}
                                                onKeyDown={(e) => handleSubFieldKeyPress(e, 'transfer', index)}
                                                placeholder="Enter the transfer details"
                                                style={{ color: detail ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', width: '820px', border: 'none', outline: 'none', background: 'transparent' }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Activities Section - Special handling */}
                        {renderMainSection('activity', 2, (
                            <div>
                                {localData.activityDetails.map((detail, index) => (
                                    <div key={index} style={{ display: 'flex', padding: '0px 0px 0px 16px', alignItems: 'center', alignSelf: 'stretch' }}>
                                    {isPreview ? (
                                        detail ? (
                                            <div style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', flex: '1 0 0' }}>
                                                {detail}
                                            </div>
                                        ) : null
                                    ) : (
                                            <input
                                                type="text"
                                                id={getUniqueId('activity_details', index)}
                                                name={getUniqueId('activity_details', index)}
                                                value={detail}
                                                onChange={(e) => handleSubFieldChange('activity', index, e.target.value)}
                                                onKeyDown={(e) => handleActivityKeyPress(e, index)} // Special handler for activities
                                                placeholder="Enter the activity details"
                                                style={{ color: detail ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', width: '820px', border: 'none', outline: 'none', background: 'transparent' }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Drop Section */}
                        {renderMainSection('drop', 3, (
                            <div>
                                {localData.dropDetails.map((detail, index) => (
                                    <div key={index} style={{ display: 'flex', padding: '0px 0px 0px 16px', alignItems: 'center', alignSelf: 'stretch' }}>
                                    {isPreview ? (
                                        detail ? (
                                            <div style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', flex: '1 0 0' }}>
                                                {detail}
                                            </div>
                                        ) : null
                                    ) : (
                                            <input
                                                type="text"
                                                id={getUniqueId('drop_details', index)}
                                                name={getUniqueId('drop_details', index)}
                                                value={detail}
                                                onChange={(e) => handleSubFieldChange('drop', index, e.target.value)}
                                                onKeyDown={(e) => handleSubFieldKeyPress(e, 'drop', index)}
                                                placeholder="Enter the drop details"
                                                style={{ color: detail ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', width: '820px', border: 'none', outline: 'none', background: 'transparent' }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* Render Dynamic Sections */}
                        {localData.dynamicSections.map((section, index) => renderDynamicSection(section, index))}
                    </div>

                    {/* Use the AddSectionTray component - Allow up to 5 total sections (main + dynamic) and 20 fields */}
                    {!isPreview && getTotalSections() < 5 && getTotalFields() < 20 && <AddSectionTray onAddSection={handleAddSection} />}
                </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <Footer pageNumber={pageNumber} />
            </div>
        </div>
    );
}

export default DayPage;