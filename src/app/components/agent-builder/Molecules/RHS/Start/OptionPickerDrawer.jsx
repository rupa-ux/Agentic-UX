import React from 'react';
import { Button } from '@/app/components/ui/button';
import './OptionPickerDrawer.css';

export default function OptionPickerDrawer({ title, options, selected = [], onSelectionChange, onBack }) {
  const selectedSet = new Set(selected);

  function toggle(value) {
    const next = selectedSet.has(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onSelectionChange(next);
  }

  return (
    <div className="opd-overlay">
      <div className="opd-drawer">

        <div className="opd-header">
          <div className="opd-header__left">
            <button className="opd-back-btn" onClick={onBack}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="opd-title">{title}</span>
          </div>
          <Button onClick={onBack}>Done</Button>
        </div>

        <div className="opd-body">
          {options.map((opt) => {
            const isSelected = selectedSet.has(opt.value);
            return (
              <button key={opt.value} className="opd-option" onClick={() => toggle(opt.value)}>
                <div className="opd-option__avatar">
                  {opt.label.slice(0, 2).toUpperCase()}
                </div>
                <span className="opd-option__label">{opt.label}</span>
                {isSelected && (
                  <span className="opd-option__check material-symbols-outlined">check_circle</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="opd-footer">
          <Button onClick={onBack}>Done</Button>
        </div>

      </div>
    </div>
  );
}
