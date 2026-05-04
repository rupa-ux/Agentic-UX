import React, { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const font = '"Roboto", arial, sans-serif';

const helpTextStyle = { fontSize: 11, lineHeight: '16px', color: '#8f8f8f', fontFamily: font };

const LOOP_OVER_OPTIONS = [
  { value: 'reviews_list', label: '{{reviews_list}}' },
  { value: 'items', label: '{{items}}' },
  { value: 'contacts', label: '{{contacts}}' },
  { value: 'results', label: '{{results}}' },
];

function FieldLabel({ label, required, showInfo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
        {label}
      </span>
      {required && <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>}
      {showInfo && <i className="icon_phoenix-info" style={{ fontSize: 16, color: '#8f8f8f', cursor: 'pointer' }} />}
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

export default function LoopBody({ initialValues = {} }) {
  const [name, setName] = useState(initialValues.name ?? '');
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [loopMode, setLoopMode] = useState(initialValues.loopMode ?? 'manual');
  const [loopOver, setLoopOver] = useState(initialValues.loopOver ?? null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField label="Name" required>
        <Input name="loopName" type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <FormField label="Description">
        <Textarea name="description" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>
          How should this loop run?
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="radio" name="loopMode" value="manual" checked={loopMode === 'manual'} onChange={() => setLoopMode('manual')} style={{ accentColor: '#1976d2' }} />
            <span style={{ fontSize: 14, color: '#212121', fontFamily: font }}>Manual</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="radio" name="loopMode" value="variable" checked={loopMode === 'variable'} onChange={() => setLoopMode('variable')} style={{ accentColor: '#1976d2' }} />
            <span style={{ fontSize: 14, color: '#212121', fontFamily: font }}>Set from variable</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Loop over" showInfo />
        <Select value={loopOver ?? ''} onValueChange={(v) => setLoopOver(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {LOOP_OVER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span style={helpTextStyle}>Select the variable to iterate over</span>
      </div>
    </div>
  );
}
