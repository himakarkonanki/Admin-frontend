import React from 'react';
import PagePreview from './PagePreview';

// Renders a scaled-down live preview of the page
function ThumbnailGenerator({ page }) {
  if (!page) return null;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: '#fff',
      borderRadius: '4px',
      position: 'relative',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        transform: 'scale(1)',
        transformOrigin: 'top left',
        pointerEvents: 'none',
        position: 'relative',
      }}>
        <PagePreview page={page} />
      </div>
    </div>
  );
}

export default ThumbnailGenerator;
