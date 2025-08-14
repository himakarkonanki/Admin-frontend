import React, { useRef, useState, useEffect } from 'react';
import calendar from '../assets/icons/date_range.svg';
import left from '../assets/icons/chevron-left-double.svg';
import singleleft from '../assets/icons/chevron-left.svg';
import singleright from '../assets/icons/chevron-right.svg';
import right from '../assets/icons/chevron-right-double.svg';

function TripDurationPicker({ value, onChange, isPreview = false }) {
  const [dateRange, setDateRange] = useState([null, null]);
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const pickerRef = useRef();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Create a proper today date for comparison
  const getTodayForComparison = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Parse value prop to Date objects (startDate, endDate)
  useEffect(() => {
    if (!value) {
      setDateRange([null, null]);
      setRangeStart(null);
      setRangeEnd(null);
      setSelectedDates(new Set());
      return;
    }
    const parts = value.split(' - ');
    if (parts.length === 2) {
      const start = new Date(parts[0]);
      const end = new Date(parts[1]);
      if (!isNaN(start) && !isNaN(end)) {
        setDateRange([start, end]);
        setRangeStart(start);
        setRangeEnd(end);

        // Update selected dates set for range
        const newSelectedDates = new Set();
        const currentDate = new Date(start);
        while (currentDate <= end) {
          newSelectedDates.add(currentDate.toDateString());
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setSelectedDates(newSelectedDates);
      }
    }
  }, [value]);

  // Click outside listener to close calendar popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const formatDate = (date) =>
    date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const hasSelectedDates = dateRange[0] && dateRange[1];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();

    const days = [];

    // Add previous month's days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isNextMonth: false,
        fullDate: new Date(year, month - 1, prevMonthDays - i)
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false,
        fullDate: new Date(year, month, day)
      });
    }

    // Add next month's days to fill the grid
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true,
        fullDate: new Date(year, month + 1, day)
      });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateYear = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + direction);
    setCurrentDate(newDate);
  };

  const isPastDate = (date) => {
    const today = getTodayForComparison();
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Range selection logic with fixed date comparison
  const toggleDateSelection = (dateObj) => {
    if (!dateObj.isCurrentMonth) return;

    if (isPastDate(dateObj.fullDate)) {
      console.log('Cannot select past date:', dateObj.fullDate.toDateString());
      return;
    }

    const clickedDate = new Date(dateObj.fullDate);
    clickedDate.setHours(0, 0, 0, 0);

    console.log('Selecting date:', clickedDate.toDateString());

    // Range selection logic
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(clickedDate);
      setRangeEnd(null);
      setSelectedDates(new Set([clickedDate.toDateString()]));
    } else if (rangeStart && !rangeEnd) {
      const start = clickedDate < rangeStart ? clickedDate : rangeStart;
      const end = clickedDate < rangeStart ? rangeStart : clickedDate;

      setRangeStart(start);
      setRangeEnd(end);

      const newSelectedDates = new Set();
      const currentDate = new Date(start);
      while (currentDate <= end) {
        newSelectedDates.add(currentDate.toDateString());
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setSelectedDates(newSelectedDates);
    }
  };

  const clearAllDates = () => {
    setSelectedDates(new Set());
    setRangeStart(null);
    setRangeEnd(null);
    setDateRange([null, null]);
    if (onChange) onChange('');
  };

  const applySelection = () => {
    if (rangeStart && rangeEnd) {
      setDateRange([rangeStart, rangeEnd]);
      const formatted = `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`;
      if (onChange) onChange(formatted);
      setOpen(false);
    } else if (rangeStart && !rangeEnd) {
      setDateRange([rangeStart, rangeStart]);
      const formatted = `${formatDate(rangeStart)} - ${formatDate(rangeStart)}`;
      if (onChange) onChange(formatted);
      setOpen(false);
    }
  };

  // Preview mode with transparent background
  if (isPreview) {
    return (
      <div
        style={{
          height: '64px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'transparent',
          borderRadius: '16px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <div
          style={{
            color: hasSelectedDates ? '#FFFFFF' : 'rgba(242, 244, 254, 0.12)',
            fontFamily: 'Lato',
            fontSize: hasSelectedDates ? '24px' : '24px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '1.2',
            userSelect: 'none',
            flex: 1,
            paddingBottom: '2px',
          }}
        >
          {hasSelectedDates ? `${formatDate(dateRange[0])} - ${formatDate(dateRange[1])}` : 'Select Dates'}
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);

  // UPDATED: Smaller Calendar styles
  const styles = {
    container: {
      position: 'absolute',
      top: '70px',
      right: '-250px', // REDUCED: From -250px to -200px
      zIndex: 9999,
      display: 'flex',
      padding: '16px 12px', // REDUCED: From 24px 16px to 16px 12px
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '20px', // REDUCED: From 32px to 20px
      borderRadius: '12px', // REDUCED: From 16px to 12px
      border: '1px solid #FAFAFA',
      background: '#FFFFFF',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    header: {
      display: 'flex',
      width: '252px', // REDUCED: From 343px to 252px
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    navButton: {
      display: 'flex',
      width: '24px', // REDUCED: From 32px to 24px
      height: '24px', // REDUCED: From 32px to 24px
      padding: '4px', // REDUCED: From 8px to 4px
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '6px', // REDUCED: From 8px to 6px
      border: '1px solid #E4E4E7',
      background: '#FFFFFF',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    monthYear: {
      color: '#011928',
      fontSize: '14px', // REDUCED: From 16px to 14px
      fontWeight: 700,
      lineHeight: '20px', // REDUCED: From 24px to 20px
      fontFamily: 'Lato, sans-serif',
    },
    calendarGrid: {
      display: 'flex',
      width: '252px', // REDUCED: From 343px to 252px
      flexDirection: 'column',
      gap: '6px', // REDUCED: From 8px to 6px
    },
    weekRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '4px', // REDUCED: From 8px to 4px
    },
    dayCell: {
      display: 'flex',
      width: '24px', // REDUCED: From 28px to 24px
      height: '24px', // REDUCED: From 28px to 24px
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Lato, sans-serif',
      fontSize: '13px', // REDUCED: From 16px to 13px
      fontWeight: 400,
      lineHeight: '20px', // REDUCED: From 24px to 20px
      cursor: 'pointer',
      borderRadius: '4px', // REDUCED: From 6px to 4px
      transition: 'all 0.2s ease',
    },
    actionButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px', // REDUCED: From 7px to 6px
      alignSelf: 'stretch',
    },
    actionButton: {
      display: 'flex',
      height: '32px', // REDUCED: From 44px to 32px
      padding: '8px 12px', // REDUCED: From 12px 20px to 8px 12px
      justifyContent: 'center',
      alignItems: 'center',
      flex: '1 0 0',
      borderRadius: '8px', // REDUCED: From 12px to 8px
      border: '1px solid #E4E4E7',
      background: '#FFFFFF',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'Lato, sans-serif',
    },
    buttonText: {
      color: '#18181B',
      textAlign: 'center',
      fontSize: '14px', // REDUCED: From 16px to 14px
      fontWeight: 600,
      lineHeight: '20px', // REDUCED: From 24px to 20px
    }
  };

  // Helper function to determine date styling with improved date comparison
  const getDateStyling = (dateObj) => {
    const dateKey = dateObj.fullDate.toDateString();
    const isSelected = selectedDates.has(dateKey);
    const isPastDateFlag = isPastDate(dateObj.fullDate);
    const isRangeStart = rangeStart && dateObj.fullDate.getTime() === rangeStart.getTime();
    const isRangeEnd = rangeEnd && dateObj.fullDate.getTime() === rangeEnd.getTime();
    const isInRange = rangeStart && rangeEnd && dateObj.fullDate > rangeStart && dateObj.fullDate < rangeEnd;

    let backgroundColor = 'transparent';
    let color = dateObj.isCurrentMonth ? '#011928' : '#A1A1AA';

    if (isPastDateFlag) {
      color = '#D1D5DB';
    } else if (isRangeStart || isRangeEnd) {
      backgroundColor = '#F33F3F'; // CHANGED: Red background for start/end dates
      color = '#FFFFFF';
    } else if (isInRange || isSelected) {
      backgroundColor = 'rgba(243, 63, 63, 0.12)'; // CHANGED: Light red background for range
      color = '#F33F3F'; // CHANGED: Red text color
    }

    return {
      backgroundColor,
      color,
      cursor: (dateObj.isCurrentMonth && !isPastDateFlag) ? 'pointer' : 'not-allowed',
      opacity: isPastDateFlag ? 0.5 : 1,
    };
  };

  // Editable mode
  return (
    <div
      ref={pickerRef}
      style={{
        display: 'flex',
        height: '66px',
         padding: '0 16px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        borderRadius: '16px',
        background: 'rgba(242, 244, 254, 0.12)',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => setOpen(!open)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          width: hasSelectedDates ? 'auto' : '108px',
          transition: 'width 0.3s ease-in-out',
          color: hasSelectedDates ? '#FFFFFF' : '#F2F4FE1F',
          fontFamily: 'Lato',
          fontSize: hasSelectedDates ? '24x': '20px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: '1.2',
          userSelect: 'none',
           paddingBottom: '2px', 
        }}
      >
        {hasSelectedDates ? `${formatDate(dateRange[0])} - ${formatDate(dateRange[1])}` : 'Select Dates'}
      </div>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '24px',
          borderRadius: '2px',
          background: 'rgba(255, 255, 255, 0.16)',
          flexShrink: 0,
        }}
      />

      {/* Calendar Icon */}
      <div
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <img src={calendar} alt="Calendar Icon" style={{ width: '30px', height: '30px' }} />
      </div>

      {/* UPDATED: Smaller Custom Calendar Popup */}
      {open && (
        <div style={styles.container}>
          {/* Calendar Body */}
          <div style={{ display: 'flex', width: '252px', flexDirection: 'column', gap: '14px' }}> {/* REDUCED: From 343px and 20px gap */}
            {/* Header with navigation */}
            <div style={styles.header}>
              {/* Left navigation buttons */}
              <div style={{ display: 'flex', gap: '6px' }}> {/* REDUCED: From 8px to 6px */}
                <button
                  style={styles.navButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateYear(-1);
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F4F4F5'}
                  onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
                >
                  <img
                    src={left}
                    alt="Previous Year"
                    style={{ width: '12px', height: '12px', pointerEvents: 'none' }} // REDUCED: From 16px to 12px
                  />
                </button>
                <button
                  style={styles.navButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateMonth(-1);
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F4F4F5'}
                  onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
                >
                  <img
                    src={singleleft}
                    alt="Previous Month"
                    style={{ width: '12px', height: '12px', pointerEvents: 'none' }} // REDUCED: From 16px to 12px
                  />
                </button>
              </div>

              {/* Month and Year display */}
              <div style={styles.monthYear}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>

              {/* Right navigation buttons */}
              <div style={{ display: 'flex', gap: '6px' }}> {/* REDUCED: From 8px to 6px */}
                <button
                  style={styles.navButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateMonth(1);
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F4F4F5'}
                  onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
                >
                  <img
                    src={singleright}
                    alt="Next Month"
                    style={{ width: '12px', height: '12px', pointerEvents: 'none' }} // REDUCED: From 16px to 12px
                  />
                </button>
                <button
                  style={styles.navButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateYear(1);
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F4F4F5'}
                  onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
                >
                  <img
                    src={right}
                    alt="Next Year"
                    style={{ width: '12px', height: '12px', pointerEvents: 'none' }} // REDUCED: From 16px to 12px
                  />
                </button>
              </div>
            </div>

            {/* Calendar grid */}
            <div style={styles.calendarGrid}>
              {/* Week day headers */}
              <div style={styles.weekRow}>
                {weekDays.map((day) => (
                  <div
                    key={day}
                    style={{
                      ...styles.dayCell,
                      color: '#A1A1AA',
                      cursor: 'default',
                      fontSize: '11px', // REDUCED: From 13px to 11px
                      fontWeight: 500,
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              {Array.from({ length: 6 }, (_, rowIndex) => (
                <div key={rowIndex} style={styles.weekRow}>
                  {days.slice(rowIndex * 7, (rowIndex + 1) * 7).map((dateObj, colIndex) => {
                    const dateStyling = getDateStyling(dateObj);
                    const isPastDateFlag = isPastDate(dateObj.fullDate);

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        style={{
                          ...styles.dayCell,
                          ...dateStyling,
                        }}
                        onMouseEnter={(e) => {
                          if (dateObj.isCurrentMonth && !isPastDateFlag && dateStyling.backgroundColor === 'transparent') {
                            e.target.style.backgroundColor = '#F3F4F6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (dateObj.isCurrentMonth && !isPastDateFlag && dateStyling.backgroundColor === 'transparent') {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDateSelection(dateObj);
                        }}
                      >
                        {dateObj.day}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={styles.actionButtons}>
            <button
              style={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                clearAllDates();
              }}
              onMouseEnter={(e) => e.target.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
            >
              <div style={styles.buttonText}>Clear All</div>
            </button>
            <button
              style={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                applySelection();
              }}
              onMouseEnter={(e) => e.target.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
            >
              <div style={styles.buttonText}>Apply</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripDurationPicker;
