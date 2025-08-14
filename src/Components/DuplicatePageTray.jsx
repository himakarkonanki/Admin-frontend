import React, { useState } from 'react'
import copy from '../assets/icons/copy_all.svg'
import del from '../assets/icons/delete.svg'

function DuplicatePageTray({ pageId, pageType, onDuplicate, onDelete }) {
    const [hoveredItem, setHoveredItem] = useState(null);

    const handleDuplicate = () => {
        if (onDuplicate) {
            onDuplicate(pageId);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(pageId);
        }
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
                width: '181px',
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
            {/* Duplicate Option */}
            <div
                style={getItemStyle('duplicate')}
                onClick={handleDuplicate}
                onMouseEnter={() => setHoveredItem('duplicate')}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <div
                    style={{
                        width: '20px',
                        height: '20px',
                        aspectRatio: '1 / 1',
                    }}
                >
                    <img 
                        src={copy} 
                        alt='copy icon' 
                        style={{
                            width: '20px',
                            height: '20px',
                            filter: 'brightness(0) invert(1)', // Makes icon white
                        }}
                    />
                </div>

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
                    Duplicate
                </div>
            </div>

            {/* Delete Option */}
            <div
                style={getItemStyle('delete')}
                onClick={handleDelete}
                onMouseEnter={() => setHoveredItem('delete')}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <div
                    style={{
                        width: '20px',
                        height: '20px',
                        aspectRatio: '1 / 1',
                    }}
                >
                    <img 
                        src={del} 
                        alt='delete icon' 
                        style={{
                            width: '20px',
                            height: '20px',
                            filter: 'hue-rotate(0deg) saturate(1.5) brightness(0.9)', // Red tint for delete icon
                        }}
                    />
                </div>

                <div
                    style={{
                        flex: '1 0 0',
                        color: '#EE4A4D',
                        fontFamily: 'Lato',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '24px',
                    }}
                >
                    Delete
                </div>
            </div>
        </div>
    )
}

export default DuplicatePageTray
