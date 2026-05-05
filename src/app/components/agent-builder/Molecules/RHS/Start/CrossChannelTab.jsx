import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { Textarea } from '@/app/components/ui/textarea';
import {
  font, LLM_MODEL_OPTIONS, LANGUAGE_OPTIONS,
  FieldLabel, LabeledToggle, NumberInputWithSuffix,
} from './advancedConfigUtils';

const OVERRIDE_OPTIONS = [
  { key: 'agentLanguage', label: 'Agent language' },
  { key: 'firstMessage', label: 'First message' },
  { key: 'workflowStartNode', label: 'Workflow start node' },
  { key: 'systemPrompt', label: 'System prompt' },
  { key: 'llm', label: 'LLM' },
  { key: 'voice', label: 'Voice' },
  { key: 'voiceSpeed', label: 'Voice speed' },
  { key: 'voiceStability', label: 'Voice stability' },
  { key: 'voiceSimilarity', label: 'Voice similarity' },
  { key: 'textOnly', label: 'Text only' },
  { key: 'tools', label: 'Tools' },
  { key: 'knowledgeBase', label: 'Knowledge base' },
];

const EXECUTION_MODE_OPTIONS = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'batch', label: 'Batch' },
];

const VIOLATION_ACTION_OPTIONS = [
  { value: 'end_call', label: 'End call' },
  { value: 'warn', label: 'Warn user' },
  { value: 'log', label: 'Log only' },
];

