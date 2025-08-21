import React, { useState, useRef } from 'react';
// Custom styles for Quill editor content
const quillCustomStyles = `
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
  const inputStyle = {
    height: 'auto',
    width: '100%',
    borderRadius: '2px',
    background: '#fff',
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: 400,
    padding: '0px 2px ', // Add left padding for plus icon, but not too much for lists
    color: '#0E1328',
    outline: 'none',
    overflow: 'hidden',
    minHeight: 40,
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
            gap: 8,
            minWidth: 180,
            cursor: 'pointer',
          }}
        >
          <option style={{ color: '#0E1328', fontSize: 16, fontFamily: 'Lato', fontWeight: 400 }} onClick={() => handleFormat('list', 'ordered')}>Ordered List</option>
          <option style={{ color: '#0E1328', fontSize: 16, fontFamily: 'Lato', fontWeight: 400 }} onClick={() => handleFormat('list', 'bullet')}>Unordered List</option>
          <option style={{ color: '#0E1328', fontSize: 16, fontFamily: 'Lato', fontWeight: 400 }} onClick={() => handleFormat('underline')}>Underline</option>
          <option style={{ color: '#0E1328', fontSize: 16, fontFamily: 'Lato', fontWeight: 400 }} onClick={() => handleFormat('bold')}>Bold</option>
          <option style={{ color: '#0E1328', fontSize: 16, fontFamily: 'Lato', fontWeight: 400 }} onClick={() => handleFormat('italic')}>Italic</option>
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