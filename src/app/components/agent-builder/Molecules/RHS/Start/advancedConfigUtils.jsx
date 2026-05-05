import React, { useState } from 'react';
import { Switch } from '@/app/components/ui/switch';
import { Button } from '@/app/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';

export const font = '"Roboto", arial, sans-serif';

export const LLM_MODEL_OPTIONS = [
  { value: 'Fast', label: 'Fast' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Advanced', label: 'Advanced' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Japanese', label: 'Japanese' },
];

export function FieldLabel({ label, showInfo, tooltip }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#212121', fontFamily: font }}>
        {label}
      </span>
      {(showInfo || tooltip) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f', cursor: 'pointer', lineHeight: 1 }}>info</span>
            </TooltipTrigger>
            <TooltipContent side="top">{tooltip || label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export function LabeledToggle({ label, name, checked, onChange, showInfo, tooltip, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 14, lineHeight: '20px', color: '#212121', fontFamily: font }}>{label}</span>
        {badge && (
          <span style={{ fontSize: 11, fontWeight: 500, color: '#6200ea', background: '#ede7f6', borderRadius: 4, padding: '1px 6px', fontFamily: font }}>{badge}</span>
        )}
        {(showInfo || tooltip) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f', cursor: 'pointer', lineHeight: 1 }}>info</span>
              </TooltipTrigger>
              <TooltipContent side="top">{tooltip || label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={(val) => onChange(val)} />
    </div>
  );
}

export function NumberInputWithSuffix({ value, onChange, suffix, negativeLabel = 'Disabled' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: 80, height: 36, border: '1px solid #ccc', borderRadius: 4, padding: '0 8px', fontSize: 14, fontFamily: font }}
      />
      <span style={{ fontSize: 14, color: '#616161', fontFamily: font }}>{value === -1 ? negativeLabel : suffix}</span>
    </div>
  );
}

export function OverridableField({ label, showInfo, tooltip, defaultValue, defaultLabel, overrideValue, onOverrideChange, children }) {
  const isOverridden = overrideValue !== null && overrideValue !== undefined;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label={label} showInfo={showInfo} tooltip={tooltip} />
      {isOverridden ? (
        children
      ) : (
        <div style={{
          height: 36, border: '1px solid #e0e0e0', borderRadius: 4, padding: '0 12px',
          display: 'flex', alignItems: 'center', background: '#f5f5f5',
        }}>
          <span style={{ fontSize: 14, color: '#9e9e9e', fontFamily: font }}>{defaultLabel ?? defaultValue}</span>
        </div>
      )}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginTop: 2 }}>
        <input
          type="checkbox"
          checked={isOverridden}
          onChange={(e) => onOverrideChange(e.target.checked ? defaultValue : null)}
          style={{ accentColor: '#1976d2', width: 14, height: 14, cursor: 'pointer', flexShrink: 0 }}
        />
        <span style={{ fontSize: 12, color: '#616161', fontFamily: font }}>Override for this channel</span>
      </label>
    </div>
  );
}

const CLIENT_EVENT_OPTIONS = ['audio', 'interruption', 'agent_response', 'user_transcript', 'agent_response_correction', 'agent_tool_response'];

export function ClientEventsField({ selected = [], onChange }) {
  const [open, setOpen] = useState(false);
  const available = CLIENT_EVENT_OPTIONS.filter((e) => !selected.includes(e));
  const remove = (ev) => onChange(selected.filter((e) => e !== ev));
  const add = (ev) => { onChange([...selected, ev]); setOpen(false); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 14, color: '#212121', fontFamily: font }}>Client events</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f', cursor: 'pointer', lineHeight: 1 }}>info</span>
              </TooltipTrigger>
              <TooltipContent side="top">Select the events that should be sent to the client.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div style={{ position: 'relative' }}>
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>Add event</Button>
          {open && available.length > 0 && (
            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 10, minWidth: 220 }}>
              {available.map((ev) => (
                <button key={ev} type="button" onClick={() => add(ev)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', background: 'none', border: 'none', fontSize: 13, fontFamily: font, color: '#212121', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
                  {ev}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '10px 12px', minHeight: 48, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {selected.length === 0 && <span style={{ fontSize: 13, color: '#9e9e9e', fontFamily: font }}>No events selected</span>}
        {selected.map((ev) => (
          <span key={ev} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f5f5', borderRadius: 4, padding: '4px 10px', fontSize: 13, fontFamily: font, color: '#212121' }}>
            {ev}
            <button type="button" onClick={() => remove(ev)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#757575', fontSize: 16 }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
