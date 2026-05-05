import React, { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import LocationsDrawer from '../../../RHSDrawer/LocationsDrawer.jsx';

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

export default function AgentDetailsBody({ values: externalValues, onChange }) {
  const [internalValues, setInternalValues] = useState({ agentName: '', goals: '', outcomes: '', locations: [] });
  const [showLocations, setShowLocations] = useState(false);
  const values = externalValues ?? internalValues;
  const set = onChange
    ? (field) => (e) => onChange(field, e.target.value)
    : (field) => (e) => setInternalValues((v) => ({ ...v, [field]: e.target.value }));

  const handleLocationsSave = (selected) => {
    if (onChange) {
      onChange('locations', selected);
    } else {
      setInternalValues((v) => ({ ...v, locations: selected }));
    }
    setShowLocations(false);
  };

  if (showLocations) {
    return (
      <LocationsDrawer
        selectedIds={(values.locations || []).map((l) => l.id)}
        onBack={() => setShowLocations(false)}
        onSave={handleLocationsSave}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField label="Agent name" required>
        <Input name="agentName" type="text" value={values.agentName} onChange={set('agentName')} />
      </FormField>
      <FormField label="Goals" required>
        <Textarea name="goals" value={values.goals} onChange={set('goals')} />
      </FormField>
      <FormField label="Outcomes">
        <Textarea name="outcomes" value={values.outcomes} onChange={set('outcomes')} />
      </FormField>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 400, lineHeight: '18px', fontFamily: font }}>
          <span style={{ color: '#212121' }}>Locations</span>
          <span style={{ color: '#de1b0c' }}>*</span>
          <i className="icon_phoenix-info" style={{ fontSize: 16, color: '#8f8f8f', cursor: 'pointer' }} />
        </div>
        <span onClick={() => setShowLocations(true)} style={{ fontSize: 14, fontWeight: 500, lineHeight: '20px', color: '#1976d2', cursor: 'pointer', fontFamily: font }}>
          + Add
        </span>
      </div>
    </div>
  );
}
