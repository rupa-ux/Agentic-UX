import React, { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';

const font = '"Roboto", arial, sans-serif';
function FieldLabel({ label, required }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>{label}</span>
      {required && <span style={{ color: '#de1b0c', fontSize: 12 }}>*</span>}
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

export default function StartBody({ initialValues = {} }) {
  const [agentName, setAgentName] = useState(initialValues.agentName ?? '');
  const [description, setDescription] = useState(initialValues.description ?? '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField label="Agent name" required>
        <Input name="agentName" type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
      </FormField>
      <FormField label="Description">
        <Textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>
    </div>
  );
}
