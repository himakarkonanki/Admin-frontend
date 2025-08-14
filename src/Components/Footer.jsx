import React, { useEffect, useState } from 'react';
import logo from '../assets/icons/companyLogo.svg'

function Footer({ pageNumber = 1 }) {
    const [base64Image, setBase64Image] = useState('');

  useEffect(() => {
    fetch(logo)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBase64Image(reader.result); 
        };
        reader.readAsDataURL(blob);
      });
  }, []);
  
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        padding: '16px 32px',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#0E1328',
        position: 'absolute',
        bottom: 0,
        left: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '313px',
          height: '32px',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        {base64Image && (
  <img
    src={base64Image}
    alt="logo"
    style={{
      width: '165.81px',
      height: '32.415px',
      flexShrink: 0,
      aspectRatio: '165.81 / 32.41',
      userSelect: 'none',
    }}
    draggable={false}
    onDragStart={(e) => e.preventDefault()}
  />
)}

      </div>

      <div
        style={{
          display: 'flex',
          width: '611.595px',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '15px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                color: '#FFF',
                fontFamily: 'Lato',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '20px',
                userSelect: 'none',
              }}
            >
              www.routeyourtravel.com
            </div>

            <div
              style={{
                width: '1px',
                alignSelf: 'stretch',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.12)',
              }}
            ></div>

            <div
              style={{
                color: 'rgba(255, 255, 255, 0.42)',
                fontFamily: 'Lato',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '24px',
                userSelect: 'none',
              }}
            >
              Page {String(pageNumber).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
