import React, { useState, useRef, useEffect } from 'react';
import './ChannelConfig.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import OptionPickerDrawer from '../RHS/Start/OptionPickerDrawer';
import VoicePickerDrawer from '../RHS/Start/VoicePickerDrawer';
import { LLM_MODEL_OPTIONS, LANGUAGE_OPTIONS } from '../RHS/Start/advancedConfigUtils';

const font = '"Roboto", arial, sans-serif';

export const CHANNEL_OPTIONS = [
  { value: 'Text', label: 'Text' },
  { value: 'Voice', label: 'Voice' },
  { value: 'Webchat', label: 'Webchat' },
];

function MultiSelectDropdown({ options, selected = [], onChange, placeholder = 'Select' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const triggerLabel = selected.length === 0
    ? null
    : selected.length === 1
      ? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
      : `${selected.length} selected`;

  const toggle = (val) => {
    const next = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val];
    onChange(next);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 12px', border: '1px solid #ccc', borderRadius: 4,
          background: '#fff', cursor: 'pointer', fontFamily: font, fontSize: 14,
          color: triggerLabel ? '#212121' : '#9e9e9e',
        }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>{triggerLabel ?? placeholder}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {selected.length > 0 && (
            <span
              className="material-symbols-outlined"
              onClick={(e) => { e.stopPropagation(); onChange([]); }}
              style={{ fontSize: 16, color: '#9e9e9e', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 2, cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#616161'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9e9e9e'; }}
            >
              close
            </span>
          )}
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#757575', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </div>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6, boxShadow: '0 4px 12px rgba(33,33,33,0.12)', padding: '4px 0' }}>
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 14, fontFamily: font, color: '#212121' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <input type="checkbox" checked={checked} onChange={() => toggle(opt.value)} style={{ accentColor: '#1976d2', width: 14, height: 14, cursor: 'pointer', flexShrink: 0 }} />
                {opt.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

const REPLY_BUTTON_OPTIONS = [
  { value: 'resolution', label: 'Resolution button' },
  { value: 'escalation', label: 'Escalation button' },
];

const FALLBACK_OPTIONS = [
  { value: 'during', label: 'During business hours' },
  { value: 'after', label: 'After business hours' },
];

function FieldLabel({ label, required, tooltip }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
        {label}
      </span>
      {required && <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>}
      {tooltip && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f', cursor: 'pointer', lineHeight: 1 }}>info</span>
            </TooltipTrigger>
            <TooltipContent side="top">{tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

function SelectField({ label, name, selected, options, onChange, tooltip }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label={label} tooltip={tooltip} />
      <Select value={selected ?? ''} onValueChange={(v) => onChange(v)}>
        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function ToggleSwitch({ selected = false, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      onClick={() => onChange && onChange(!selected)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: 32, height: 16, borderRadius: 8, background: selected ? '#1976d2' : '#ccc', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s' }}
    >
      <span style={{ position: 'absolute', top: 2, left: selected ? 18 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
    </button>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 4, height: 36, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#212121', fontFamily: font }}
      />
    </div>
  );
}

function CharTextArea({ value, onChange, maxLength = 300 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', height: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#8f8f8f', fontFamily: font }}>{(value || '').length}/{maxLength}</span>
      </div>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        style={{ height: 80, border: '1px solid #ccc', borderRadius: 4, padding: '6px 12px', fontSize: 14, fontWeight: 400, lineHeight: '20px', color: '#212121', fontFamily: font, resize: 'none', outline: 'none', boxSizing: 'border-box', width: '100%' }}
      />
    </div>
  );
}

function ChannelTabs({ channels, activeChannel, onSelect, children }) {
  const tabBarRef = useRef(null);

  if (channels.length === 0) return null;

  const handleSelect = (ch) => {
    onSelect(ch);
    setTimeout(() => {
      tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 0);
  };

  return (
    <div style={{ paddingTop: 8 }}>
      <div ref={tabBarRef} style={{ display: 'flex', borderBottom: '1px solid #e5e9f0', marginBottom: 16 }}>
        {channels.map((ch) => (
          <button
            key={ch}
            type="button"
            onClick={() => handleSelect(ch)}
            style={{
              background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, fontFamily: font,
              color: activeChannel === ch ? '#1976d2' : '#616161',
              borderBottom: activeChannel === ch ? '2px solid #1976d2' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}
          >
            {ch}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </div>
  );
}

function PickerInputField({ label, selected, placeholder, onClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label={label} />
      <button
        type="button"
        onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 36, padding: '0 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', width: '100%', textAlign: 'left', overflow: 'hidden' }}
      >
        <span style={{ fontSize: 14, fontFamily: font, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selected ? '#212121' : '#9e9e9e' }}>
          {selected || placeholder}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f', flexShrink: 0, lineHeight: 1 }}>chevron_right</span>
      </button>
    </div>
  );
}

function selectedLabel(vals, map) {
  if (!vals || vals.length === 0) return null;
  const labels = vals.map((v) => map[v]).filter(Boolean);
  if (labels.length <= 2) return labels.join(', ');
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`;
}

function VoiceInputField({ label, selected, placeholder, onClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label={label} />
      <button
        type="button"
        onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', width: '100%', textAlign: 'left', overflow: 'hidden' }}
      >
        {selected && (
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#1976d2', flexShrink: 0, lineHeight: 1 }} onClick={(e) => e.stopPropagation()}>play_arrow</span>
        )}
        <span style={{ fontSize: 14, fontFamily: font, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selected ? '#212121' : '#9e9e9e' }}>
          {selected || placeholder}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f', flexShrink: 0, lineHeight: 1 }}>chevron_right</span>
      </button>
    </div>
  );
}

export default function ChannelConfig({
  channels = [],
  activeChannel = null,
  values = {},
  onChange,
  onChannelChange,
  onActiveChannelChange,
  onAdvancedConfig,
}) {
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const languageLabelMap = Object.fromEntries(LANGUAGE_OPTIONS.map((o) => [o.value, o.label]));

  const webchatConfig = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel label="Reply buttons" tooltip="Configure how quick reply buttons appear in conversations" />
        <MultiSelectDropdown options={REPLY_BUTTON_OPTIONS} selected={values.replyButtons ?? []} onChange={(vals) => onChange('replyButtons', vals)} />
        {values.replyButtons?.includes('resolution') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Resolution button" tooltip="Label shown on the resolution quick reply button" />
            <TextInput value={values.resolutionButtonText} placeholder="That helped 👍" onChange={(val) => onChange('resolutionButtonText', val)} />
          </div>
        )}
        {values.replyButtons?.includes('escalation') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Escalation button" tooltip="Label shown on the escalation quick reply button" />
            <TextInput value={values.escalationButtonText} placeholder="Talk to human" onChange={(val) => onChange('escalationButtonText', val)} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel label="Customize AI agent name" tooltip="Name displayed to visitors as your AI assistant" />
        <TextInput value={values.aiAgentName} placeholder="Enter agent name" onChange={(val) => onChange('aiAgentName', val)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel label="Fallback message" tooltip="This message is shown to visitors when the AI agent cannot answer a question" />
        <MultiSelectDropdown options={FALLBACK_OPTIONS} selected={values.fallbackMessages ?? []} onChange={(vals) => onChange('fallbackMessages', vals)} />
        {values.fallbackMessages?.includes('during') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="During business hours" />
            <CharTextArea value={values.fallbackDuringHours} onChange={(val) => onChange('fallbackDuringHours', val)} />
          </div>
        )}
        {values.fallbackMessages?.includes('after') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="After business hours" />
            <CharTextArea value={values.fallbackAfterHours} onChange={(val) => onChange('fallbackAfterHours', val)} />
          </div>
        )}
      </div>
    </div>
  );

  const voiceConfig = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {showVoicePicker && (
        <VoicePickerDrawer
          selected={Array.isArray(values.voice) ? values.voice : values.voice ? [values.voice] : []}
          onSelectionChange={(val) => onChange('voice', val)}
          onBack={() => setShowVoicePicker(false)}
        />
      )}
      {showLanguagePicker && (
        <OptionPickerDrawer
          title="Language"
          options={LANGUAGE_OPTIONS}
          selected={Array.isArray(values.language) ? values.language : values.language ? [values.language] : []}
          onSelectionChange={(val) => onChange('language', val)}
          onBack={() => setShowLanguagePicker(false)}
        />
      )}
      <SelectField label="LLM Model" name="llmModelVoice" selected={values.llmModelVoice} options={LLM_MODEL_OPTIONS} onChange={(val) => onChange('llmModelVoice', val)} />
      <PickerInputField
        label="Language"
        selected={selectedLabel(Array.isArray(values.language) ? values.language : values.language ? [values.language] : [], languageLabelMap)}
        placeholder="Select languages"
        onClick={() => setShowLanguagePicker(true)}
      />
      <VoiceInputField
        label="Voice"
        selected={(() => { const v = Array.isArray(values.voice) ? values.voice : values.voice ? [values.voice] : []; return v.length === 1 ? v[0] : v.length > 1 ? `${v.length} voices selected` : null; })()}
        placeholder="Select voices"
        onClick={() => setShowVoicePicker(true)}
      />
    </div>
  );

  const textConfig = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FieldLabel label="Unsubscribe text" tooltip="Enabling this will allow customers to opt out of text communications" />
        <ToggleSwitch selected={values.unsubscribeTextEnabled} onChange={(val) => onChange('unsubscribeTextEnabled', val)} />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label="Channels" required />
      <MultiSelectDropdown options={CHANNEL_OPTIONS} selected={channels} onChange={onChannelChange} />
      {channels.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12 }}>
          <SelectField label="LLM Model" name="llmModel" selected={values.llmModel ?? 'Fast'} options={LLM_MODEL_OPTIONS} onChange={(v) => onChange('llmModel', v)} tooltip="Default language model used across all channels" />
          <SelectField label="Language" name="language" selected={values.language ?? 'English'} options={LANGUAGE_OPTIONS} onChange={(v) => onChange('language', v)} tooltip="Default language used across all channels" />
        </div>
      )}
      <ChannelTabs channels={channels} activeChannel={activeChannel} onSelect={onActiveChannelChange}>
        {activeChannel === 'Webchat' && webchatConfig}
        {activeChannel === 'Voice' && voiceConfig}
        {activeChannel === 'Text' && textConfig}
      </ChannelTabs>
      {channels.length > 0 && (
        <button
          type="button"
          onClick={() => onAdvancedConfig?.()}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 4 }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1976d2', fontFamily: font }}>Advanced config</span>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#1976d2', lineHeight: 1 }}>chevron_right</span>
        </button>
      )}
    </div>
  );
}
