import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import './PolicyPage.css';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import NestedList from '@editorjs/nested-list';
import Table from '@editorjs/table';
import Footer from './Footer';

const PolicyPage = React.forwardRef(function PolicyPage(
  { onDataUpdate, initialData, pageNumber = 1, pageId },
  ref
) {
  const editorInstanceRef = useRef(null);
  const editorContainerRef = useRef(null);
  const isInitializingRef = useRef(false);
  const [isHeightLimitReached, setIsHeightLimitReached] = useState(false);
  
  const editorId = `editorjs-policy-${pageId || pageNumber || Date.now()}`;

  // Check if content height exceeds container height
  const checkHeightLimit = () => {
    const container = editorContainerRef.current;
    if (!container) return false;
    const limitReached = container.scrollHeight >= container.clientHeight - 10;
    setIsHeightLimitReached(limitReached);
    return limitReached;
  };

  // Fix list block states after pasting
  const fixListBlockStates = async () => {
    if (!editorInstanceRef.current) return;
    
    try {
      const savedData = await editorInstanceRef.current.saver.save();
      let hasListBlocks = false;
      
      savedData.blocks.forEach(block => {
        if (block.type === 'list') {
          hasListBlocks = true;
        }
      });

      if (hasListBlocks) {
        setTimeout(async () => {
          try {
            await editorInstanceRef.current.render(savedData);
            // setTimeout(applyHeaderStyles, 100); // Removed undefined function
          } catch (error) {
            console.error('Error re-rendering after paste:', error);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error fixing list states:', error);
    }
  };

  // Cleanup function
  const cleanupEditor = () => {
    if (editorInstanceRef.current) {
      try {
        if (editorInstanceRef.current.cleanup) {
          editorInstanceRef.current.cleanup();
        }
        if (editorInstanceRef.current.destroy) {
          editorInstanceRef.current.destroy();
        }
      } catch (error) {
        console.error('Error destroying editor:', error);
      } finally {
        editorInstanceRef.current = null;
        isInitializingRef.current = false;
      }
    }
  };

  // Initialize editor
  const initializeEditor = async () => {
    // Prevent multiple initializations
    if (isInitializingRef.current || editorInstanceRef.current) {
      return;
    }

    isInitializingRef.current = true;

    // Clear any existing content in the holder
    const holder = document.getElementById(editorId);
    if (holder) {
      holder.innerHTML = '';
    }

    try {
      const editor = new EditorJS({
        holder: editorId,
        autofocus: true,
        
        onReady: () => {
          console.log('Editor ready for:', editorId);
          // applyHeaderStyles(); // Removed undefined function
          
          const container = document.getElementById(editorId);
          if (container) {
            editorContainerRef.current = container;
            
            const handleKeydown = (e) => {
              if (
                isHeightLimitReached &&
                !['Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
              ) {
                e.preventDefault();
              }
            };

            const handlePaste = async (e) => {
              if (isHeightLimitReached) {
                e.preventDefault();
                return;
              }
              setTimeout(fixListBlockStates, 500);
            };

            container.addEventListener('keydown', handleKeydown);
            container.addEventListener('paste', handlePaste);

            // Store cleanup function on editor instance
            editor.cleanup = () => {
              container.removeEventListener('keydown', handleKeydown);
              container.removeEventListener('paste', handlePaste);
            };
          }
          isInitializingRef.current = false;
        },

        onChange: async () => {
          // setTimeout(applyHeaderStyles, 0); // Removed undefined function
          
          try {
            const savedData = await editor.saver.save();
            
            if (onDataUpdate) {
              const fields = [];
              let fieldId = 1;

              savedData.blocks.forEach(block => {
                if (block.type === 'header') {
                  fields.push({
                    id: fieldId++,
                    type: 'title',
                    content: block.data.text,
                    level: block.data.level || 1,
                  });
                } else if (block.type === 'paragraph') {
                  fields.push({
                    id: fieldId++,
                    type: 'details',
                    content: block.data.text,
                  });
                } else if (block.type === 'list') {
                  fields.push({
                    id: fieldId++,
                    type: 'list',
                    content: block.data.items,
                    style: block.data.style || 'unordered',
                    meta: block.data.meta || {},
                  });
                } else if (block.type === 'table') {
                  fields.push({
                    id: fieldId++,
                    type: 'table',
                    content: block.data.content,
                    hasHeaders: block.data.withHeadings !== false,
                  });
                }
              });

              onDataUpdate({
                title: 'Terms & Conditions',
                fields,
                blocks: savedData.blocks,
              });
            }
          } catch (error) {
            console.error('Error saving editor data:', error);
          }

          checkHeightLimit();
        },

        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a section title...',
              levels: [1],
              defaultLevel: 1,
            },
          },
          paragraph: {
            class: Paragraph,
            config: {
              placeholder: '',
            },
          },
          list: {
            class: NestedList,
            config: {
              defaultStyle: 'unordered',
            },
          },
          table: {
            class: Table,
            config: {
              rows: 4,
              cols: 2,
              withHeadings: true,
            },
          },
        },

        data: {
          blocks: initialData?.blocks || [],
        },
      });

      editorInstanceRef.current = editor;

    } catch (error) {
      console.error('Error initializing editor:', error);
      isInitializingRef.current = false;
    }
  };

  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeEditor();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      cleanupEditor();
    };
  }, []); // Remove initialData dependency to prevent re-initialization

  // Handle initial data changes separately
  useEffect(() => {
    if (editorInstanceRef.current && initialData?.blocks) {
      editorInstanceRef.current.render({ blocks: initialData.blocks }).then(() => {
  // setTimeout(applyHeaderStyles, 100); // Removed undefined function
      }).catch(error => {
        console.error('Error rendering initial data:', error);
      });
    }
  }, [initialData]);

  useImperativeHandle(ref, () => ({
    restorePageData: (page) => {
      if (editorInstanceRef.current && page?.blocks) {
        editorInstanceRef.current.render({ blocks: page.blocks }).then(() => {
          // setTimeout(applyHeaderStyles, 100); // Removed undefined function
        }).catch(error => {
          console.error('Error restoring page data:', error);
        });
      }
    },
  }));

  return (
    <div
      style={{
        width: '1088px',
        minHeight: '1540px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        id={editorId}
        ref={editorContainerRef}
        style={{
          height: '100%',
          maxHeight: '1400px',
          minHeight: '150px',
          fontSize: '20px',
          lineHeight: '1.8',
          padding: '48px 64px',
          fontFamily: 'Lato, sans-serif',
          color: 'rgb(14, 19, 40)',
          textAlign: 'justify',
          overflow: 'hidden',
          position: 'relative',
        }}
      />
      
      <Footer pageNumber={pageNumber} />
    </div>
  );
});

export default PolicyPage;