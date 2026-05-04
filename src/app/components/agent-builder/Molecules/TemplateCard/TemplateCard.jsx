import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';

const font = '"Roboto", sans-serif';

export default function TemplateCard({ title, description, onUse, onTitleClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: 256,
        background: hovered ? '#e5e9f0' : '#fff',
        border: '1px solid #e5e9f0',
        borderRadius: 8,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        transition: 'background 0.15s ease',
        boxSizing: 'border-box',
        cursor: 'default',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
        <p
          onClick={onTitleClick}
          style={{
            fontFamily: font,
            fontSize: 16,
            fontWeight: 400,
            lineHeight: '24px',
            letterSpacing: '-0.32px',
            color: '#212121',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            cursor: onTitleClick ? 'pointer' : 'default',
            textDecoration: hovered && onTitleClick ? 'underline dotted' : 'none',
            textDecorationColor: hovered && onTitleClick ? '#bdbdbd' : 'transparent',
          }}
        >
          {title}
        </p>
        <p style={{
          fontFamily: font,
          fontSize: 14,
          fontWeight: 400,
          lineHeight: '20px',
          letterSpacing: '-0.28px',
          color: '#555',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {description}
        </p>
      </div>

      {hovered && (
        <Button size="sm" onClick={onUse}>Use agent</Button>
      )}
    </div>
  );
}
