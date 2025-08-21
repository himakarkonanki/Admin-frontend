import React, { useState, useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';
import Editor from './Editor';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import deleteIcon from '../assets/icons/delete.svg'
import closeIcon from '../assets/icons/close.svg';
import hotel from '../assets/icons/Hotel_orange.svg'
import fork_spoon from '../assets/icons/Restaurant_orange.svg'
import table from '../assets/icons/table.svg'
import custom from '../assets/icons/custom.svg'
import flightland from '../assets/icons/flight_land.svg'
import interest from '../assets/icons/interests.svg'
import taxi from '../assets/icons/local_taxi.svg'
import drag from '../assets/icons/drag_indicator_2.svg';
import copy from '../assets/icons/content_copy.svg';
import close from '../assets/icons/close.svg';


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
    Custom: custom,
};

const SECTION_OPTIONS = [
    { value: 'PlaneLanding', label: 'Flight', heading: 'Arrival' },
    { value: 'Landmark', label: 'Activity', heading: 'Activities' },
    { value: 'CarFront', label: 'Car', heading: 'Transfer' },
    { value: 'Restaurant', label: 'Restaurant', heading: 'Dining' },
    { value: 'Hotel', label: 'Hotel', heading: 'Hotel' },
    { value: 'Custom', label: 'Custom', heading: 'Custom' },
];

// Sortable Section Component
function SortableSection({ section, children, isPreview, hoveredSection, setHoveredSection }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onMouseEnter={() => setHoveredSection(section.hoverId)}
            onMouseLeave={() => setHoveredSection(null)}
            {...attributes}
        >
            <div style={{ display: 'flex', width: '928px', padding: '4px', alignItems: 'flex-start', position: 'relative' }}>
                {/* Drag handle - only visible on hover */}
                {!isPreview && (
                    <div
                        {...listeners}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            cursor: 'grab',
                            marginRight: '8px',
                            borderRadius: '28px',
                            zIndex: 2,
                            opacity: hoveredSection === section.hoverId ? 1 : 0,
                            transition: 'opacity 0.2s ease',
                        }}
                    >
                        <img
                            src={drag}
                            alt="drag"
                            width={32}
                            height={32}
                            draggable={false}
                            style={{
                                userSelect: 'none',
                                pointerEvents: 'none',
                                filter: 'brightness(0) saturate(100%)',
                                background: 'transparent',
                                display: 'block'
                            }}
                            onError={e => { e.target.style.background = '#222'; }}
                        />
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}

