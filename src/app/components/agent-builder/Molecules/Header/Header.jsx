import React from 'react';
import { Button } from '@/app/components/ui/button';

const font = '"Roboto", sans-serif';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 -960 960 960" fill="#616161">
    <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 -960 960 960" fill="#616161">
    <path d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z"/>
  </svg>
);

export default function Header({
  title = '',
  primaryAction = null,
  onSearch,
  onFilter,
  showSearch = true,
  showFilter = true,
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 24px',
      background: '#ffffff',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: font,
    }}>
      <div style={{ flex: '1 0 0', minWidth: 0 }}>
        <p style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 400,
          lineHeight: '26px',
          letterSpacing: '-0.36px',
          color: '#212121',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {title}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {showSearch && (
          <Button variant="outline" size="icon" onClick={onSearch} aria-label="Search">
            <SearchIcon />
          </Button>
        )}
        {primaryAction && (
          <Button onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        )}
        {showFilter && (
          <Button variant="ghost" size="icon" onClick={onFilter} aria-label="Filter">
            <FilterIcon />
          </Button>
        )}
      </div>
    </div>
  );
}
