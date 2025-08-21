import React, { useEffect, useState, useRef } from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import add from '../assets/icons/add_2.svg'

const toolbarOptions = [
  ['bold', 'italic', 'underline'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  ['clean']
];

const Editor = ({ value, onChange, placeholder = '', style = {} }) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const dropdownRef = useRef(null);
  const { quill, quillRef } = useQuill({
    modules: { toolbar: false },
    theme: 'snow',
    placeholder,
  });

  // Set value from parent
  useEffect(() => {
    if (quill && value !== undefined) {
      const current = quill.root.innerHTML;
      if (value !== current) {
        quill.root.innerHTML = value || '';
      }
    }
  }, [quill, value]);

  // Listen for changes
  useEffect(() => {
    if (quill && onChange) {
      const handler = () => {
        onChange(quill.root.innerHTML === '<p><br></p>' ? '' : quill.root.innerHTML);
      };
      quill.on('text-change', handler);
      return () => quill.off('text-change', handler);
    }
  }, [quill, onChange]);

  // Handle click outside to close dropdown
  useEffect(() => {
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
    borderRadius: '12px',
    background: '#fff',
    fontFamily: 'Lato',
    fontSize: 20,
    fontWeight: 400,
  padding: '0px 2px ',// Add left padding for plus icon, but not too much for lists
    color:'#0E1328',
    outline: 'none',
    overflow: 'hidden',
  };

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      style={{ position: 'relative', ...style }}
    >
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
            zIndex:10,
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
                    <option style={{color:'#0E1328', fontSize: 16, fontFamily:'Lato' ,fontWeight: 400}} onClick={() => { quill && quill.format('list', 'ordered'); setShowToolbar(false); }}>Ordered List</option>
          <option style={{color:'#0E1328', fontSize: 16, fontFamily:'Lato' ,fontWeight: 400}} onClick={() => { quill && quill.format('list', 'bullet'); setShowToolbar(false); }}>Unordered List</option>
          <option style={{color:'#0E1328', fontSize: 16, fontFamily:'Lato' ,fontWeight: 400}} onClick={() => { quill && quill.format('underline', true); setShowToolbar(false); }}>Underline</option>
          <option style={{color:'#0E1328', fontSize: 16, fontFamily:'Lato' ,fontWeight: 400}} onClick={() => { quill && quill.format('bold', true); setShowToolbar(false); }}>Bold</option>
          <option style={{color:'#0E1328', fontSize: 16, fontFamily:'Lato' ,fontWeight: 400}} onClick={() => { quill && quill.format('italic', true); setShowToolbar(false); }}>Italic</option>

        </div>
      )}
      <div
        ref={quillRef}
        style={inputStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={0}
      />
    </div>
  );
};

export default Editor;