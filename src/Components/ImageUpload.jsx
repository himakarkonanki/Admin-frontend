// ImageUpload.js
import React, { useState, useRef } from 'react';
import closeIcon from '../assets/icons/close.svg';
import upload_image from '../assets/icons/upload_image.svg';

function ImageUpload({ onImageUpload, existingImage, heightReduction = 0, onRemove }) {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(existingImage || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // If parent wants to remove this section, call onRemove
    const handleRemove = (e) => {
        e.stopPropagation();
        if (onRemove) onRemove();
    };

    // Fixed dimensions, match details section width (820px)
    const containerWidth = 820;
    const containerHeight = 300;

    const handleFiles = (files) => {
        const file = files[0];
        if (!file) return;

        // Validate type
        if (!file.type.startsWith('image/')) {
            alert('Please upload only image files (JPEG or PNG)');
            return;
        }

        // Validate size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB');
            return;
        }

        setIsUploading(true);

        // Convert to base64 instead of blob URL
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Image = reader.result;
            setUploadedImage(base64Image);
            setIsUploading(false);

            if (onImageUpload) {
                onImageUpload(file, base64Image); // send base64 to parent
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            style={{
                display: 'flex',
                width: `${containerWidth}px`,
                height: `${containerHeight}px`,
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                background: uploadedImage
                    ? '#fff'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.00) 24.03%, rgba(243,63,63,0.06) 100%)',
                borderRadius: '24px',
                boxShadow: uploadedImage ? '0 4px 24px 0 rgba(0,0,0,0.10)' : 'none',
                overflow: 'hidden',
                margin: '0 auto',
                position: 'relative',
            }}
        >
            {/* Close Icon Button */}
            <button
                onClick={handleRemove}
                style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(255,255,255,0.8)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 2,
                    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)'
                }}
                aria-label="Remove image upload section"
            >
                <img src={closeIcon} alt="close" style={{ width: 18, height: 18 }} />
            </button>
            {uploadedImage ? (
                <img
                    src={uploadedImage}
                    alt="Uploaded preview"
                    style={{
                        width: `${containerWidth}px`,
                        height: `${containerHeight}px`,
                        objectFit: 'cover',
                        borderRadius: '24px',
                        display: 'block',
                    }}
                    onClick={openFileDialog}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                />
            ) : (
                <div
                    style={{
                        display: 'flex',
                        width: `${containerWidth}px`,
                        height: `${containerHeight}px`,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '24px',
                        border: dragActive
                            ? '2px solid #F33F3F'
                            : '1.5px dashed #F3A3A3',
                        background: dragActive ? 'rgba(243,63,63,0.04)' : 'transparent',
                        cursor: 'pointer',
                        borderRadius: '24px',
                        transition: 'border 0.2s, background 0.2s',
                        position: 'relative',
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                >
                    {isUploading ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px',
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                border: '4px solid rgba(243, 63, 63, 0.3)',
                                borderTop: '4px solid rgba(243, 63, 63, 1)',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                            }}></div>
                            <div style={{
                                color: '#0E1328',
                                fontFamily: 'Lato',
                                fontSize: '24px',
                                fontWeight: 600,
                            }}>
                                Uploading...
                            </div>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fff',
                                borderRadius: '16px',
                                boxShadow: '0 2px 8px 0 rgba(243, 63, 63, 0.10)',
                            }}>
                                <img src={upload_image} alt='upload-icon' style={{ width: '40px', height: '40px' }} />
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '16px',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2px',
                                }}>
                                    <div style={{
                                        color: '#0E1328',
                                        textAlign: 'center',
                                        fontFamily: 'Lato',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        lineHeight: '24px',
                                    }}>
                                        {dragActive ? 'Drop image here' : 'Upload Image'}
                                    </div>
                                    <div style={{
                                        color: '#0E1328',
                                        textAlign: 'center',
                                        fontFamily: 'Lato',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        lineHeight: '18px',
                                    }}>
                                        JPEG or PNG (Max. size: 2 MB)
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* Spinner animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `
            }} />
        </div>
    );
}

export default ImageUpload;

