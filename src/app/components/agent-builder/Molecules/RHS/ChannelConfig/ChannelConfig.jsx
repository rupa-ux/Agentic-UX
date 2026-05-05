import React, { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import AdvancedConfigDrawer from '../Start/AdvancedConfigDrawer';

const font = '"Roboto", arial, sans-serif';

const CHANNEL_OPTIONS = [
  { value: 'Text', label: 'Text' },
  { value: 'Voice', label: 'Voice' },
  { value: 'SMS', label: 'SMS' },
];

const LLM_MODEL_OPTIONS = [
  { value: 'Fast', label: 'Fast' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Advanced', label: 'Advanced' },
];

const THINK_MODE_OPTIONS = [
  { value: 'off', label: 'Off' },
  { value: 'standard', label: 'Standard' },
  { value: 'deep', label: 'Deep' },
];

const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'nova', label: 'Nova' },
  { value: 'shimmer', label: 'Shimmer' },
];

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Japanese', label: 'Japanese' },
];

function FieldLabel({ label, required, showInfo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
        {label}
      </span>
      {required && <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>}
      {showInfo && <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f', cursor: 'pointer' }}>info</span>}
    </div>
  );
}

function ChannelMultiSelect({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (val) => {
    const next = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];
    onChange(next);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', height: 36, padding: '0 12px',
          border: '1px solid #ccc', borderRadius: 4,
          background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: font,
        }}
      >
        <span style={{ color: selected.length ? '#212121' : '#9e9e9e', flex: 1, textAlign: 'left' }}>
          {selected.length ? selected.join(', ') : placeholder}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f' }}>expand_more</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff', border: '1px solid #ccc', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          {options.map((opt) => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 14, fontFamily: font, color: '#212121' }}>
              <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => toggle(opt.value)} style={{ accentColor: '#1976d2' }} />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectField({ label, selected, options, onChange, showInfo }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label={label} showInfo={showInfo} />
      <Select value={selected ?? ''} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function TextConfig({ values, onChange }) {
  return (
    <>
      <SelectField label="LLM Model" selected={values.llmModelText ?? 'Fast'} options={LLM_MODEL_OPTIONS} onChange={(v) => onChange('llmModelText', v)} showInfo />
      <SelectField label="Think mode" selected={values.thinkModeText ?? 'standard'} options={THINK_MODE_OPTIONS} onChange={(v) => onChange('thinkModeText', v)} showInfo />
    </>
  );
}

function VoiceConfig({ values, onChange, onAdvancedClick }) {
  return (
    <>
      <SelectField label="Voice" selected={values.voice ?? 'alloy'} options={VOICE_OPTIONS} onChange={(v) => onChange('voice', v)} />
      <SelectField label="Language" selected={values.language ?? 'English'} options={LANGUAGE_OPTIONS} onChange={(v) => onChange('language', v)} />
      <SelectField label="LLM Model" selected={values.llmModelVoice ?? 'Fast'} options={LLM_MODEL_OPTIONS} onChange={(v) => onChange('llmModelVoice', v)} showInfo />
      <button
        type="button"
        onClick={onAdvancedClick}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: '#1976d2', fontFamily: font }}>Advanced config</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#1976d2' }}>chevron_right</span>
      </button>
    </>
  );
}

function SmsConfig({ values, onChange }) {
  return (
    <>
      <SelectField label="LLM Model" selected={values.llmModelSms ?? 'Fast'} options={LLM_MODEL_OPTIONS} onChange={(v) => onChange('llmModelSms', v)} showInfo />
      <SelectField label="Think mode" selected={values.thinkModeSms ?? 'standard'} options={THINK_MODE_OPTIONS} onChange={(v) => onChange('thinkModeSms', v)} showInfo />
    </>
  );
}

export default function ChannelConfig({ channels, activeChannel, values, onChange, onChannelChange, onActiveChannelChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Channels" required />
        <ChannelMultiSelect
          options={CHANNEL_OPTIONS}
          selected={channels}
          onChange={onChannelChange}
          placeholder="Select channels"
        />
      </div>

      {channels.length > 0 && (
        <div style={{ borderTop: '1px solid #e5e9f0', paddingTop: 16 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e9f0', marginBottom: 16 }}>
            {channels.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => onActiveChannelChange(ch)}
                style={{
                  background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, fontFamily: font,
                  color: activeChannel === ch ? '#1976d2' : '#616161',
                  borderBottom: activeChannel === ch ? '2px solid #1976d2' : '2px solid transparent',
                  marginBottom: -1,
                  transition: 'color 0.15s',
                }}
              >
                {ch}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeChannel === 'Text' && <TextConfig values={values} onChange={onChange} />}
            {activeChannel === 'Voice' && (
              <VoiceConfig values={values} onChange={onChange} onAdvancedClick={() => setShowAdvanced(true)} />
            )}
            {activeChannel === 'SMS' && <SmsConfig values={values} onChange={onChange} />}
          </div>
        </div>
      )}

      {showAdvanced && (
        <AdvancedConfigDrawer
          values={values}
          onChange={onChange}
          onBack={() => setShowAdvanced(false)}
        />
      )}
    </>
  );
}