const THRESHOLD_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const CONTENT_CATEGORIES = [
  { key: 'sexual', label: 'Sexual', subtitle: 'Blocks erotic or sexually explicit conversations.' },
  { key: 'violence', label: 'Violence', subtitle: 'Blocks content that depicts acts of violence or physical harm.' },
  { key: 'harassment', label: 'Harassment', subtitle: 'Stops abusive or threatening behavior.' },
  { key: 'selfHarm', label: 'Self Harm', subtitle: 'Prevents engagement with self-harm or suicidal content.' },
  { key: 'profanity', label: 'Profanity', subtitle: 'Prevents use of vulgar or explicit language.' },
  { key: 'politicsReligion', label: 'Politics and religion', subtitle: 'Avoids political and religious discussions.' },
  { key: 'medicalLegal', label: 'Medical and Legal Information', subtitle: 'Prevents discussion about medical or legal topics.' },
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

function RangeSlider({ name, currentValue, minValue, maxValue, step, sliderChangeCallback }) {
  return (
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
  );
}

function AllowlistField({ hosts = [], onChange }) {
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState('');

  const add = () => {
    if (input.trim()) { onChange([...hosts, input.trim()]); setInput(''); setShowInput(false); }
  };
  const remove = (idx) => onChange(hosts.filter((_, i) => i !== idx));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, color: '#212121', fontFamily: font }}>Allowlist</span>
        <Button variant="outline" size="sm" onClick={() => setShowInput(true)}>Add host</Button>
      </div>
      {showInput && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Enter host URL" autoFocus
            style={{ flex: 1, height: 36, border: '1px solid #ccc', borderRadius: 4, padding: '0 8px', fontSize: 14, fontFamily: font }}
          />
          <Button onClick={add}>Add</Button>
          <Button variant="outline" onClick={() => { setShowInput(false); setInput(''); }}>Cancel</Button>
        </div>
      )}
      {hosts.length === 0 ? (
        <div style={{ background: '#fce4ec', border: '1px solid #f8bbd0', borderRadius: 6, padding: '10px 14px' }}>
          <span style={{ fontSize: 13, color: '#b71c1c', fontFamily: font }}>
            No allowlist specified. Any host will be able to connect to this agent. We strongly recommend setting up an allowlist when using overrides.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {hosts.map((host, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f5f5', borderRadius: 4, padding: '4px 10px', fontSize: 13, fontFamily: font, color: '#212121' }}>
              {host}
              <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#757575', fontSize: 16 }}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function GuardrailPanelShell({ title, onClose, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 10, display: 'flex', flexDirection: 'column', fontFamily: font }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 24px', flexShrink: 0 }}>
        <button type="button" onClick={onClose} className="adv-back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span style={{ fontSize: 16, fontWeight: 400, color: '#1f2328' }}>{title}</span>
      </div>
      <div style={{ height: 1, background: '#e5e9f0', flexShrink: 0 }} />
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {children}
      </div>
    </div>
  );
}

export function FocusGuardrailPanel({ values, onChange, onClose }) {
  const g = values.guardrails?.focus ?? {};
  const set = (field) => (val) => onChange('guardrails', { ...values.guardrails, focus: { ...g, [field]: val } });
  return (
    <GuardrailPanelShell title="Focus guardrail" onClose={onClose}>
      <LabeledToggle
        name="focusEnabled" label="Focus" checked={g.enabled ?? true} onChange={set('enabled')}
        showInfo tooltip="Keeps the agent focused on its defined goal and system instructions, preventing it from drifting into unintended behavior or off-topic discussions."
      />
    </GuardrailPanelShell>
  );
}

export function ManipulationGuardrailPanel({ values, onChange, onClose }) {
  const g = values.guardrails?.manipulation ?? {};
  const set = (field) => (val) => onChange('guardrails', { ...values.guardrails, manipulation: { ...g, [field]: val } });
  return (
    <GuardrailPanelShell title="Manipulation" onClose={onClose}>
      <LabeledToggle
        name="promptInjection" label="Prompt Injection" checked={g.promptInjection ?? true} onChange={set('promptInjection')}
        showInfo tooltip="Blocks attempts to bypass or override system instructions."
      />
    </GuardrailPanelShell>
  );
}

export function ContentGuardrailPanel({ values, onChange, onClose }) {
  const g = values.guardrails?.content ?? {};
  const cats = g.categories ?? {};
  const setField = (field) => (val) => onChange('guardrails', { ...values.guardrails, content: { ...g, [field]: val } });
  const setCat = (key, field) => (val) => setField('categories')({ ...cats, [key]: { ...(cats[key] ?? {}), [field]: val } });
  const enableAll = () => setField('categories')(Object.fromEntries(CONTENT_CATEGORIES.map(c => [c.key, { ...(cats[c.key] ?? {}), enabled: true }])));
  const disableAll = () => setField('categories')(Object.fromEntries(CONTENT_CATEGORIES.map(c => [c.key, { ...(cats[c.key] ?? {}), enabled: false }])));

  return (
    <GuardrailPanelShell title="Content guardrails" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Execution mode" showInfo tooltip="Choose how guardrails run." />
        <Select value={g.executionMode ?? 'streaming'} onValueChange={(v) => setField('executionMode')(v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {EXECUTION_MODE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Action on guardrail violation" showInfo tooltip="Action to take when this guardrail triggers." />
        <Select value={g.violationAction ?? 'end_call'} onValueChange={(v) => setField('violationAction')(v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {VIOLATION_ACTION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div style={{ display: 'flex', border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden' }}>
        <button type="button" onClick={enableAll} style={{ flex: 1, padding: '8px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: font, color: '#212121' }}>All</button>
        <button type="button" onClick={disableAll} style={{ flex: 1, padding: '8px', background: '#f5f5f5', border: 'none', borderLeft: '1px solid #e0e0e0', cursor: 'pointer', fontSize: 13, fontFamily: font, color: '#212121' }}>None</button>
      </div>
      {CONTENT_CATEGORIES.map((cat) => {
        const catVals = cats[cat.key] ?? {};
        return (
          <div key={cat.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#212121', fontFamily: font }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: '#757575', fontFamily: font, marginTop: 2 }}>{cat.subtitle}</div>
              </div>
              <Switch checked={catVals.enabled ?? false} onCheckedChange={(val) => setCat(cat.key, 'enabled')(val)} />
            </div>
            {catVals.enabled && (
              <Select value={catVals.threshold ?? 'medium'} onValueChange={(v) => setCat(cat.key, 'threshold')(v)}>
                <SelectTrigger><SelectValue placeholder="Select threshold" /></SelectTrigger>
                <SelectContent>
                  {THRESHOLD_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        );
      })}
    </GuardrailPanelShell>
  );
}

export function CustomGuardrailPanel({ values, onChange, onClose }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', prompt: '', executionMode: 'streaming', violationAction: 'end_call' });
  const customs = values.guardrails?.custom ?? [];
  const setCustoms = (val) => onChange('guardrails', { ...values.guardrails, custom: val });

  const handleAdd = () => {
    if (form.name.trim() && form.prompt.trim()) {
      setCustoms([...customs, { ...form, enabled: true }]);
      setForm({ name: '', prompt: '', executionMode: 'streaming', violationAction: 'end_call' });
      setShowAdd(false);
    }
  };

  if (showAdd) {
    return (
      <GuardrailPanelShell title="Add custom guardrail" onClose={onClose}>
        <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 14, display: 'flex', gap: 10 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#616161', flexShrink: 0, marginTop: 1 }}>info</span>
          <span style={{ fontSize: 13, color: '#424242', fontFamily: font, lineHeight: '20px' }}>
            <strong>How it works:</strong> A custom guardrail uses a lightweight LLM to monitor your conversations and block responses that match your criteria.
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Name*" />
          <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Financial advice guardrail"
            style={{ height: 36, border: '1px solid #ccc', borderRadius: 4, padding: '0 10px', fontSize: 14, fontFamily: font }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Prompt*" showInfo tooltip="Describe what content this guardrail should block." />
          <Textarea name="customPrompt" value={form.prompt} onChange={(e) => setForm(f => ({ ...f, prompt: e.target.value }))} rows={4} placeholder="e.g. Block any content that provides specific financial advice..." />
        </div>
        <span style={{ fontSize: 12, color: '#757575', fontFamily: font }}>Estimated cost: ~$0.000061/min</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Execution mode" showInfo tooltip="Choose how guardrails run." />
          <Select value={form.executionMode} onValueChange={(v) => setForm(f => ({ ...f, executionMode: v }))}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {EXECUTION_MODE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Action on guardrail violation" showInfo tooltip="Action to take when this guardrail triggers." />
          <Select value={form.violationAction} onValueChange={(v) => setForm(f => ({ ...f, violationAction: v }))}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {VIOLATION_ACTION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={handleAdd}>Add guardrail</Button>
          <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
        </div>
      </GuardrailPanelShell>
    );
  }

  return (
    <GuardrailPanelShell title="Custom guardrails" onClose={onClose}>
      <button type="button" onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', border: '1px solid #e0e0e0', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: font, color: '#212121', width: '100%' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
        Add new guardrail
      </button>
      {customs.map((g, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#212121', fontFamily: font }}>{g.name}</span>
            <Switch checked={g.enabled ?? true} onCheckedChange={(val) => setCustoms(customs.map((c, j) => j === i ? { ...c, enabled: val } : c))} />
          </div>
          {g.prompt && <span style={{ fontSize: 12, color: '#757575', fontFamily: font }}>{g.prompt}</span>}
          <button type="button" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid #e0e0e0', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 13, fontFamily: font, color: '#424242' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>Edit
          </button>
        </div>
      ))}
    </GuardrailPanelShell>
  );
}

export function GuardrailPanels({ guardrailPanel, onClose, values, onChange }) {
  if (guardrailPanel === 'focus') return <FocusGuardrailPanel values={values} onChange={onChange} onClose={onClose} />;
  if (guardrailPanel === 'manipulation') return <ManipulationGuardrailPanel values={values} onChange={onChange} onClose={onClose} />;
  if (guardrailPanel === 'content') return <ContentGuardrailPanel values={values} onChange={onChange} onClose={onClose} />;
  if (guardrailPanel === 'custom') return <CustomGuardrailPanel values={values} onChange={onChange} onClose={onClose} />;
  return null;
}

export default function CrossChannelTab({ values, onChange, onOpenGuardrailPanel }) {
  const set = (field) => (val) => onChange(field, val);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <CollapsibleSection title="Language & Model" defaultOpen>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="LLM Model" showInfo tooltip="Default language model used for generating responses across all channels." />
            <Select value={values.llmModel ?? 'Fast'} onValueChange={(v) => set('llmModel')(v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {LLM_MODEL_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={values.adjustLLMTemperature ?? false}
                onChange={(e) => set('adjustLLMTemperature')(e.target.checked)}
                style={{ accentColor: '#1976d2', width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: '#212121', fontFamily: font }}>Adjust LLM temperature</span>
            </label>
            {values.adjustLLMTemperature && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <FieldLabel label="LLM Temperature" showInfo tooltip="Controls randomness in model responses. Higher values produce more varied output." />
                <RangeSlider name="llmTemperature" currentValue={values.llmTemperature ?? 0.7}
                  minValue={0} maxValue={2} step={0.1}
                  sliderChangeCallback={set('llmTemperature')} />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Language" showInfo tooltip="Default language for agent responses across all channels." />
            <Select value={values.language ?? 'English'} onValueChange={(v) => set('language')(v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Access">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
          <LabeledToggle name="enableAuthentication" label="Enable authentication"
            checked={values.enableAuthentication ?? false} onChange={set('enableAuthentication')} />
          <AllowlistField hosts={Array.isArray(values.allowlist) ? values.allowlist : []} onChange={set('allowlist')} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Guardrails">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
          <LabeledToggle name="guardrailFocus" label="Focus guardrail"
            checked={values.guardrails?.focus?.enabled ?? true}
            onChange={(val) => onChange('guardrails', { ...values.guardrails, focus: { ...(values.guardrails?.focus ?? {}), enabled: val } })}
            showInfo tooltip="Keeps the agent focused on its defined goal and system instructions, preventing it from drifting into unintended behavior or off-topic discussions." />
          <LabeledToggle name="guardrailPromptInjection" label="Prompt Injection"
            checked={values.guardrails?.manipulation?.promptInjection ?? true}
            onChange={(val) => onChange('guardrails', { ...values.guardrails, manipulation: { ...(values.guardrails?.manipulation ?? {}), promptInjection: val } })}
            showInfo tooltip="Blocks attempts to bypass or override system instructions." />
          {[{ key: 'content', label: 'Content guardrails' }, { key: 'custom', label: 'Custom guardrails' }].map((item) => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: '#212121', fontFamily: font }}>{item.label}</span>
              <Button variant="outline" size="sm" onClick={() => onOpenGuardrailPanel(item.key)}>Edit</Button>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Overrides">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 0' }}>
          {OVERRIDE_OPTIONS.map((opt) => {
            const checked = values.overrides?.[opt.key] ?? (opt.key === 'textOnly');
            return (
              <div key={opt.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontSize: 14, color: '#212121', fontFamily: font }}>{opt.label}</span>
                <Switch checked={checked} onCheckedChange={(val) => set('overrides')({ ...values.overrides, [opt.key]: val })} />
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Webhooks">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
          <LabeledToggle name="fetchInitiationClientData" label="Fetch initiation client data from a webhook"
            checked={values.fetchInitiationClientData ?? false} onChange={set('fetchInitiationClientData')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: '#212121', fontFamily: font }}>Post-call webhook</span>
              <Button variant="outline" size="sm" onClick={() => {}}>Create Webhook</Button>
            </div>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#9e9e9e', fontFamily: font }}>No post-call webhook configured.</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Data & Privacy">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
          <LabeledToggle name="zeroRetentionMode" label="Zero Retention Mode"
            checked={values.zeroRetentionMode ?? false} onChange={set('zeroRetentionMode')}
            showInfo tooltip="The contents of the conversation, including all input and output, will not be logged or stored. May impact our ability to debug calls." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Conversations Retention Period" showInfo tooltip="Set the number of days to keep the conversations (-1 for unlimited)." />
            <NumberInputWithSuffix value={values.conversationsRetentionPeriod ?? -1}
              onChange={set('conversationsRetentionPeriod')} suffix="Days" negativeLabel="Unlimited" />
          </div>
          <LabeledToggle name="enableCoaching" label="Enable coaching" badge="Alpha"
            checked={values.enableCoaching ?? false} onChange={set('enableCoaching')} />
        </div>
      </CollapsibleSection>
    </div>
  );
}
