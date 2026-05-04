import React, { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const font = '"Roboto", arial, sans-serif';

const UNIT_OPTIONS = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'seconds', label: 'Seconds' },
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

export default function DelayBody({ initialValues = {}, onChange }) {
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [duration, setDuration] = useState(initialValues.duration ?? '');
  const [unit, setUnit] = useState(initialValues.unit ?? 'minutes');

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    onChange?.('description', e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField label="Name">
        <Input name="delayName" type="text" value="Delay" readOnly disabled />
      </FormField>

      <FormField label="Description">
        <Input
          name="delayDescription"
          type="text"
          placeholder="Enter description"
          value={description}
          onChange={handleDescriptionChange}
        />
      </FormField>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Wait duration" required />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Input
              name="duration"
              type="number"
              placeholder="Enter value"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={1}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Select value={unit} onValueChange={(v) => setUnit(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
