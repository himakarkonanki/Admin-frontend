import React, { useState, useEffect } from 'react';
import Thankyou from '../assets/icons/Thankthumbnail.svg';
import Footer from './Footer';
import instagram from '../assets/icons/Instagram.svg';
import facebook from '../assets/icons/meta.svg';
import linkedin from '../assets/icons/linkedin.svg';
import whatsapp from '../assets/icons/whatsapp.png';

const ThankYouPage = ({ pageId, pageNumber, pageData, onDataChange, isPreview = false, totalPages }) => {
    const [base64Image, setBase64Image] = useState('');
    const [localData, setLocalData] = useState({
        thankYouTitle: '',
        thankYouMessage: '',
        phoneNumber: '(+91) 7305273554',
        emailAddress: 'sales@routeyourtravel.com',
        websiteOrInstagram: 'www.routeyourtravel.com'
    });

    // Sync local state with pageData
    useEffect(() => {
        if (pageData) {
            setLocalData({
                thankYouTitle: pageData.thankYouTitle || '',
                thankYouMessage: pageData.thankYouMessage || '',
                phoneNumber: pageData.phoneNumber || '(+91) 7305273554',
                emailAddress: pageData.emailAddress || 'sales@routeyourtravel.com',
                websiteOrInstagram: pageData.websiteOrInstagram || 'www.routeyourtravel.com'
            });
        }
    }, [pageData]);

    useEffect(() => {
        fetch(Thankyou)
            .then((res) => res.blob())
            .then((blob) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setBase64Image(reader.result);
                };
                reader.readAsDataURL(blob);
            });
    }, []);

    // Handle data changes and immediately notify parent
    const handleDataChange = (field, value) => {
        if (isPreview) return; // Prevent changes in preview mode

        const updatedData = { ...localData, [field]: value };
        setLocalData(updatedData);

        // Immediately call the parent's update function
        if (onDataChange) {
            onDataChange(updatedData);
        }
    };

    // Generate unique IDs based on pageId or pageNumber
    const uniqueId = pageId || `thankyou-${pageNumber || Date.now()}`;
    const titleId = `thankYouTitle-${uniqueId}`;
    const messageId = `thankYouMessage-${uniqueId}`;

    return (
        <div style={{
            width: '1088px',
            height: '1540px',
            flexShrink: 0,
            aspectRatio: '272 / 385',
        }}>
            <div // wrap
                style={{
                    display: 'flex',
                    width: '1088px',
                    minHeight: '1540px',
                    padding: '0 64px',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '32px',
                    flexShrink: 0,
                    background: '#0E1328',
                    position: 'relative',
                }}
            >
                <div
                    style={{ // container
                        display: 'flex',
                        width: '960px',
                        padding: '32px 32px 64px 32px',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '16px',
                        position: 'absolute',
                        left: '64px',
                        top: '100px',
                        borderRadius: '32px 32px 0 0',
                        background: 'rgba(14, 19, 40, 0.80)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    {/* Title Section */}
                    <div
                        style={{ // Title
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            alignSelf: 'stretch',
                        }}
                    >
                        <div
                            style={{ // span
                                display: 'flex',
                                padding: '8px 16px',
                                alignItems: 'center',
                                alignSelf: 'stretch',
                                borderRadius: '16px'
                            }}
                        >
                            {/* Page indicator or label can go here if needed */}
                        </div>
                        <div
                            style={{ // cover title
                                display: 'flex',
                                width: '896px',
                                padding: '8px 16px',
                                alignItems: 'center',
                                borderRadius: '16px',
                            }}
                        >
                            {isPreview ? (
                                localData.thankYouTitle ? (
                                    <div style={{
                                        flex: '1 0 0',
                                        color: '#F33F3F',
                                        fontFamily: 'Lato',
                                        fontSize: '64px',
                                        fontStyle: 'normal',
                                        fontWeight: 400,
                                        lineHeight: '80px',
                                        textTransform: 'capitalize',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {localData.thankYouTitle}
                                    </div>
                                ) : null
                            ) : (
                                // Edit mode - input field
                                <textarea
                                    id={titleId}
                                    value={localData.thankYouTitle}
                                    onChange={e => {
                                        handleDataChange('thankYouTitle', e.target.value);
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
                                    placeholder="Thank You!"
                                    rows={1}
                                    style={{
                                        flex: '1 0 0',
                                        color: localData.thankYouTitle ? '#F33F3F' : 'rgba(243, 63, 63, 0.24)',
                                        fontFamily: 'Lato',
                                        fontSize: '64px',
                                        fontStyle: 'normal',
                                        fontWeight: 400,
                                        lineHeight: '80px',
                                        textTransform: 'capitalize',
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        resize: 'none',
                                        overflow: 'hidden',
                                        height: 'auto',
                                        boxShadow: 'none',
                                        padding: 0
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    {/* Message Section */}
                    <div // Details
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            alignSelf: 'stretch',
                        }}
                    >
                        <div
                            style={{ // span
                                display: 'flex',
                                padding: '8px 16px',
                                alignItems: 'flex-start',
                                alignSelf: 'stretch',
                                borderRadius: '12px',
                            }}
                        >
                            {isPreview ? (
                                localData.thankYouMessage ? (
                                    <div style={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontFamily: 'Lato',
                                        fontSize: '20px',
                                        fontStyle: 'italic',
                                        fontWeight: 400,
                                        lineHeight: '36px',
                                        flex: '1 0 0',
                                        minHeight: '150px',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {localData.thankYouMessage}
                                    </div>
                                ) : null
                            ) : (
                                // Edit mode - textarea
                                <textarea
                                    value={localData.thankYouMessage}
                                    id={messageId}
                                    onChange={(e) => handleDataChange('thankYouMessage', e.target.value)}
                                    placeholder="Enter Some thank you greeting"
                                    rows={6}
                                    style={{
                                        color: localData.thankYouMessage ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.24)',
                                        fontFamily: 'Lato',
                                        fontSize: '20px',
                                        fontStyle: 'italic',
                                        fontWeight: 400,
                                        lineHeight: '36px',
                                        flex: '1 0 0',
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        resize: 'vertical',
                                        minHeight: '150px',
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    {/* Contact Details Section */}
                    <div
                        style={{
                            display: 'flex',
                            padding: '0 16px',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'flex-start',
                            gap: '20px',
                            alignSelf: 'stretch',
                        }}
                    >
                        {/* Divider */}
                        <div
                            style={{
                                height: '1px',
                                alignSelf: 'stretch',
                                borderRadius: '2px',
                                background: 'rgba(255, 255, 255, 0.12)',
                            }}
                        />
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '0px',
                                alignSelf: 'stretch',
                            }}
                        >
                            {isPreview ? (
                                <>
                                    <div style={{
                                        color: 'rgba(255, 255, 255, 0.50)',
                                        fontFamily: 'Lato',
                                        fontSize: '20px',
                                        fontStyle: 'italic',
                                        fontWeight: 400,
                                        lineHeight: '32px',
                                        marginBottom: '0px',
                                    }}>{localData.phoneNumber}</div>
                                    <div style={{
                                        color: 'rgba(255, 255, 255, 0.50)',
                                        fontFamily: 'Lato',
                                        fontSize: '20px',
                                        fontStyle: 'italic',
                                        fontWeight: 400,
                                        lineHeight: '32px',
                                        marginBottom: '0px',
                                    }}>{localData.emailAddress}</div>
                                    <div style={{
                                        color: 'rgba(255, 255, 255, 0.50)',
                                        fontFamily: 'Lato',
                                        fontSize: '20px',
                                        fontStyle: 'italic',
                                        fontWeight: 400,
                                        lineHeight: '32px',
                                        marginBottom: '0px',
                                    }}>{localData.websiteOrInstagram}</div>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={localData.phoneNumber}
                                        onChange={e => handleDataChange('phoneNumber', e.target.value)}
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.50)',
                                            fontFamily: 'Lato',
                                            fontSize: '20px',
                                            fontStyle: 'italic',
                                            fontWeight: 400,
                                            lineHeight: '32px',
                                            marginBottom: '0px',
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            width: '100%',
                                            padding: 0,
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={localData.emailAddress}
                                        onChange={e => handleDataChange('emailAddress', e.target.value)}
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.50)',
                                            fontFamily: 'Lato',
                                            fontSize: '20px',
                                            fontStyle: 'italic',
                                            fontWeight: 400,
                                            lineHeight: '32px',
                                            marginBottom: '0px',
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            width: '100%',
                                            padding: 0,
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={localData.websiteOrInstagram}
                                        onChange={e => handleDataChange('websiteOrInstagram', e.target.value)}
                                        style={{
                                            color: 'rgba(255, 255, 255, 0.50)',
                                            fontFamily: 'Lato',
                                            fontSize: '20px',
                                            fontStyle: 'italic',
                                            fontWeight: 400,
                                            lineHeight: '32px',
                                            marginBottom: '0px',
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            width: '100%',
                                            padding: 0,
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        paddingLeft: '16px',
                        alignItems: 'center',
                        gap: '18px',
                    }}>
                        
                        <img src={facebook} style={{width: '24px', height: '24px', aspectRatio: '7/12'}} alt="Facebook" />
                        <img src={instagram} style={{width: '24px', height: '24px', aspectRatio: '1/1'}} alt="Instagram" />
                        <img src={linkedin} style={{width: '24px', height: '24px', aspectRatio: '1/1'}} alt="LinkedIn" />
                        <img src={whatsapp} style={{width: '24px', height: '24px', aspectRatio: '1/1'}} alt="WhatsApp" />
                    </div>
                </div>
                <div style={{
                    width: '1090px',
                    height: '685px',
                    boxSizing: 'border-box',
                    marginTop: '700px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {base64Image && (
                        <img src={base64Image} alt="Thank You" />
                    )}
                </div>
                {/* Footer - UPDATED: Pass totalPages or calculate correct page number */}
                <Footer pageNumber={totalPages || pageNumber} />
            </div>
        </div>
    );
};

export default ThankYouPage;
