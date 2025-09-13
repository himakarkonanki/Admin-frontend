import React, { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import company from '../assets/icons/companyLogo.svg'

import drag_indicator from '../assets/icons/drag_indicator.svg'
import add_circle from '../assets/icons/Thumbnail.svg'
import more_vertical from '../assets/icons/more_vert.svg'
import EditorBarForLeftPanel from './EditorBarForLeftPanel'
import DuplicatePageTray from './DuplicatePageTray'
import ThumbnailGenerator from './ThumbnailGenerator'
import ThankYouImage from '../assets/icons/Thankthumbnail.svg'

// Sortable Item Component
function SortablePageItem({
  page,
  hoveredItem,
  setHoveredItem,
  handlePageMenuClick,
  showPageMenu,
  pageMenuRef,
  handleDuplicate,
  handleDelete,
  pages,
  PageThumbnail,
  onPageClick // Add this prop
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const getPageItemStyle = (isHovered) => ({
    display: 'flex',
    width: '100%',
    padding: '4px 4px 4px 0',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: '0',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'none',
  })

  // Handle page click for scrolling
  const handlePageItemClick = (e) => {
    if (e.target.closest('[data-drag-handle]') || e.target.closest('[data-more-menu]')) {
      return;
    }
    onPageClick(page.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sortable-page-item"
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={getPageItemStyle(hoveredItem === `page-${page.id}`)}
          onMouseEnter={() => setHoveredItem(`page-${page.id}`)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={handlePageItemClick}
        >
          {(page.type === 'day' || page.type === 'policy') && (
            <div
              {...attributes}
              {...listeners}
              data-drag-handle="true"
              style={{
                width: '20px',
                height: '20px',
                aspectRatio: '1 / 1',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none'
              }}
            >
              <img
                src={drag_indicator}
                alt='drag-indicator'
                style={{
                  opacity: isDragging ? 1 : 0.7,
                  transition: 'opacity 0.2s ease-in-out'
                }}
              />
            </div>
          )}
          {(page.type !== 'day' && page.type !== 'policy') && (
            <div style={{ width: '20px', height: '20px', aspectRatio: '1 / 1' }} />
          )}
          <PageThumbnail pageType={page.type} pageId={page.id} />
          <div style={{
            display: 'flex',
            padding: '0 8px',
            alignItems: 'center',
            flex: '1 0 0',
          }}>
            <div style={{
              flex: '1 0 0',
              color: '#FFF',
              fontFamily: 'Lato',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: (hoveredItem === `page-${page.id}` ? 700 : 400),
              lineHeight: '20px',
            }}>
              {page.type === 'policy' ? 'Terms & Conditions' :
                page.type === 'day'
                  ? `Day ${pages.filter(p => p.type === 'day').findIndex(p => p.id === page.id) + 1}`
                  : page.title}
            </div>
          </div>
          <div
            data-more-menu="true"
            style={{
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: hoveredItem === `page-${page.id}` ? 1 : 0.7,
              transition: 'opacity 0.2s ease-in-out',
            }}
            onClick={(e) => handlePageMenuClick(page.id, page.type, e)}
          >
            <img
              src={more_vertical}
              alt='more options'
              style={{
                width: '16px',
                height: '16px',
                filter: 'brightness(0) invert(1)',
              }}
            />
          </div>
        </div>
        {showPageMenu === page.id && (
          <div
            ref={pageMenuRef}
            style={{
              position: 'absolute',
              top: '100%',
              right: '0px',
              zIndex: 1001,
              marginTop: '4px',
            }}
          >
            <DuplicatePageTray
              pageId={page.id}
              pageType={page.type}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function LeftPanel({
  pages,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onReorderPages,
  onPageClick // Add this prop
}) {
  // Thumbnail logic, hooks, sensors, utilities -- unchanged...

  const PageThumbnail = ({ pageType, pageId }) => {
    const page = pages.find(p => p.id === pageId);
    if (pageType === 'thankyou') {
      return (
        <div
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(199deg, rgba(139, 35, 243, 0.08) 25.35%, rgba(139, 35, 243, 0.08) 50.01%, rgba(243, 63, 63, 0.08) 74.65%), #0E1328',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <img src={ThankYouImage} alt="Thank You" style={{ width: '250%', height: '200%', objectFit: 'fill' }} />
        </div>
      );
    }
    return (
      <div
        style={{
          width: '40px',
          height: '40px',
          aspectRatio: '200 / 280',
          borderRadius: '8px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          background: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <ThumbnailGenerator page={page} />
      </div>
    );
  }

  const [hoveredItem, setHoveredItem] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPageMenu, setShowPageMenu] = useState(null)
  const dropdownRef = useRef(null)
  const pageMenuRef = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
    // Logout handler
    const handleLogout = () => {
      if (typeof onLogout === 'function') {
        onLogout();
      } else {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.reload();
      }
    }

  const getPageItemStyle = (isHovered) => ({
    display: 'flex',
    width: '100%',
    padding: '4px 4px 4px 0',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: '0',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'none',
  })

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const reorderablePages = pages.filter(page => page.type === 'day' || page.type === 'policy')
    const oldIndex = reorderablePages.findIndex(page => page.id === active.id)
    const newIndex = reorderablePages.findIndex(page => page.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedPages = arrayMove(reorderablePages, oldIndex, newIndex)
      const coverPage = pages.find(page => page.type === 'cover')
      const thankyouPage = pages.find(page => page.type === 'thankyou')
      const newPages = [
        ...(coverPage ? [coverPage] : []),
        ...reorderedPages,
        ...(thankyouPage ? [thankyouPage] : [])
      ]
      onReorderPages(newPages)
    }
  }

  const handleScrollToPage = (pageId) => {
    const pageElement = document.getElementById(`page-${pageId}`) || document.querySelector(`[data-page-id='${pageId}']`);
    if (pageElement) {
      const offset = 0;
      const rect = pageElement.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    if (onPageClick) {
      onPageClick(pageId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (pageMenuRef.current && !pageMenuRef.current.contains(event.target)) {
        setShowPageMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleAddPageClick = () => {
    setShowDropdown(!showDropdown)
    setShowPageMenu(null)
  }

  const handlePageTypeSelect = (pageType) => {
        <div onClick={handleLogout} />
    onAddPage(pageType)
    setShowDropdown(false)
  }

  const handlePageMenuClick = (pageId, pageType, event) => {
    event.stopPropagation()
    if (pageType === 'day' || pageType === 'policy') {
      setShowPageMenu(showPageMenu === pageId ? null : pageId)
      setShowDropdown(false)
    }
  }

  const handleDuplicate = (pageId) => {
    onDuplicatePage(pageId)
    setShowPageMenu(null)
  }
  const handleDelete = (pageId) => {
    onDeletePage(pageId)
    setShowPageMenu(null)
  }

  const renderStaticPageItem = (pageType, title, hoverId) => {
    const page = pages.find(p => p.type === pageType);
    return (
      <div
        style={getPageItemStyle(hoveredItem === hoverId)}
        onMouseEnter={() => setHoveredItem(hoverId)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => page && handleScrollToPage(page.id)}
      >
        <div style={{ width: '20px', height: '20px', aspectRatio: '1 / 1' }} />
        <PageThumbnail pageType={pageType} pageId={page ? page.id : undefined} />
        <div style={{
          display: 'flex',
          padding: '0 8px',
          alignItems: 'center',
          flex: '1 0 0',
        }}>
          <div style={{
            flex: '1 0 0',
            color: '#FFF',
            fontFamily: 'Lato',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '20px',
          }}>
            {title}
          </div>
        </div>
      </div>
    );
  }

  const reorderablePages = pages.filter(page => page.type === 'day' || page.type === 'policy')
  const reorderablePageIds = reorderablePages.map(page => page.id)

  // Inject custom CSS for a white scrollbar
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .pages-scroll-container::-webkit-scrollbar {
        width: 8px;
        height: 0px;
      }
      .pages-scroll-container::-webkit-scrollbar-thumb {
        background: #e0e0e0;
        border-radius: 4px;
      }
      .pages-scroll-container::-webkit-scrollbar-track {
        background: transparent;
      }
      .pages-scroll-container {
        overflow-x: hidden !important;
      }
    `;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '320px',
        height: '100vh',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '32px',
        background: "linear-gradient(199deg, rgba(139, 35, 243, 0.08) 25.35%, rgba(139, 35, 243, 0.08) 50.01%, rgba(243, 63, 63, 0.08) 74.65%), #0E1328",
        zIndex: 20,
        boxSizing: 'border-box',
      }}
    >
      <div style={{
        display: "flex",
        height: "88px",
        padding: "16px 32px 8px 0",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "32px",
        flexShrink: 0,
        alignSelf: "stretch",
        borderRadius: "16px",
      }}>
        <img
          src={company}
          alt='companyLogo'
          style={{
            height: '60px',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "16px",
        width: '100%',
      }}>
        <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "2px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              alignSelf: "stretch",
              padding: "4px 0",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                color: "rgba(255, 255, 255, 0.70)",
                fontFamily: "Lato",
                fontSize: "12px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "18px",
                textTransform: "uppercase",
              }}
            >
              Template
            </div>
          </div>
        </div>
        <div style={{
          height: '1px',
          alignSelf: 'stretch',
          borderRadius: '2px',
          background: 'rgba(255, 255, 255, 0.08)',
          width: '100%',
        }}></div>
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '8px',
          }}>
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.70)',
              fontFamily: 'Lato',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '18px',
              textTransform: 'uppercase',
            }}
          >
            Pages
          </div>

          {/* ================ BEGIN SCROLLABLE CONTAINER ================ */}
           <div
             className="pages-scroll-container"
             style={{
               width: '100%',
               maxHeight: pages.length > 4 ? '204px' : 'none',
               overflowY: pages.length > 4 ? 'auto' : 'visible',
               marginBottom: '8px',
               transition: 'max-height 0.2s',
             }}
           >
            {pages.some(page => page.type === 'cover') &&
              renderStaticPageItem('cover', 'Cover Page', 'cover')
            }
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={reorderablePageIds}
                strategy={verticalListSortingStrategy}
              >
                <div style={{ width: '100%' }}>
                  {reorderablePages.map((page) => (
                    <SortablePageItem
                      key={page.id}
                      page={page}
                      hoveredItem={hoveredItem}
                      setHoveredItem={setHoveredItem}
                      handlePageMenuClick={handlePageMenuClick}
                      showPageMenu={showPageMenu}
                      pageMenuRef={pageMenuRef}
                      handleDuplicate={handleDuplicate}
                      handleDelete={handleDelete}
                      pages={pages}
                      PageThumbnail={PageThumbnail}
                      onPageClick={handleScrollToPage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {pages.some(page => page.type === 'thankyou') &&
              renderStaticPageItem('thankyou', 'Thank You Page', 'thankyou')
            }
          </div>
          {/* ================ END SCROLLABLE CONTAINER ================ */}

          <div
            ref={dropdownRef}
            style={{
              position: 'relative',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '4px 4px 4px 20px',
                alignItems: 'center',
                alignSelf: 'stretch',
                borderTop: '1px dashed rgba(255, 255, 255, 0.24)',
                borderBottom: '1px dashed rgba(255, 255, 255, 0.24)',
                cursor: 'pointer',
                background: hoveredItem === 'add-page' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={handleAddPageClick}
              onMouseEnter={() => setHoveredItem('add-page')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div style={{
                width: '40px',
                height: '40px',
                aspectRatio: '1 / 1',
                color: '#F33F3F'
              }}>
                <img src={add_circle} alt='add icon' />
              </div>
              <div style={{
                display: 'flex',
                padding: '0 8px',
                alignItems: 'center',
                flex: '1 0 0',
              }}>
                <div style={{
                  color: hoveredItem === 'add-page' ? '#FF5555' : '#F33F3F',
                  fontFamily: 'Lato',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '20px',
                  flex: '1 0 0',
                  transition: 'color 0.2s ease-in-out',
                }}>
                  Add Page
                </div>
              </div>
            </div>
            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '20px',
                  zIndex: 1000,
                  marginTop: '4px',
                }}
              >
                <EditorBarForLeftPanel onPageSelect={handlePageTypeSelect} />
              </div>
            )}
          </div>
        </div>

      </div>
      <div style={{ flexGrow: 1 }} />
      <button
        type="button"
        style={{
          width: '100%',
          display: 'flex',
          height: '54px',
          padding: '12px 20px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          alignSelf: 'stretch',
          borderRadius: '24px',
          background: '#F33F3F',
          cursor: 'pointer',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
          marginBottom: 0
        }}
        onClick={handleLogout}
      >
        <div style={{
          color: 'var(--White, #FFF)',
          textAlign: 'center',
          fontFamily: 'Lato',
          fontSize: '20px',
          fontStyle: 'normal',
          fontWeight: 600,
          lineHeight: '20px',
        }}>
          Log out
        </div>
      </button>

    </div>
  )
}

export default LeftPanel
