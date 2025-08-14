import React from 'react';

// This component renders a miniature version of a page based on its type and data
function PagePreview({ page }) {
  if (!page) return null;

  switch (page.type) {
    case 'cover':
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: page.backgroundImage ? `url(${page.backgroundImage}) center/cover` : '#0E1328',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.2)',
          }} />
        </div>
      );
    case 'day':
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: page.uploadedImage ? `url(${page.uploadedImage}) center/cover` : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {page.uploadedImage && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.3)',
            }} />
          )}
        </div>
      );
    case 'policy':
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Add some subtle lines to represent document content */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            width: '60%',
          }}>
            <div style={{ height: '2px', background: 'rgba(14, 19, 40, 0.2)', width: '100%', borderRadius: '1px' }} />
            <div style={{ height: '2px', background: 'rgba(14, 19, 40, 0.2)', width: '80%', borderRadius: '1px' }} />
            <div style={{ height: '2px', background: 'rgba(14, 19, 40, 0.2)', width: '90%', borderRadius: '1px' }} />
            <div style={{ height: '2px', background: 'rgba(14, 19, 40, 0.2)', width: '70%', borderRadius: '1px' }} />
          </div>
        </div>
      );
    case 'thankyou':
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: '#0E1328',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        </div>
      );
    default:
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        </div>
      );
  }
}

export default PagePreview;
