import React from 'react';
import './DataType.css';

const VARIANT_CONFIG = {
  variable: {
    icon: 'data_object',
    label: 'Variable',
    borderColor: 'rgba(25, 118, 210, 0.3)',
    iconBg: 'rgba(25, 118, 210, 0.08)',
    iconColor: '#1976d2',
  },
  document: {
    icon: 'draft',
    label: 'Document',
    borderColor: 'rgba(46, 125, 50, 0.3)',
    iconBg: 'rgba(46, 125, 50, 0.08)',
    iconColor: '#2e7d32',
  },
  link: {
    icon: 'link',
    label: 'link',
    borderColor: 'rgba(152, 0, 109, 0.2)',
    iconBg: '#ffe8f8',
    iconColor: '#98006d',
  },
  tool: {
    icon: 'build',
    label: 'Tool',
    borderColor: '#c8d0dc',
    iconBg: '#f5f7fa',
    iconColor: '#616161',
  },
};

export default function DataType({ type = 'variable', label, onRemove }) {
  const config = VARIANT_CONFIG[type];
  const displayLabel = label ?? config.label;

  return (
    <div className="data-type" style={{ borderColor: config.borderColor }}>
      <div
        className="data-type__icon-container"
        style={{ background: config.iconBg, borderRightColor: config.borderColor, color: config.iconColor }}
      >
        <span className="material-symbols-outlined">{config.icon}</span>
      </div>
      <span className="data-type__label">{displayLabel}</span>
      {onRemove && (
        <button className="data-type__close" onClick={onRemove} aria-label="Remove">
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}
