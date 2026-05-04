import React, { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import VoicePickerDrawer from './VoicePickerDrawer';
import OptionPickerDrawer from './OptionPickerDrawer';
import CrossChannelTab, { GuardrailPanels } from './CrossChannelTab';
import {
  font, LLM_MODEL_OPTIONS, LANGUAGE_OPTIONS,
  FieldLabel, LabeledToggle, NumberInputWithSuffix, OverridableField, ClientEventsField,
} from './advancedConfigUtils';
import './AdvancedConfigDrawer.css';


const AUDIO_TAG_OPTIONS = [
  { value: 'Consultative', label: 'Consultative' },
  { value: 'Knowledgeable', label: 'Knowledgeable' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Empathetically', label: 'Empathetically' },
  { value: 'Confidently', label: 'Confidently' },
  { value: 'Warmly', label: 'Warmly' },
  { value: 'Excitedly', label: 'Excitedly' },
  { value: 'Patiently', label: 'Patiently' },
  { value: 'Enthusiastically', label: 'Enthusiastically' },
  { value: 'Seriously', label: 'Seriously' },
  { value: 'Chuckles', label: 'Chuckles' },
  { value: 'Laughing', label: 'Laughing' },
  { value: 'Sighs', label: 'Sighs' },
];

const ASR_MODEL_OPTIONS = [
  { value: 'original_asr', label: 'Original ASR' },
  { value: 'scribe_v2_2_realtime', label: 'Scribe v2.2 Realtime' },
  { value: 'scribe_v2_turbo', label: 'Scribe v2 Turbo' },
];

const USER_INPUT_AUDIO_FORMAT_OPTIONS = [
  { value: 'pcm_16000', label: 'PCM 16000 Hz' },
  { value: 'pcm_8000', label: 'PCM 8000 Hz' },
  { value: 'mulaw_8000', label: 'Mulaw 8000 Hz' },
];

const EAGERNESS_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
];

const SPELLING_PATIENCE_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
];

function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid #e5e9f0', borderRadius: 6 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: '#212121', fontFamily: font }}>{title}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#616161', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>chevron_right</span>
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  );
}

function RangeSlider({ name, sliderLabel, currentValue, minValue, maxValue, step, sliderChangeCallback }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {sliderLabel && <span style={{ fontSize: 12, color: '#616161', fontFamily: font }}>{sliderLabel}</span>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="range" name={name} min={minValue} max={maxValue} step={step}
          value={currentValue}
          onChange={(e) => sliderChangeCallback(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: '#1976d2' }}
        />
        <input
          type="number" min={minValue} max={maxValue} step={step}
          value={currentValue}
          onChange={(e) => sliderChangeCallback(parseFloat(e.target.value))}
          style={{ width: 60, height: 32, border: '1px solid #ccc', borderRadius: 4, padding: '0 6px', fontSize: 14, fontFamily: font, textAlign: 'center' }}
        />
      </div>
    </div>
  );
}

function MultiSelectTags({ options, selected, onChange, placeholder }) {
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
        <span style={{ color: selected.length ? '#212121' : '#9e9e9e', flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected.length ? selected.join(', ') : placeholder}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f', flexShrink: 0 }}>expand_more</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: '#fff', border: '1px solid #ccc', borderRadius: 4, maxHeight: 220, overflowY: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
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

function VoiceInputField({ label, selected, placeholder, onClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label={label} />
      <button type="button" onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 36, padding: '0 12px', border: '1px solid #ccc', borderRadius: 4,
        background: '#fff', cursor: 'pointer', width: '100%', textAlign: 'left', overflow: 'hidden',
      }}>
        {selected && (
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#1976d2', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            play_arrow
          </span>
        )}
        <span style={{ fontSize: 14, fontFamily: font, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selected ? '#212121' : '#9e9e9e' }}>
          {selected || placeholder}
        </span>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#8f8f8f', flexShrink: 0 }}>chevron_right</span>
      </button>
    </div>
  );
}

