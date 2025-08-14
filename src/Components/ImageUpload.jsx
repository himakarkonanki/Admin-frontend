// ImageUpload.js
import React, { useState, useRef } from 'react';
import upload_image from '../assets/icons/upload_image.svg';

function ImageUpload({ onImageUpload, existingImage, heightReduction = 0 }) {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(existingImage || null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Calculate responsive height
    const baseHeight = 584;
    const calculatedHeight = Math.max(284, baseHeight - heightReduction);
    
    // Calculate inner content height proportionally
    const innerBaseHeight = 520;
    const innerCalculatedHeight = Math.max(220, innerBaseHeight - heightReduction);

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
                width: '1088px',
                height: `${calculatedHeight}px`,
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 24.03%, rgba(243, 63, 63, 0.06) 100%)',
                borderRadius: '32px 32px 0 0',
            }}
        >
            {uploadedImage ? (
                <div
                    style={{
                        display: 'flex',
                        width: '1088px',
                        height: `${calculatedHeight}px`,
                        cursor: 'pointer',
                        position: 'relative',
                        borderRadius: '32px 32px 0 0',
                        overflow: 'hidden',
                    }}
                    onClick={openFileDialog}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <img
                        src={uploadedImage}
                        alt="Uploaded preview"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '32px 32px 0 0',
                        }}
                    />
                </div>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        width: '1024px',
                        height: `${innerCalculatedHeight}px`,
                        padding: '24px 40px',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '32px',
                        flexShrink: 0,
                        borderRadius: '12px',
                        border: dragActive
                            ? '2px solid rgba(243, 63, 63, 1)'
                            : '1px dashed rgba(243, 63, 63, 0.64)',
                        backgroundColor: dragActive ? 'rgba(243, 63, 63, 0.05)' : 'transparent',
                        cursor: 'pointer',
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
                                aspectRatio: '1 / 1',
                            }}>
                                <img src={upload_image} alt='upload-icon' />
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
