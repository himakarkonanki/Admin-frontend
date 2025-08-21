import React, { useState, useRef } from 'react';
// Custom styles for Quill editor content
const quillCustomStyles = `
  .ql-container {
    border-radius: 12px !important;
    overflow: hidden !important;
    background: #fff;
  }
  .ql-editor {
    font-family: 'Lato', sans-serif;
    font-size: 20px;
    font-weight: 400;
    color: #0E1328;
    padding: 6px 2px;
    min-height: 40px;
    background: #fff;
    border-radius: 12px;
    outline: none;
  }
  /* Remove list indentation in editing mode */
  .ql-editor ol,
  .ql-editor ul {
    padding-left: 0 !important;
    margin-left: 0 !important;
  }
  .custom-dropdown-option {
    transition: background 0.15s;
    border-radius: 6px;
    padding: 4px 8px;
  }
  .custom-dropdown-option:hover, .custom-dropdown-option:focus {
    background: #f0f0f0;
  }
`;
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import add from '../assets/icons/add_2.svg';

const modules = {
  toolbar: false // We'll use our own custom toolbar
};

const Editor = ({ value, onChange, placeholder = '', style = {} }) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);
  const quillRef = useRef(null);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowToolbar(false);
      }
    }
    if (showToolbar) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showToolbar]);

  // Styling to mimic input
  // Adjust left margin to align input bar with section title (e.g., 'TRANSFER')
  const inputStyle = {
    height: 'auto',
    width: '100%',
    borderRadius: '10px',
    background: '#fff',
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: 400,
    padding: '6px 8px',
    color: '#0E1328',
    outline: 'none',
    overflow: 'hidden',
    minHeight: 40,
    marginLeft: -12, // Adjust this value to match the left edge of the section title
  };

  // Custom format handler
  const handleFormat = (format, value = true) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.format(format, value);
      setShowToolbar(false);
    }
  };

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Inject custom styles for Quill editor */}
      <style>{quillCustomStyles}</style>
      {/* Plus icon button, only show on focus */}
      {isFocused && (
        <button
          type="button"
          onMouseDown={e => e.preventDefault()} // Prevent blur on mousedown
          onClick={() => setShowToolbar((v) => !v)}
          style={{
            position: 'absolute',
            top: 10,
            left: -50,
            zIndex: 2,
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            padding: 0,
          }}
          aria-label="Show toolbar"
        >
          <img src={add} alt="Show toolbar" style={{ width: 24, height: 24, display: 'block' }} />
        </button>
      )}
      {/* Dropdown toolbar */}
      {showToolbar && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: 32,
            left: -18,
            zIndex: 10,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            gap: 8,
            minWidth: 180,
            cursor: 'pointer',
          }}
        >
          <div className="custom-dropdown-option" style={{ color: '#0E1328', fontSize: 16, fontFamily: 'Lato', fontWeight: 400 }} tabIndex={0} onClick={() => handleFormat('list', 'ordered')}>Ordered List</div>
          <div className="custom-dropdown-option" style={{ color: '#0E1328', fontSize: 16, fontFamily: 'Lato', fontWeight: 400 }} tabIndex={0} onClick={() => handleFormat('list', 'bullet')}>Unordered List</div>
          <div className="custom-dropdown-option" style={{ color: '#0E1328', fontSize: 16, fontFamily: 'Lato', fontWeight: 400 }} tabIndex={0} onClick={() => handleFormat('underline')}>Underline</div>
          <div className="custom-dropdown-option" style={{ color: '#0E1328', fontSize: 16, fontFamily: 'Lato', fontWeight: 400 }} tabIndex={0} onClick={() => handleFormat('bold')}>Bold</div>
          <div className="custom-dropdown-option" style={{ color: '#0E1328', fontSize: 16, fontFamily: 'Lato', fontWeight: 400 }} tabIndex={0} onClick={() => handleFormat('italic')}>Italic</div>
        </div>
      )}
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        style={inputStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  );
};

export default Editor;