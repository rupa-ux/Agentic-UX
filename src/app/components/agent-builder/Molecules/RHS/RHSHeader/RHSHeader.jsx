import React from 'react';
import { Button } from '@/app/components/ui/button';
import PlayArrowIcon from './icons/play_arrow.svg';
import ExpandAllIcon from './icons/expand_all.svg';
import CloseIcon from './icons/close.svg';

export default function RHSPanelHeader({
  title = 'Title',
  onPreview,
  onExpand,
  onClose,
  showActions = true,
}) {
  const svgStyle = { width: 24, height: 24, display: 'block' };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 15px',
      height: 60,
      background: '#ffffff',
      borderTop: '1px solid #e5e9f0',
      borderLeft: '1px solid #e5e9f0',
      borderRight: '1px solid #e5e9f0',
      borderRadius: '8px 8px 0 0',
      boxSizing: 'border-box',
    }}>
      <span style={{
        fontSize: 16,
        fontWeight: 400,
        lineHeight: '24px',
        letterSpacing: '-0.32px',
        color: '#555555',
        fontFamily: '"Roboto", arial, sans-serif',
      }}>
        {title}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Button variant="ghost" size="icon" onClick={onPreview} aria-label="Preview">
          <img src={PlayArrowIcon} alt="Preview" style={svgStyle} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onExpand} aria-label="Expand">
          <img src={ExpandAllIcon} alt="Expand" style={svgStyle} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <img src={CloseIcon} alt="Close" style={svgStyle} />
        </Button>
      </div>
    </div>
  );
}