function KeywordsInput({ keywords = [], onChange }) {
  const [input, setInput] = useState('');
  const MAX = 50;
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim() && keywords.length < MAX) {
      e.preventDefault();
      onChange([...keywords, input.trim()]);
      setInput('');
    }
  };
  const remove = (idx) => onChange(keywords.filter((_, i) => i !== idx));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ border: '1px solid #ccc', borderRadius: 4, padding: '6px 8px', minHeight: 36, background: '#fff', display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
        {keywords.map((kw, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e3f2fd', borderRadius: 4, padding: '2px 8px', fontSize: 13, fontFamily: font, color: '#1565c0' }}>
            {kw}
            <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#1565c0', fontSize: 14 }}>×</button>
          </span>
        ))}
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder={keywords.length === 0 ? 'Type a keyword and press Enter' : ''}
          style={{ border: 'none', outline: 'none', fontSize: 14, fontFamily: font, flex: 1, minWidth: 160, color: '#212121' }} />
      </div>
      <span style={{ fontSize: 12, color: '#9e9e9e', fontFamily: font, textAlign: 'right' }}>{keywords.length} / {MAX} keywords</span>
    </div>
  );
}

function SubTabs({ tabs, active, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '12px 20px', borderBottom: '1px solid #e5e9f0' }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelect(tab)}
          style={{
            padding: '4px 12px', borderRadius: 16, cursor: 'pointer',
            border: `1px solid ${active === tab ? '#1976d2' : '#e0e0e0'}`,
            background: active === tab ? '#e3f2fd' : '#fff',
            color: active === tab ? '#1976d2' : '#616161',
            fontSize: 13, fontWeight: active === tab ? 500 : 400, fontFamily: font,
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function VoiceGeneralContent({ values, onChange, onOpenVoicePicker }) {
  const set = (field) => (val) => onChange(field, val);
  const voiceArr = Array.isArray(values.voice) ? values.voice : values.voice ? [values.voice] : [];
  const audioTags = Array.isArray(values.audioTags) ? values.audioTags : [];
  const defaultLLM = values.llmModel ?? 'Fast';
  const defaultLLMLabel = LLM_MODEL_OPTIONS.find(o => o.value === defaultLLM)?.label ?? defaultLLM;
  const defaultLang = values.language ?? 'English';
  const defaultLangLabel = LANGUAGE_OPTIONS.find(o => o.value === defaultLang)?.label ?? defaultLang;
  const setVoiceOverride = (field) => (val) => onChange('voiceOverrides', { ...(values.voiceOverrides ?? {}), [field]: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <OverridableField
        label="LLM Model" showInfo tooltip="Override the default LLM model for voice interactions."
        defaultValue={defaultLLM} defaultLabel={defaultLLMLabel}
        overrideValue={values.voiceOverrides?.llmModel ?? null}
        onOverrideChange={setVoiceOverride('llmModel')}
      >
        <Select value={values.voiceOverrides?.llmModel ?? ''} onValueChange={setVoiceOverride('llmModel')}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {LLM_MODEL_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </OverridableField>
      <OverridableField
        label="Language" showInfo tooltip="Override the default language for voice interactions."
        defaultValue={defaultLang} defaultLabel={defaultLangLabel}
        overrideValue={values.voiceOverrides?.language ?? null}
        onOverrideChange={setVoiceOverride('language')}
      >
        <Select value={values.voiceOverrides?.language ?? ''} onValueChange={setVoiceOverride('language')}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </OverridableField>
      <VoiceInputField
        label="Voice"
        selected={voiceArr.length === 1 ? voiceArr[0] : voiceArr.length > 1 ? `${voiceArr.length} voices selected` : null}
        placeholder="Select voices"
        onClick={onOpenVoicePicker}
      />
      <RangeSlider name="voiceSpeed" sliderLabel="Voice Speed"
        currentValue={values.voiceSpeed ?? 1} minValue={0} maxValue={2} step={0.1}
        sliderChangeCallback={set('voiceSpeed')} />
      <RangeSlider name="voiceTemperature" sliderLabel="Voice Temperature"
        currentValue={values.voiceTemperature ?? 1} minValue={0} maxValue={2} step={0.1}
        sliderChangeCallback={set('voiceTemperature')} />
      <RangeSlider name="voiceVolume" sliderLabel="Voice Volume"
        currentValue={values.voiceVolume ?? 1} minValue={0} maxValue={2} step={0.1}
        sliderChangeCallback={set('voiceVolume')} />
      <LabeledToggle name="expressiveMode" label="Expressive mode"
        checked={values.expressiveMode ?? false} onChange={set('expressiveMode')}
        showInfo tooltip="Allows the voice to express emotions and varied tone" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Suggested audio tags" showInfo tooltip="Audio tags influence the tone and style of voice synthesis" />
        <MultiSelectTags
          options={AUDIO_TAG_OPTIONS}
          selected={audioTags}
          onChange={set('audioTags')}
          placeholder="Select tags"
        />
      </div>
      <LabeledToggle name="storeCallAudio" label="Store Call Audio"
        checked={values.storeCallAudio ?? true} onChange={set('storeCallAudio')}
        showInfo tooltip="When disabled, audio is streamed for real-time processing but is never stored. Only the transcript is retained." />
    </div>
  );
}

function VoiceSpeechContent({ values, onChange }) {
  const set = (field) => (val) => onChange(field, val);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="ASR model" showInfo tooltip="Select the speech recognition model for transcribing user audio." />
        <Select value={values.asrModel ?? ''} onValueChange={(v) => set('asrModel')(v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {ASR_MODEL_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Eagerness" showInfo tooltip="Controls how eager the agent is to respond. High eagerness means the agent responds quickly, while low eagerness means the agent waits longer to ensure the user has finished speaking." />
        <Select value={values.eagerness ?? 'normal'} onValueChange={(v) => set('eagerness')(v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {EAGERNESS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <CollapsibleSection title="Transcription">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
          <LabeledToggle name="filterBackgroundSpeech" label="Filter background speech" badge="Alpha"
            checked={values.filterBackgroundSpeech ?? false} onChange={set('filterBackgroundSpeech')}
            showInfo tooltip="Enable background voice detection to filter out far field human speech." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="User input audio format" showInfo tooltip="Select the input format you want to use for automatic speech recognition." />
            <Select value={values.userInputAudioFormat ?? 'pcm_16000'} onValueChange={(v) => set('userInputAudioFormat')(v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {USER_INPUT_AUDIO_FORMAT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Keywords" showInfo tooltip="Add keywords to improve transcription accuracy for names, products, or domain-specific terms." />
            <KeywordsInput keywords={Array.isArray(values.keywords) ? values.keywords : []} onChange={set('keywords')} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Spelling patience" showInfo tooltip="Controls if the agent should be more patient when user is spelling numbers and named entities." />
            <Select value={values.spellingPatience ?? 'auto'} onValueChange={(v) => set('spellingPatience')(v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {SPELLING_PATIENCE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Turn Detection">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
          <LabeledToggle name="speculativeTurn" label="Speculative turn"
            checked={values.speculativeTurn ?? false} onChange={set('speculativeTurn')}
            showInfo tooltip="When enabled, starts generating responses during silence before full turn confidence is reached, reducing perceived latency. May increase LLM costs." />
          <LabeledToggle name="reTranscribeOnTimeout" label="Re-transcribe audio on turn timeout"
            checked={values.reTranscribeOnTimeout ?? false} onChange={set('reTranscribeOnTimeout')}
            showInfo tooltip="When VAD detects no speech, attempts to re-transcribe accumulated audio at turn timeout." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Take turn after silence" showInfo tooltip="The maximum number of seconds since the user last spoke. If exceeded, the agent will respond and force a turn. A value of -1 means the agent will wait indefinitely." />
            <NumberInputWithSuffix value={values.takeTurnAfterSilence ?? 7} onChange={set('takeTurnAfterSilence')} suffix="Seconds" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Soft timeout" showInfo tooltip="How long to wait for the LLM response before returning a message." />
            <NumberInputWithSuffix value={values.softTimeout ?? -1} onChange={set('softTimeout')} suffix="Seconds" />
          </div>
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Conversation Limits">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="End conversation after silence" showInfo tooltip="The maximum number of seconds since the user last spoke. If exceeded, the call will terminate. A value of -1 means there is no fixed cutoff." />
            <NumberInputWithSuffix value={values.endConversationAfterSilence ?? -1} onChange={set('endConversationAfterSilence')} suffix="Seconds" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Max conversation duration" showInfo tooltip="The maximum number of seconds that a conversation can last." />
            <NumberInputWithSuffix value={values.maxConversationDuration ?? 1800} onChange={set('maxConversationDuration')} suffix="Seconds" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Max conversation duration message" showInfo tooltip="Message to send when max conversation duration is reached. Note: this only applies to text-only conversations." />
            <Textarea name="maxConversationDurationMessage"
              value={values.maxConversationDurationMessage ?? 'Conversation ended, goodbye!'}
              onChange={(e) => set('maxConversationDurationMessage')(e.target.value)}
              rows={3} />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}

function VoiceCallContent({ values, onChange }) {
  const set = (field) => (val) => onChange(field, val);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <LabeledToggle name="voicemailDetection" label="Voicemail Detection"
          checked={values.voicemailDetection ?? false} onChange={set('voicemailDetection')} />
        <span style={{ fontSize: 12, color: '#616161', fontFamily: font }}>Hang up or leave a voicemail if a voicemail is detected.</span>
        {values.voicemailDetection && (
          <div style={{ marginTop: 8, border: '1px solid #e0e0e0', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#212121', fontFamily: font }}>Voicemail Response</span>
            {[{ label: 'Hang up if reaching voicemail', value: 'hangup' }, { label: 'Leave a message if reaching voicemail', value: 'leave_message' }].map(({ label, value }) => (
              <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="voicemailResponse" value={value}
                  checked={(values.voicemailResponse ?? 'leave_message') === value}
                  onChange={() => set('voicemailResponse')(value)} style={{ accentColor: '#1976d2' }} />
                <span style={{ fontSize: 14, color: '#212121', fontFamily: font }}>{label}</span>
              </label>
            ))}
            {(values.voicemailResponse ?? 'leave_message') === 'leave_message' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0' }}>
                  {[{ label: 'Prompt', val: 'prompt' }, { label: 'Static Sentence', val: 'static' }].map(({ label, val }) => {
                    const active = (values.voicemailResponseType ?? 'prompt') === val;
                    return (
                      <button key={val} type="button" onClick={() => set('voicemailResponseType')(val)} style={{
                        padding: '6px 12px', background: 'none', border: 'none',
                        borderBottom: `2px solid ${active ? '#1976d2' : 'transparent'}`,
                        color: active ? '#1976d2' : '#616161',
                        fontFamily: font, fontSize: 14, cursor: 'pointer', marginBottom: -1,
                      }}>{label}</button>
                    );
                  })}
                </div>
                <Textarea name="voicemailMessage"
                  value={values.voicemailMessage ?? 'Hey {{user_name}}, sorry we could not reach you directly. Please give us a callback if you can.'}
                  onChange={(e) => set('voicemailMessage')(e.target.value)} rows={4} />
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <LabeledToggle name="ivrHangup" label="IVR Hangup"
          checked={values.ivrHangup ?? false} onChange={set('ivrHangup')} />
        <span style={{ fontSize: 12, color: '#616161', fontFamily: font }}>Hang up if an IVR system is detected.</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="End Call on Silence" showInfo tooltip="End the call if user stays silent for extended period of time." />
        <span style={{ fontSize: 12, color: '#616161', fontFamily: font }}>End the call if user stays silent for extended period of time.</span>
        <RangeSlider name="endCallOnSilence" currentValue={values.endCallOnSilence ?? 10}
          minValue={0} maxValue={30} step={0.5}
          sliderChangeCallback={set('endCallOnSilence')} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Max Call Duration" showInfo tooltip="Maximum duration of the call." />
        <RangeSlider name="maxCallDuration" currentValue={values.maxCallDuration ?? 1}
          minValue={0} maxValue={4} step={0.25}
          sliderChangeCallback={set('maxCallDuration')} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Ring Duration" showInfo tooltip="The max ringing duration before the outbound call / transfer call is deemed no answer." />
        <span style={{ fontSize: 12, color: '#616161', fontFamily: font }}>The max ringing duration before the outbound call / transfer call is deemed no answer.</span>
        <RangeSlider name="ringDuration" currentValue={values.ringDuration ?? 30}
          minValue={0} maxValue={120} step={5}
          sliderChangeCallback={set('ringDuration')} />
      </div>
      <LabeledToggle name="recordCall" label="Record call"
        checked={values.recordCall ?? false} onChange={set('recordCall')} />
      <CollapsibleSection title="Call Limits">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Daily call limit" showInfo tooltip="The maximum number of calls allowed per day." />
            <NumberInputWithSuffix value={values.dailyCallLimit ?? 100000} onChange={set('dailyCallLimit')} suffix="Calls per day" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Concurrent call limit" showInfo tooltip="The maximum number of concurrent calls allowed." />
            <NumberInputWithSuffix value={values.concurrentCallLimit ?? -1} onChange={set('concurrentCallLimit')} suffix="Calls" negativeLabel="Using subscription limit" />
          </div>
          <LabeledToggle name="enableBursting" label="Enable bursting"
            checked={values.enableBursting ?? true} onChange={set('enableBursting')}
            showInfo tooltip="If enabled, the agent can exceed the workspace subscription concurrency limit by up to 3 times, with excess calls charged at double the normal rate." />
        </div>
      </CollapsibleSection>
    </div>
  );
}

function ChatChannelContent({ channelKey, values, onChange }) {
  const set = (field) => (val) => onChange(field, val);
  const defaultLLM = values.llmModel ?? 'Fast';
  const defaultLLMLabel = LLM_MODEL_OPTIONS.find(o => o.value === defaultLLM)?.label ?? defaultLLM;
  const defaultLang = values.language ?? 'English';
  const defaultLangLabel = LANGUAGE_OPTIONS.find(o => o.value === defaultLang)?.label ?? defaultLang;
  const overrideKey = `${channelKey}Overrides`;
  const setOverride = (field) => (val) => onChange(overrideKey, { ...(values[overrideKey] ?? {}), [field]: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <OverridableField
        label="LLM Model" showInfo tooltip={`Override the default LLM model for ${channelKey} interactions.`}
        defaultValue={defaultLLM} defaultLabel={defaultLLMLabel}
        overrideValue={values[overrideKey]?.llmModel ?? null}
        onOverrideChange={setOverride('llmModel')}
      >
        <Select value={values[overrideKey]?.llmModel ?? ''} onValueChange={setOverride('llmModel')}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {LLM_MODEL_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </OverridableField>
      <OverridableField
        label="Language" showInfo tooltip={`Override the default language for ${channelKey} interactions.`}
        defaultValue={defaultLang} defaultLabel={defaultLangLabel}
        overrideValue={values[overrideKey]?.language ?? null}
        onOverrideChange={setOverride('language')}
      >
        <Select value={values[overrideKey]?.language ?? ''} onValueChange={setOverride('language')}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </OverridableField>
      <LabeledToggle name="allowFileAttachments" label="Allow file attachments"
        checked={values.allowFileAttachments ?? false} onChange={set('allowFileAttachments')}
        showInfo tooltip="Let users attach images and PDFs in chat when the selected model supports multimodal input." />
      {values.allowFileAttachments && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Max files per conversation" showInfo tooltip="The maximum number of files that can be uploaded during a single conversation." />
          <NumberInputWithSuffix value={values.maxFilesPerConversation ?? 10} onChange={set('maxFilesPerConversation')} suffix="Files" />
        </div>
      )}
      <ClientEventsField
        selected={Array.isArray(values.clientEvents) ? values.clientEvents : []}
        onChange={set('clientEvents')}
      />
    </div>
  );
}

const VOICE_SUBTABS = ['General', 'Speech', 'Call'];

export default function AdvancedConfigDrawer({ channels = [], values, onChange, onBack }) {
  const allTabs = [...channels, 'Cross-channel'].map((ch) => ({ label: ch, value: ch }));
  const [activeChannel, setActiveChannel] = useState(channels[0] ?? 'Cross-channel');
  const [voiceSubTab, setVoiceSubTab] = useState('General');
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [guardrailPanel, setGuardrailPanel] = useState(null);

  const voiceArr = Array.isArray(values.voice) ? values.voice : values.voice ? [values.voice] : [];

  return (
    <div className="adv-overlay">
      {showVoicePicker && (
        <VoicePickerDrawer
          selected={voiceArr}
          onSelectionChange={(val) => onChange('voice', val)}
          onBack={() => setShowVoicePicker(false)}
        />
      )}
      <div className="adv-drawer">
        <GuardrailPanels
          guardrailPanel={guardrailPanel}
          onClose={() => setGuardrailPanel(null)}
          values={values}
          onChange={onChange}
        />

        <div className="adv-header">
          <div className="adv-header__left">
            <button className="adv-back-btn" onClick={onBack}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="adv-title">Advanced config</span>
          </div>
          <Button onClick={onBack}>Done</Button>
        </div>

        <div className="adv-tabs-wrapper" style={{ display: 'flex', borderBottom: '1px solid #e5e9f0', overflowX: 'auto' }}>
          {allTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveChannel(tab.value)}
              style={{
                padding: '10px 16px', background: 'none', border: 'none',
                borderBottom: `2px solid ${activeChannel === tab.value ? '#1976d2' : 'transparent'}`,
                color: activeChannel === tab.value ? '#1976d2' : '#616161',
                fontSize: 14, fontFamily: font, cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1,
                fontWeight: activeChannel === tab.value ? 500 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeChannel === 'Voice' && (
          <SubTabs tabs={VOICE_SUBTABS} active={voiceSubTab} onSelect={setVoiceSubTab} />
        )}

        <div className="adv-body">
          {activeChannel === 'Voice' && voiceSubTab === 'General' && (
            <VoiceGeneralContent values={values} onChange={onChange} onOpenVoicePicker={() => setShowVoicePicker(true)} />
          )}
          {activeChannel === 'Voice' && voiceSubTab === 'Speech' && (
            <VoiceSpeechContent values={values} onChange={onChange} />
          )}
          {activeChannel === 'Voice' && voiceSubTab === 'Call' && (
            <VoiceCallContent values={values} onChange={onChange} />
          )}
          {activeChannel === 'Text' && (
            <ChatChannelContent channelKey="text" values={values} onChange={onChange} />
          )}
          {activeChannel === 'Webchat' && (
            <ChatChannelContent channelKey="webchat" values={values} onChange={onChange} />
          )}
          {activeChannel === 'Cross-channel' && (
            <CrossChannelTab values={values} onChange={onChange} onOpenGuardrailPanel={setGuardrailPanel} />
          )}
        </div>
      </div>
    </div>
  );
}
