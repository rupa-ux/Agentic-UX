import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const font = '"Roboto", arial, sans-serif';

const TYPE_OPTIONS = [
  { value: 'Response', label: 'Response' },
  { value: 'Transfer', label: 'Transfer' },
  { value: 'Close',    label: 'End' },
];

export default function ConversationTypeBody({ initialValues = {}, onTypeSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
        Type <span style={{ color: '#de1b0c' }}>*</span>
      </span>
      <Select
        value={initialValues.conversationType || ''}
        onValueChange={(v) => onTypeSelect?.(v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