function DayPage({ pageId, pageNumber, pageData, isPreview = false, onDataUpdate, dayNumber }) {
    // Initialize local state from pageData
    const [localData, setLocalData] = useState({
        destination: '',
        arrivalDetails: [''],
        transferDetails: [''],
        dropDetails: [''],
        activityDetails: [''],
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
        visibleSections: {
            arrival: true,
            transfer: true,
            activity: true,
            drop: true
        },
        // Unified order for all sections (main and dynamic)
        allSectionsOrder: ['main_arrival', 'main_transfer', 'main_activity', 'main_drop']
    });

    const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
    const [hoveredSection, setHoveredSection] = useState(null);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    // Setup DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getUniqueId = (fieldName, index = null) => {
        const baseId = `page_${pageId}_${fieldName}`;
        return index !== null ? `${baseId}_${index}` : baseId;
    };

    // Sync local state with incoming pageData when it changes
    useEffect(() => {
        if (pageData) {
            const ensureArray = (data) => {
                if (!data) return [''];
                if (Array.isArray(data)) return data.length > 0 ? data : [''];
                if (typeof data === 'string') return data ? [data] : [''];
                return [''];
            };
            const ensureActivityArray = (data) => {
                if (!data) return [''];
                if (Array.isArray(data)) {
                    const nonEmptyFields = data.filter(item => item && item.trim());
                    if (nonEmptyFields.length === 0) return [''];
                    return data.length > 0 ? data : [''];
                }
                if (typeof data === 'string') return data ? [data] : [''];
                return [''];
            };
            const ensureSectionId = (section) => {
                if (section.id) return section;
                return { ...section, id: `dynamic_${Date.now()}_${Math.floor(Math.random() * 100000)}` };
            };
            const dynamicSections = (pageData.dynamicSections || []).map(section => {
                const withArrayDetails = {
                    ...section,
                    details: Array.isArray(section.details) ? section.details : [section.details || '']
                };
                return ensureSectionId(withArrayDetails);
            });
            // Build unified order array
            const mainSections = (pageData.sectionOrder || ['arrival', 'transfer', 'activity', 'drop'])
                .filter(key => (pageData.visibleSections || {})[key] !== false)
                .map(key => `main_${key}`);
            const dynamicSectionIds = dynamicSections.map(section => section.id);
            // If pageData has a saved allSectionsOrder, use it, else default to main sections then dynamic
            const allSectionsOrder = pageData.allSectionsOrder || [...mainSections, ...dynamicSectionIds];
            setLocalData({
                destination: pageData.destination || '',
                arrivalDetails: ensureArray(pageData.arrivalDetails),
                transferDetails: ensureArray(pageData.transferDetails),
                dropDetails: ensureArray(pageData.dropDetails),
                activityDetails: ensureActivityArray(pageData.activityDetails),
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
                dynamicSections,
                visibleSections: pageData.visibleSections || {
                    arrival: true,
                    transfer: true,
                    activity: true,
                    drop: true
                },
                allSectionsOrder
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

    // Handle drag end for sections (unified)
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = localData.allSectionsOrder.indexOf(active.id);
        const newIndex = localData.allSectionsOrder.indexOf(over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const newOrder = arrayMove(localData.allSectionsOrder, oldIndex, newIndex);
        updateParent({ allSectionsOrder: newOrder });
    };


    const handleSubFieldChange = (sectionKey, index, value) => {
        const fieldName = `${sectionKey}Details`;
        const newSubFields = [...localData[fieldName]];
        newSubFields[index] = value;
        updateParent({ [fieldName]: newSubFields });
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

    const handleAddSection = (newSection) => {
        // Always assign a unique id to every new section
        const uniqueId = `dynamic_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        let sectionWithArrayDetails;
        if (newSection.type === 'Image') {
            sectionWithArrayDetails = { ...newSection, id: uniqueId };
        } else {
            sectionWithArrayDetails = { ...newSection, details: [''], id: uniqueId };
        }
        const updatedSections = [...localData.dynamicSections, sectionWithArrayDetails];
        const updatedOrder = [...localData.allSectionsOrder, uniqueId];
        updateParent({ dynamicSections: updatedSections, allSectionsOrder: updatedOrder });
    };

    const removeSection = (sectionId) => {
        const updatedSections = localData.dynamicSections.filter(section => section.id !== sectionId);
        const updatedOrder = localData.allSectionsOrder.filter(id => id !== sectionId);
        updateParent({ dynamicSections: updatedSections, allSectionsOrder: updatedOrder });
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

        // Remove from allSectionsOrder
        const sectionId = `main_${sectionKey}`;
        const updatedOrder = localData.allSectionsOrder.filter(id => id !== sectionId);

        updateParent({
            visibleSections: updatedVisibleSections,
            allSectionsOrder: updatedOrder,
            ...clearedData
        });
    };

    // Handle image upload for a specific dynamic section
    const handleImageUpload = (sectionId, file, imageUrl) => {
        const updatedSections = localData.dynamicSections.map(section =>
            section.id === sectionId ? { ...section, image: imageUrl } : section
        );
        updateParent({ dynamicSections: updatedSections });
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

    const renderDynamicSection = (section, index) => {
        // Calculate a unique dropdown index for dynamic sections
        const dynamicDropdownIndex = `dynamic_${section.id}`;
        const sectionHoverId = `dynamic_${section.id}`;

        if (section.type === 'Image') {
            // Image section: no heading, no dropdown, only delete button on hover
            return (
                <SortableSection
                    key={section.id}
                    section={{ id: section.id, hoverId: sectionHoverId }}
                    isPreview={isPreview}
                    hoveredSection={hoveredSection}
                    setHoveredSection={setHoveredSection}
                >
                    <div className="pdf-image-section">
                        <div className="pdf-image-container">
                            {isPreview ? (
                                section.image ? (
                                    <div style={{ position: 'relative', width: '920px', height: '300px' }}>
                                        <img
                                            src={section.image}
                                            alt="Uploaded preview"
                                            className="pdf-image"
                                            style={{
                                                width: '920px',
                                                height: '300px',
                                                objectFit: 'cover',
                                                borderRadius: '16px',
                                                display: 'block',
                                            }}
                                        />
                                    </div>
                                ) : null
                            ) : (
                                <div style={{ position: 'relative', width: '820px', height: '300px' }}>
                                    <ImageUpload
                                        onImageUpload={(file, imageUrl) => handleImageUpload(section.id, file, imageUrl)}
                                        existingImage={section.image || null}
                                        onRemove={() => removeSection(section.id)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </SortableSection>
            );
        }

        return (
            <SortableSection
                key={section.id}
                section={{ id: section.id, hoverId: sectionHoverId }}
                isPreview={isPreview}
                hoveredSection={hoveredSection}
                setHoveredSection={setHoveredSection}
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
                    <div style={{ width: '20px', height: '20px', aspectratio: '1 / 1', userSelect: 'none' }}>
                        <img src={ICON_OPTIONS[section.icon]} alt={section.type} draggable={false} onDragStart={e => e.preventDefault()} style={{ userSelect: 'none', pointerEvents: 'none' }} />
                    </div>
                    {renderDropdown(null, dynamicDropdownIndex, true, section.id)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', flex: '1 0 0' }}>
                    <div
                        style={{
                            display: 'flex',
                            padding: '0 0 4px 16px',
                            alignItems: 'center',
                            alignSelf: 'stretch',
                            borderRadius: '8px',
                            background: hoveredSection === sectionHoverId ? '#F4F4F6' : 'transparent',
                            transition: 'background 0.2s',
                            cursor: !isPreview ? 'pointer' : 'default'
                        }}
                        onMouseEnter={() => setHoveredSection(sectionHoverId)}
                        onMouseLeave={() => setHoveredSection(null)}
                    >
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

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}>

                                <img
                                    src={copy}
                                    alt="copy"
                                    width={20}
                                    height={20}
                                    aspectratio="1 / 1"
                                    style={{ cursor: 'pointer' }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        // Duplicate section logic with deep clone for details (preserve all rows)
                                        const uniqueId = `dynamic_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
                                        let clonedDetails;
                                        if (Array.isArray(section.details)) {
                                            clonedDetails = section.details.map(d => d && typeof d === 'object' ? { ...d } : d);
                                        } else if (section.details && typeof section.details === 'object') {
                                            clonedDetails = { ...section.details };
                                        } else {
                                            clonedDetails = section.details;
                                        }
                                        const clonedSection = {
                                            ...section,
                                            id: uniqueId,
                                            details: clonedDetails // preserve all lines/rows
                                        };
                                        // Insert after current section
                                        const currentIdx = localData.dynamicSections.findIndex(s => s.id === section.id);
                                        const updatedSections = [
                                            ...localData.dynamicSections.slice(0, currentIdx + 1),
                                            clonedSection,
                                            ...localData.dynamicSections.slice(currentIdx + 1)
                                        ];
                                        // Update order array
                                        const orderIdx = localData.allSectionsOrder.indexOf(section.id);
                                        const updatedOrder = [
                                            ...localData.allSectionsOrder.slice(0, orderIdx + 1),
                                            uniqueId,
                                            ...localData.allSectionsOrder.slice(orderIdx + 1)
                                        ];
                                        updateParent({ dynamicSections: updatedSections, allSectionsOrder: updatedOrder });
                                    }}
                                />

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
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', padding: '0px 0px 0px 16px', alignItems: 'flex-start', flexDirection: 'column', alignSelf: 'stretch' }}>
                        {Array.isArray(section.details) ? (
                            section.details.map((detail, detailIndex) => (
                                <div
                                    key={detailIndex}
                                    style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', marginBottom: detailIndex < section.details.length - 1 ? '0px' : '0px', borderRadius: '8px' }}
                                >
                                    {isPreview ? (
                                        <div
                                            style={{
                                                color: detail.value ? '#0E1328' : 'rgba(14, 19, 40, 0.24)',
                                                fontFamily: 'Lato',
                                                fontSize: '20px',
                                                fontStyle: 'normal',
                                                fontWeight: 400,
                                                width: '820px',
                                                minHeight: '32px',
                                                lineHeight: '32px',
                                                background: 'transparent',
                                                textAlign: 'justify',
                                                display: 'inline-block',
                                                whiteSpace: 'pre-line',
                                                boxSizing: 'border-box',
                                                padding: 0,
                                            }}
                                            className="ql-editor"
                                            dangerouslySetInnerHTML={{ __html: detail.value || '' }}
                                        />
                                    ) : (
                                        <Editor
                                            value={detail.value || ''}
                                            onChange={val => handleDynamicSectionChange(section.id, 'details', { ...detail, value: val }, detailIndex)}
                                            placeholder={`Enter ${section.heading.toLowerCase()} details`}
                                            style={{ width: '820px', minHeight: '32px' }}
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            // Fallback for old format - single detail field
                            <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', gap: '8px' }}>
                                {isPreview ? (
                                    <div
                                        style={{
                                            color: section.details.value ? '#0E1328' : 'rgba(14, 19, 40, 0.24)',
                                            fontFamily: 'Lato',
                                            fontSize: '20px',
                                            fontStyle: 'normal',
                                            fontWeight: 400,
                                            width: '820px',
                                            minHeight: '32px',
                                            lineHeight: '32px',
                                            background: 'transparent',
                                            textAlign: 'justify',
                                            display: 'inline-block',
                                            whiteSpace: 'pre-line',
                                            boxSizing: 'border-box',
                                            padding: 0,
                                        }}
                                        className="ql-editor"
                                        dangerouslySetInnerHTML={{ __html: section.details.value || '' }}
                                    />
                                ) : (
                                    <Editor
                                        value={section.details.value || ''}
                                        onChange={val => handleDynamicSectionChange(section.id, 'details', { ...section.details, value: val })}
                                        placeholder={`Enter ${section.heading.toLowerCase()} details`}
                                        
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </SortableSection >
        );
    };

    // --- Manage main section heading hover state in parent ---
    const GREY_BG_SECTIONS = ['arrival', 'transfer', 'drop', 'hotel', 'activity', 'restaurant'];
    const [mainSectionHover, setMainSectionHover] = useState({});

    const handleMainSectionMouseEnter = (sectionKey) => {
        if (GREY_BG_SECTIONS.includes(sectionKey)) {
            setMainSectionHover((prev) => ({ ...prev, [sectionKey]: true }));
        }
    };
    const handleMainSectionMouseLeave = (sectionKey) => {
        if (GREY_BG_SECTIONS.includes(sectionKey)) {
            setMainSectionHover((prev) => ({ ...prev, [sectionKey]: false }));
        }
    };

    // Copy handler for main sections (moved out)
    const handleCopyMainSection = (sectionKey) => {
        const sectionTypeMap = {
            arrival: { type: 'PlaneLanding', icon: 'PlaneLanding', heading: localData.sectionHeadings[sectionKey] || 'Arrival' },
            transfer: { type: 'CarFront', icon: 'CarFront', heading: localData.sectionHeadings[sectionKey] || 'Transfer' },
            activity: { type: 'Landmark', icon: 'Landmark', heading: localData.sectionHeadings[sectionKey] || 'Activities' },
            drop: { type: 'CarFront', icon: 'CarFront', heading: localData.sectionHeadings[sectionKey] || 'Drop' },
        };
        const map = sectionTypeMap[sectionKey];
        if (!map) return;
        let detailsArr = [];
        if (sectionKey === 'activity') {
            detailsArr = localData.activityDetails.map(d => ({ value: d }));
        } else {
            const fieldName = `${sectionKey}Details`;
            detailsArr = (localData[fieldName] || []).map(d => ({ value: d }));
        }
        const uniqueId = `dynamic_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        const newSection = {
            id: uniqueId,
            type: map.type,
            icon: map.icon,
            heading: map.heading,
            details: detailsArr,
        };
        const sectionId = `main_${sectionKey}`;
        const orderIdx = localData.allSectionsOrder.indexOf(sectionId);
        const updatedOrder = [
            ...localData.allSectionsOrder.slice(0, orderIdx + 1),
            uniqueId,
            ...localData.allSectionsOrder.slice(orderIdx + 1)
        ];
        const updatedSections = [...localData.dynamicSections, newSection];
        updateParent({ dynamicSections: updatedSections, allSectionsOrder: updatedOrder });
    };

    // --- Render main section as a JSX block, not a function with hooks ---
    const renderMainSection = (sectionKey, dropdownIndex, sectionData) => {
        if (!localData.visibleSections[sectionKey]) {
            return null; // Don't show deleted sections
        }
        const sectionHoverId = `main_${sectionKey}`;
        const sectionId = `main_${sectionKey}`;
        const isHeadingHovered = !!mainSectionHover[sectionKey];
        const shouldGreyBg = GREY_BG_SECTIONS.includes(sectionKey);
        return (
            <SortableSection
                key={sectionKey}
                section={{ id: sectionId, hoverId: sectionHoverId }}
                isPreview={isPreview}
                hoveredSection={hoveredSection}
                setHoveredSection={setHoveredSection}
            >
                <div style={{ display: 'inline-flex', padding: '8px', justifyContent: 'center', alignItems: 'center', gap: '8px', borderRadius: '28px', background: 'rgba(243, 63, 63, 0.06)', position: 'relative', cursor: isPreview ? 'default' : 'pointer', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }} onClick={!isPreview ? () => setOpenDropdownIndex(openDropdownIndex === dropdownIndex ? null : dropdownIndex) : undefined} onDragStart={e => e.preventDefault()}>
                    <div style={{ width: '20px', height: '20px', aspectratio: '1 / 1', userSelect: 'none' }}>
                        <img src={ICON_OPTIONS[localData.icons[sectionKey]]} alt={sectionKey} draggable={false} onDragStart={e => e.preventDefault()} style={{ userSelect: 'none', pointerEvents: 'none' }} />
                    </div>
                    {renderDropdown(sectionKey, dropdownIndex)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', flex: '1 0 0' }}>
                    <div
                        style={{
                            display: 'flex',
                            padding: '0 0 4px 16px',
                            alignItems: 'center',
                            alignSelf: 'stretch',
                            borderRadius: '8px',
                            background: shouldGreyBg && isHeadingHovered ? '#F4F4F6' : 'transparent',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={() => handleMainSectionMouseEnter(sectionKey)}
                        onMouseLeave={() => handleMainSectionMouseLeave(sectionKey)}
                    >
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
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                            }}>
                                <img
                                    src={copy}
                                    alt="copy"
                                    width={20}
                                    height={20}
                                    aspectratio="1 / 1"
                                    style={{ cursor: 'pointer' }}
                                    onClick={e => {
                                        e.stopPropagation();
                                        handleCopyMainSection(sectionKey);
                                    }}
                                />
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
                            </div>
                        )}
                    </div>

                    {sectionData}
                </div>
            </SortableSection>
        );
    };

    // Get all sortable items (unified)
    const getAllSortableItems = () => localData.allSectionsOrder;

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
            <div style={{ display: 'flex', width: '100%', padding: '64px', flexDirection: 'column', alignItems: 'center', gap: '32px', flex: 1, paddingBottom: '0px' }}>
                {/* Title Section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', alignSelf: 'stretch' }}>
                    {/* Day Number */}
                    <div style={
                        isPreview
                            ? { display: 'flex', padding: '8px 16px', alignItems: 'center', alignSelf: 'stretch', borderRadius: '16px' }
                            : { display: 'flex', padding: '8px 0px 8px 36px', alignItems: 'center', alignSelf: 'stretch', borderRadius: '16px', marginLeft: '16px' }
                    }>
                        <div style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '24px', fontStyle: 'normal', fontWeight: 500, lineHeight: '36px' }}>
                            DAY {dayNumber || 1}
                        </div>
                    </div>

                    {/* Destination */}
                    <div style={
                        isPreview
                            ? { display: 'flex', width: '960px', padding: '8px 16px', alignItems: 'center', borderRadius: '16px' }
                            : { display: 'flex', width: '960px', padding: '8px 0px 8px 36px', alignItems: 'center', borderRadius: '16px', marginLeft: '16px' }
                    }>
                        {isPreview ? (
                            <div style={{ color: localData.destination ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: '36px', fontStyle: 'normal', fontWeight: 400, lineHeight: '56px', textTransform: 'capitalize', width: '920px', flexShrink: 0 }}>
                                {localData.destination || 'Enter Destination'}
                            </div>
                        ) : (
                            <textarea
                                value={localData.destination}
                                id={getUniqueId('destination')}
                                name={getUniqueId('destination')}
                                onChange={e => {
                                    updateParent({ destination: e.target.value });
                                    if (e.target) {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }
                                }}
                                onInput={e => {
                                    if (e.target) {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }
                                }}
                                placeholder="Enter Destination"
                                rows={1}
                                style={{ color: localData.destination ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: '36px', fontStyle: 'normal', fontWeight: 400, lineHeight: '56px', textTransform: 'capitalize', width: '920px', flexShrink: 0, border: 'none', outline: 'none', background: 'transparent', resize: 'none', overflow: 'hidden', height: 'auto', boxShadow: 'none', padding: 0 }}
                            />
                        )}
                    </div>

                    {/* Meal Options */}
                    <div style={
                        isPreview
                            ? { display: 'flex', padding: '8px 16px', alignItems: 'center', gap: '12px', alignSelf: 'stretch', borderRadius: '16px' }
                            : { display: 'flex', padding: '8px 0px 12px 32px', alignItems: 'center', gap: '12px', alignSelf: 'stretch', borderRadius: '16px', marginLeft: '16px' }
                    }>
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', alignSelf: 'stretch' }}>

                        {/* Drag and Drop Context */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={getAllSortableItems()}
                                strategy={verticalListSortingStrategy}
                            >
                                {/* Render all sections in unified order */}
                                {localData.allSectionsOrder.map((sectionId, idx) => {
                                    if (sectionId.startsWith('main_')) {
                                        const sectionKey = sectionId.replace('main_', '');
                                        if (!localData.visibleSections[sectionKey]) return null;
                                        let dropdownIndex = idx;
                                        switch (sectionKey) {
                                            case 'arrival':
                                                return renderMainSection('arrival', dropdownIndex, (
                                                    <div>
                                                        {localData.arrivalDetails.map((detail, detailIndex) => (
                                                            <div key={detailIndex} style={{ display: 'flex', padding: '0px 0px 0px 16px', alignItems: 'center', alignSelf: 'stretch' }}>
                                                                {isPreview ? (
                                                                    detail ? (
                                                                        <div
                                                                            style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', flex: '1 0 0', textAlign: 'justify', width: '820px', minHeight: '32px', background: 'transparent', boxSizing: 'border-box', padding: 0 }}
                                                                            className="ql-editor"
                                                                            dangerouslySetInnerHTML={{ __html: detail }}
                                                                        />
                                                                    ) : null
                                                                ) : (
                                                                    <Editor
                                                                        value={detail}
                                                                        onChange={val => handleSubFieldChange('arrival', detailIndex, val)}
                                                                        placeholder="Enter the arrival details"
                                                                        style={{ color: detail ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: 20, fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', width: '820px', minHeight: '32px', padding: 0 }}
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ));
                                            case 'transfer':
                                                return renderMainSection('transfer', dropdownIndex, (
                                                    <div>
                                                        {localData.transferDetails.map((detail, detailIndex) => (
                                                            <div key={detailIndex} style={{ display: 'flex', padding: '0px 0px 0px 16px', alignItems: 'center', alignSelf: 'stretch' }}>
                                                                {isPreview ? (
                                                                    detail ? (
                                                                        <div
                                                                            className="ql-editor"
                                                                            style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', flex: '1 0 0', textAlign: 'justify', width: '820px', minHeight: '32px', background: 'transparent', boxSizing: 'border-box', padding: 0 }}
                                                                            dangerouslySetInnerHTML={{ __html: detail }}
                                                                        />
                                                                    ) : null
                                                                ) : (
                                                                    <Editor
                                                                        value={detail}
                                                                        onChange={val => handleSubFieldChange('transfer', detailIndex, val)}
                                                                        placeholder="Enter the transfer details"
                                                                        style={{ color: detail ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: 20, fontStyle: 'normal', fontWeight: 400, width: '820px', minHeight: '32px', padding: 0 }}
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ));
                                            case 'activity':
                                                return renderMainSection('activity', dropdownIndex, (
                                                    <div>
                                                        {localData.activityDetails.map((detail, detailIndex) => (
                                                            isPreview ? (
                                                                detail ? (
                                                                    <div
                                                                        key={detailIndex}
                                                                        className="ql-editor"
                                                                        style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', flex: '1 0 0', padding: '0px 0px 0px 16px', marginBottom: '8px', width: '820px', minHeight: '32px', background: 'transparent', boxSizing: 'border-box' }}
                                                                        dangerouslySetInnerHTML={{ __html: detail }}
                                                                    />
                                                                ) : null
                                                            ) : (
                                                                <div key={detailIndex} style={{ display: 'flex', padding: '0px 0px 0px 16px', alignItems: 'center', alignSelf: 'stretch' }}>
                                                                    <Editor
                                                                        value={detail}
                                                                        onChange={val => handleSubFieldChange('activity', detailIndex, val)}
                                                                        placeholder="Enter the activity details"
                                                                        style={{ color: detail ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: 20, fontStyle: 'normal', fontWeight: 400, width: '820px', minHeight: '32px', padding: 0 }}
                                                                    />
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                ));
                                            case 'drop':
                                                return renderMainSection('drop', dropdownIndex, (
                                                    <div>
                                                        {localData.dropDetails.map((detail, detailIndex) => (
                                                            <div key={detailIndex} style={{ display: 'flex', padding: '0px 0px 0px 16px', alignItems: 'center', alignSelf: 'stretch' }}>
                                                                {isPreview ? (
                                                                    detail ? (
                                                                        <div
                                                                            className="ql-editor"
                                                                            style={{ color: '#0E1328', fontFamily: 'Lato', fontSize: '20px', fontStyle: 'normal', fontWeight: 400, lineHeight: '32px', flex: '1 0 0', width: '820px', minHeight: '32px', background: 'transparent', boxSizing: 'border-box', padding: 0 }}
                                                                            dangerouslySetInnerHTML={{ __html: detail }}
                                                                        />
                                                                    ) : null
                                                                ) : (
                                                                    <Editor
                                                                        value={detail}
                                                                        onChange={val => handleSubFieldChange('drop', detailIndex, val)}
                                                                        placeholder="Enter the drop details"
                                                                        style={{ color: detail ? '#0E1328' : 'rgba(14, 19, 40, 0.24)', fontFamily: 'Lato', fontSize: 20, fontStyle: 'normal', fontWeight: 400, width: '820px', minHeight: '32px', padding: 0 }}
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ));
                                            default:
                                                return null;
                                        }
                                    } else {
                                        // Dynamic section (including image)
                                        const section = localData.dynamicSections.find(s => s.id === sectionId);
                                        if (!section) return null;
                                        return renderDynamicSection(section, idx);
                                    }
                                })}
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* Use the AddSectionTray component - No limit for dynamic sections */}
                    {!isPreview && <AddSectionTray onAddSection={handleAddSection} />}
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