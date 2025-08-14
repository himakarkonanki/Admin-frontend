import React from 'react';
import Footer from './Footer';

function PolicyPagePreview({ data, pageNumber, isPDFMode = false }) {
  console.log('PolicyPagePreview received data:', data);
  if (!data) return <div>No policy data available.</div>;

  const getInlineStyles = () => ({
    container: {
      width: '1088px',
      minHeight: '1540px',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    },
    // contentWrapper: {
    //   flex: 1,
    //   marginTop: '32px',
    //   marginBottom: '32px',
    //   border: 'none',
    //   padding: '16px',
    //   borderRadius: '4px',
    //   backgroundColor: '#fff',
    //   position: 'relative',
    //   minHeight: '200px',
    //   height: 'auto',
    // },
    contentArea: {
        height: '100%',
            maxHeight: '1400px',
            minHeight: '150px',
            fontSize: '20px',
            lineHeight: '1.8',
            padding: '48px 64px',
            fontFamily: 'Lato, sans-serif',
            color: 'rgb(14, 19, 40)',
            textAlign: 'justify',
            overflow:'hidden',
            position: 'relative',
    },

    // tables
    table: {
      borderCollapse: 'collapse',
      width: '100%',
      margin: '16px 0',
      border: 'none',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'table',
      position: 'relative',
      clear: 'both',
      fontFamily: 'Lato, sans-serif',
      backgroundColor: '#fff',
      pageBreakInside: 'avoid',
      WebkitPrintColorAdjust: 'exact',
      colorAdjust: 'exact',
    },
    headerCell: {
      backgroundColor: 'rgb(14, 19, 40)',
      color: '#ffffff',
      fontWeight: '600',
      fontFamily: 'Lato, sans-serif',
      fontSize: '20px',
      padding: '12px',
      border: 'none',
      textAlign: 'left',
      minHeight: '44px',
      verticalAlign: 'top',
      WebkitPrintColorAdjust: 'exact',
      colorAdjust: 'exact',
    },
    dataCell: {
      backgroundColor: '#ffffff',
      color: 'rgb(14, 19, 40)',
      fontFamily: 'Lato, sans-serif',
      fontWeight: '400',
      fontSize: '20px',
      padding: '12px 8px 12px 12px',
      border: 'none',
      textAlign: 'left',
      minHeight: '44px',
      verticalAlign: 'top',
      WebkitPrintColorAdjust: 'exact',
      colorAdjust: 'exact',
    },
    evenRowCell: {
      backgroundColor: '#f9fafb',
      color: 'rgb(14, 19, 40)',
      fontFamily: 'Lato, sans-serif',
      fontWeight: '400',
      fontSize: '20px',
      padding: '12px 8px 12px 12px',
      border: 'none',
      textAlign: 'left',
      minHeight: '44px',
      verticalAlign: 'top',
      WebkitPrintColorAdjust: 'exact',
      colorAdjust: 'exact',
    },

    // lists
    listBase: {
      margin: '16px 0',
      paddingLeft: '24px',
      fontSize: '20px',
      lineHeight: '1.6',
      fontFamily: 'Lato, sans-serif',
      color: 'rgb(14, 19, 40)',
      whiteSpace: 'normal',
    },
    listUl: { listStyleType: 'disc' },
    listOl: { listStyleType: 'decimal' },
    listItem: {
      marginBottom: '8px',
      fontSize: '20px',
      lineHeight: '1.6',
      fontFamily: 'Lato, sans-serif',
      color: 'rgb(14, 19, 40)',
    },



    // headers / paragraph
    h1: { fontSize: '32px', fontWeight: '700', lineHeight: '1.2', margin: '24px 0 16px', color: 'rgb(14, 19, 40)', fontFamily: 'Lato, sans-serif' },
    h2: { fontSize: '28px', fontWeight: '600', lineHeight: '1.3', margin: '20px 0 14px', color: 'rgb(14, 19, 40)', fontFamily: 'Lato, sans-serif' },
    h3: { fontSize: '24px', fontWeight: '600', lineHeight: '1.4', margin: '18px 0 12px', color: 'rgb(14, 19, 40)', fontFamily: 'Lato, sans-serif' },
    h4: { fontSize: '22px', fontWeight: '600', lineHeight: '1.4', margin: '16px 0 10px', color: 'rgb(14, 19, 40)', fontFamily: 'Lato, sans-serif' },
    paragraph: { marginBottom: '16px', fontSize: '20px', lineHeight: '1.6', fontFamily: 'Lato, sans-serif', color: 'rgb(14, 19, 40)' },

    quoteCaption: { fontSize: '16px', color: '#6b7280', fontFamily: 'Lato, sans-serif', fontStyle: 'normal', marginTop: '8px' },

    noData: { color: '#9CA3AF', fontStyle: 'italic', fontSize: '20px', fontFamily: 'Lato, sans-serif' }
  });

  const styles = getInlineStyles();

  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'header': {
        const level = block.data.level || 1;
        const HeaderTag = `h${level}`;
        const headerStyle = styles[`h${level}`] || styles.h1;
        return React.createElement(HeaderTag, {
          key: index,
          style: headerStyle,
          dangerouslySetInnerHTML: { __html: block.data.text || '' }
        });
      }

      case 'paragraph':
        return (
          <div
            key={index}
            style={styles.paragraph}
            dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
          />
        );

      case 'list': {
        const listStyle = block.data.style || 'unordered';
        
        // Handle checklist separately
        if (listStyle === 'checklist') {
          const items = block.data.items || [];
          return (
            <div key={index} style={styles.checklistContainer}>
              {items.map((item, i) => {
                const isChecked = !!item.checked;
                const itemText = typeof item === 'string' ? item : (item.text || item.content || '');
                return (
                  <div key={i} style={styles.checklistItem}>
                    <div style={isChecked ? styles.checkedBox : styles.checkbox}>
                      {isChecked && '✓'}
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: itemText }} />
                  </div>
                );
              })}
            </div>
          );
        }
        
        // Handle regular lists (ordered/unordered)
        const ListTag = listStyle === 'ordered' ? 'ol' : 'ul';
        const listStyleFix = listStyle === 'ordered' ? styles.listOl : styles.listUl;
        // Inline style fix for ordered list number alignment
        const orderedListInlineFix = listStyle === 'ordered' ? {
          paddingLeft: '2.5em',
          listStylePosition: 'outside',
        } : {};
        return (
          <ListTag
            key={index}
            style={{ ...styles.listBase, ...listStyleFix, ...orderedListInlineFix }}
          >
            {(block.data.items || []).map((item, i) => {
              // Nested list support for nested-list plugin
              if (typeof item === 'object' && item.items && Array.isArray(item.items)) {
                return (
                  <li key={i} style={styles.listItem}>
                    <span dangerouslySetInnerHTML={{ __html: item.content || item.text || '' }} />
                    <ListTag style={{ ...styles.listBase, ...listStyleFix, ...orderedListInlineFix }}>
                      {item.items.map((subItem, j) => (
                        <li key={j} style={styles.listItem}>
                          <span dangerouslySetInnerHTML={{ __html: subItem.content || subItem.text || '' }} />
                        </li>
                      ))}
                    </ListTag>
                  </li>
                );
              }
              return (
                <li key={i} style={styles.listItem}>
                  <span dangerouslySetInnerHTML={{ __html: item.content || item.text || item || '' }} />
                </li>
              );
            })}
          </ListTag>
        );
      }

      case 'table': {
        const tableData = block.data.content || [];
        const withHeadings = block.data.withHeadings !== false;
        if (!tableData.length) return null;

        return (
          <table key={index} style={styles.table}>
            {withHeadings ? (
              <>
                <thead>
                  <tr>
                    {tableData[0].map((cell, ci) => (
                      <th key={ci} style={styles.headerCell}>
                        <span style={{ color: '#fff', fontWeight: '600', display: 'block', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}>
                          {cell && cell.trim() !== '' ? cell : `Column ${ci + 1}`}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.slice(1).map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={ri % 2 === 0 ? styles.dataCell : styles.evenRowCell}>
                          <span style={{ color: 'rgb(14, 19, 40)', fontWeight: '400', display: 'block' }}>
                            {cell && cell.trim() !== '' ? cell : '\u00A0'}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </>
            ) : (
              <tbody>
                {tableData.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={ri === 0 ? styles.headerCell : (ri % 2 === 1 ? styles.dataCell : styles.evenRowCell)}
                      >
                        <span
                          style={{
                            color: ri === 0 ? '#ffffff' : 'rgb(14, 19, 40)',
                            fontWeight: ri === 0 ? '600' : '400',
                            display: 'block',
                            WebkitPrintColorAdjust: 'exact',
                            colorAdjust: 'exact'
                          }}
                        >
                          {cell && cell.trim() !== '' ? cell : (ri === 0 ? `Column ${ci + 1}` : '\u00A0')}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* <div style={styles.contentWrapper}> */}
        <div style={styles.contentArea}>
          {data.blocks && data.blocks.length > 0 ? (
            data.blocks.map((block, i) => renderBlock(block, i))
          ) : data.fields && data.fields.length > 0 ? (
            // legacy fallback
            data.fields.map(field => {
              if (field.type === 'title') {
                const level = field.level || 1;
                const HeaderTag = `h${level}`;
                const headerStyle = styles[`h${level}`] || styles.h1;
                return React.createElement(HeaderTag, { key: field.id, style: headerStyle, dangerouslySetInnerHTML: { __html: field.content } });
              } else if (field.type === 'details') {
                return <div key={field.id} style={styles.paragraph} dangerouslySetInnerHTML={{ __html: field.content }} />;
              } else if (field.type === 'table') {
                return (
                  <table key={field.id} style={styles.table}>
                    <tbody>
                      {field.content.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} style={i === 0 ? styles.headerCell : (i % 2 === 1 ? styles.dataCell : styles.evenRowCell)}>
                              <span
                                style={{
                                  color: i === 0 ? '#ffffff' : 'rgb(14, 19, 40)',
                                  fontWeight: i === 0 ? '600' : '400',
                                  display: 'block',
                                  WebkitPrintColorAdjust: 'exact',
                                  colorAdjust: 'exact'
                                }}
                              >
                                {cell && cell.trim() !== '' ? cell : (i === 0 ? `Column ${j + 1}` : '\u00A0')}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              } else if (field.type === 'list') {
                const ListTag = field.style === 'ordered' ? 'ol' : 'ul';
                const listItems = Array.isArray(field.content)
                  ? field.content.map(item => (typeof item === 'string' ? item : (item.content || item.text || item.value || ''))).filter(Boolean)
                  : [];
                return (
                  <ListTag
                    key={field.id}
                    style={{ ...styles.listBase, ...(field.style === 'ordered' ? styles.listOl : styles.listUl) }}
                  >
                    {listItems.map((item, idx) => (
                      <li key={idx} style={styles.listItem} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ListTag>
                );
              } else if (field.type === 'checklist') {
                const items = field.content || [];
                return (
                  <div key={field.id} style={styles.checklistContainer}>
                    {items.map((it, i) => (
                      <div key={i} style={styles.checklistItem}>
                        <div style={it.checked ? styles.checkedBox : styles.checkbox}>{it.checked && '✓'}</div>
                        <span dangerouslySetInnerHTML={{ __html: it.text || '' }} />
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })
          ) : (
            <div style={styles.noData}>No policy details provided.</div>
          )}
        </div>
      

      <Footer pageNumber={pageNumber} />
    </div>
  );
}

export default PolicyPagePreview;