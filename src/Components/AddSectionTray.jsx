// AddSectionTray.js
import React, { useState, useRef, useEffect } from 'react';
import add from '../assets/icons/add_circle_blue.svg';
import close from '../assets/icons/close.svg';
import hotel from '../assets/icons/hotel.svg';
import fork_spoon from '../assets/icons/fork_spoon.svg';
import table from '../assets/icons/table.svg';
import interest from '../assets/icons/interests_blue.svg';
import taxi from '../assets/icons/local_taxi_blue.svg';

const ICON_OPTIONS = {
    Restaurant: fork_spoon,
    Hotel: hotel,
    CarFront: taxi,
    Landmark: interest,
};

const SECTION_OPTIONS = [
    { value: 'Restaurant', label: 'Restaurant', heading: 'Dining' },
    { value: 'Hotel', label: 'Hotel', heading: 'Hotel' },
    { value: 'Landmark', label: 'Activity', heading: 'Activities' },
    { value: 'CarFront', label: 'Car', heading: 'Transfer' },
];

function AddSectionTray({ onAddSection }) {
    const [showAddSectionTray, setShowAddSectionTray] = useState(false);
    const [hoveredIcon, setHoveredIcon] = useState(null);
    const trayRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (trayRef.current && !trayRef.current.contains(event.target)) {
                setShowAddSectionTray(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddSection = (sectionType) => {
        const selectedOption = SECTION_OPTIONS.find(opt => opt.value === sectionType);
        const newSection = {
            id: Date.now(),
            type: sectionType,
            heading: selectedOption.heading,
            details: '',
            icon: sectionType
        };
        onAddSection(newSection);
        setShowAddSectionTray(false);
    };

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '34px',
            alignSelf: 'stretch',
            position: 'relative',
        }}>
            {/* Conditionally render Add Section Button OR Tray */}
            {!showAddSectionTray ? (
                /* Add Section Button - only show when tray is closed */
                <div 
                    onClick={() => setShowAddSectionTray(true)}
                    style={{
                        display: 'flex',
                        padding: '16px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        borderRadius: '28px',
                        background: '#F2F4FE',
                        cursor: 'pointer',
                    }}
                >
                    <div style={{
                        width: '24px',
                        height: '24px',
                        aspectRatio: '1 / 1',
                    }}>
                        <img src={add} alt='add icon' />
                    </div>
                    <div style={{
                        color: '#0E1328',
                        fontFamily: 'Lato',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        lineHeight: '24px',
                        textTransform: 'uppercase',
                    }}>
                        Add Section
                    </div>
                </div>
            ) : (
                /* Horizontal Tray - only show when Add Section is clicked */
                <div
                    ref={trayRef}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 16px',
                        borderRadius: '40px',
                        background: 'transparent',
                        overflowX: 'auto',
                    }}
                >
                    {/* Section tiles */}
                    {SECTION_OPTIONS.map(option => (
                        <div
                            key={option.value}
                            onClick={() => handleAddSection(option.value)}
                            onMouseEnter={() => setHoveredIcon(option.value)}
                            onMouseLeave={() => setHoveredIcon(null)}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: hoveredIcon === option.value ? '#0E1328' : '#F2F4FE',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease',
                            }}
                        >
                            <img
                                src={ICON_OPTIONS[option.value]}
                                alt={option.label}
                                width={24}
                                height={24}
                                style={{
                                    filter: hoveredIcon === option.value ? 
                                        'brightness(0) saturate(100%) invert(100%)' : 
                                        'none',
                                    transition: 'filter 0.2s ease',
                                }}
                            />
                        </div>
                    ))}

                    {/* Close icon - circular with #F2F4FE background */}
                    <div
                        style={{
                            display: 'flex',
                            width: '56px',
                            height: '56px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: '50%',
                            background: hoveredIcon === 'close' ? '#0E1328' : '#F2F4FE',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                        }}
                        onClick={() => setShowAddSectionTray(false)}
                        onMouseEnter={() => setHoveredIcon('close')}
                        onMouseLeave={() => setHoveredIcon(null)}
                    >
                        <img
                            src={close}
                            alt="close"
                            width={24}
                            height={24}
                            style={{
                                filter: hoveredIcon === 'close' ? 
                                    'brightness(0) saturate(100%) invert(100%)' : 
                                    'none',
                                transition: 'filter 0.2s ease',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddSectionTray;
