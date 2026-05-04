import React, { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const font = '"Roboto", arial, sans-serif';
const helpTextStyle = { fontSize: 11, lineHeight: '16px', color: '#8f8f8f', fontFamily: font };

const ITERATE_OVER_OPTIONS = [
  { value: 'reviews_list', label: '{{reviews_list}}' },
  { value: 'items', label: '{{items}}' },
  { value: 'contacts', label: '{{contacts}}' },
  { value: 'results', label: '{{results}}' },
];

const CONCURRENCY_OPTIONS = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
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

export default function SubWorkflowBody({ initialValues = {} }) {
  const [name, setName] = useState(initialValues.name ?? '');
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [iterateOver, setIterateOver] = useState(initialValues.iterateOver ?? null);
  const [maxConcurrency, setMaxConcurrency] = useState(initialValues.maxConcurrency ?? '10');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField label="Name" required>
        <Input name="subWorkflowName" type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <FormField label="Description">
        <Textarea name="description" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Iterate over" showInfo />
        <Select value={iterateOver ?? ''} onValueChange={(v) => setIterateOver(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select array variable" />
          </SelectTrigger>
          <SelectContent>
            {ITERATE_OVER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span style={helpTextStyle}>Select the array variable to process each item through this workflow</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Max concurrency" showInfo />
        <Select value={maxConcurrency} onValueChange={(v) => setMaxConcurrency(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {CONCURRENCY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span style={helpTextStyle}>Maximum number of items to process simultaneously</span>
      </div>
    </div>
  );
}
