import React from 'react'




function Popup() {
  return (
    <div style={{
      display: 'flex',
      width: '480px',
      flexDirection: 'column',
      alignItems: 'flex-start',
      flexShrink: 0,
      borderRadius: '20px',
      background: '#FFF',
      boxShadow: '0 30px 60px -12px rgba(50, 50, 93, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.30)'
    }}>
      <div style={{ //Title
        display: 'flex',
        padding: '32px 32px 12px 32px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '4px',
        alignSelf: 'stretch'
      }}>
        <div style={{ //user
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch'
        }}>
          <div style={{ //content
            flex: '1 0 0',
            color: '#0E1328',
            fontFamily: 'Lato',
            fontSize: '24px',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: '36px'
          }}>
            Discard Changes
          </div>
        </div>

        <div style={{ //span
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch'
        }}>
          
        </div>
      </div>
        <div style={{ //content
        display: 'flex',
        padding: '12px 32px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '16px',
        alignSelf: 'stretch',
        color: '#0E1328'
      }}>
         <div style={{ //fields
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '12px',
          alignSelf: 'stretch'
        }}>
            <div style={{ //text
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px',
            alignSelf: 'stretch'
          }}>
            
          </div>
          
        </div>
          <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          alignSelf: 'stretch'
        }}>
          <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          alignSelf: 'stretch'
        }}>
          Reloading the page will delete all the information you've entered. Please make sure to save your changes before continuing.
        </div>

        </div>

      </div>

      <div style={{
        display: 'flex',
        padding: '12px 32px 24px 32px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        alignSelf: 'stretch',
        background: '#FFF'
      }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          alignSelf: 'stretch'
        }}>
          
          
          <button style={{
            display: 'flex',
            height: '48px',
            padding: '8px 20px 8px 24px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            flex: '1 0 0',
            borderRadius: '46px',
            background: '#D51212',
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '25.6px',
            border: 'none',
            cursor: 'pointer'
          }}>
            Discard Changes
          </button>

          <button style={{
            display: 'flex',
            height: '48px',
            padding: '8px 24px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            flex: '1 0 0',
            borderRadius: '36px',
            background: 'rgba(14, 19, 40, 0.06)',
            color: '#0E1328',
            textAlign: 'center',
            fontFamily: 'Roboto',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '25.6px',
            border: 'none',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
          
        </div>
        
      </div>

    </div>
  )
}

export default Popup;