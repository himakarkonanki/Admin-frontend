import React, { useState } from 'react'

function EditorBarForLeftPanel({ onPageSelect }) {
    const [hoveredItem, setHoveredItem] = useState(null);

    const handlePageClick = (pageType) => {
        onPageSelect(pageType);
    };

    const getItemStyle = (itemKey) => ({
        display: 'flex',
        padding: '6px 8px',
        alignItems: 'center',
        gap: '4px',
        alignSelf: 'stretch',
        borderRadius: '6px',
        background: hoveredItem === itemKey ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
        cursor: 'pointer',
        transition: 'background 0.2s ease-in-out',
    });

    return (
        <div
            style={{
                display: 'flex',
                width: '264px',
                padding: '8px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '4px',
                borderRadius: '12px',
                background: '#0E1328',
                boxShadow: '0 3px 8px 0 rgba(0, 0, 0, 0.24)',
            }}
        >
            {/* Day-wise Page Option */}
            <div
                style={getItemStyle('day')}
                onClick={() => handlePageClick('day')}
                onMouseEnter={() => setHoveredItem('day')}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <div
                    style={{
                        flex: '1 0 0',
                        color: '#FFF',
                        fontFamily: 'Lato',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '24px',
                    }}
                >
                    Day-wise Page
                </div>
            </div>

            {/* Policy Page Option */}
            <div
                style={getItemStyle('policy')}
                onClick={() => handlePageClick('policy')}
                onMouseEnter={() => setHoveredItem('policy')}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <div
                    style={{
                        flex: '1 0 0',
                        color: '#FFF',
                        fontFamily: 'Lato',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '24px',
                    }}
                >
                    Policy Page
                </div>
            </div>
        </div>
    )
}

export default EditorBarForLeftPanel
