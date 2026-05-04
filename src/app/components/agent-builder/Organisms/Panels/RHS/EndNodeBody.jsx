import React, { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const font = '"Roboto", arial, sans-serif';

const FEEDBACK_TYPE_OPTIONS = [
  { value: 'CSAT', label: 'CSAT' },
  { value: 'NPS', label: 'NPS' },
  { value: 'custom', label: 'Custom' },
];

const END_STATE_OPTIONS = [
  { value: 'resolved', label: 'Resolved' },
  { value: 'unresolved', label: 'Unresolved' },
];

function FieldLabel({ label, required }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
        {label}
      </span>
      {required && <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>}
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label={label} required={required} />
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, lineHeight: '20px', color: '#212121', fontFamily: font }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
          background: checked ? '#1976d2' : '#ccc', position: 'relative', transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}

export default function EndNodeBody({ initialValues = {} }) {
  const [values, setValues] = useState({
    name: initialValues.name ?? 'Close',
    description: initialValues.description ?? '',
    closingMessage: initialValues.closingMessage ?? '',
    collectFeedback: initialValues.collectFeedback ?? false,
    feedbackType: initialValues.feedbackType ?? 'CSAT',
    endState: initialValues.endState ?? 'resolved',
  });

  const set = (field) => (val) => setValues((v) => ({ ...v, [field]: val }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField label="Name">
        <Input name="name" type="text" placeholder="Enter name" value={values.name} readOnly />
      </FormField>

      <FormField label="Description">
        <Textarea
          name="description"
          placeholder="Enter description"
          value={values.description}
          onChange={(e) => set('description')(e.target.value)}
        />
      </FormField>

      <FormField label="Closing message">
        <Textarea
          name="closingMessage"
          placeholder="Message to send when closing the conversation..."
          value={values.closingMessage}
          onChange={(e) => set('closingMessage')(e.target.value)}
        />
      </FormField>

      <Toggle
        label="Collect feedback"
        checked={values.collectFeedback}
        onChange={set('collectFeedback')}
      />

      {values.collectFeedback && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Feedback type" />
          <Select value={values.feedbackType} onValueChange={(v) => set('feedbackType')(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {FEEDBACK_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="End state" required />
        <Select value={values.endState} onValueChange={(v) => set('endState')(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {END_STATE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
