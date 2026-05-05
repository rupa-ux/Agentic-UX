import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';

const font = '"Roboto", arial, sans-serif';

const toOptions = (items) => items.map((item) => ({ value: item, label: item }));

const CATEGORY_OPTIONS = {
  Reviews:      toOptions(['When a new review is received', 'When a review is updated', 'When a review is responded', 'When a new review is received or updated']),
  Listings:     toOptions(['When a listing is updated', 'When a new listing is added', 'When listing data changes']),
  Social:       toOptions(['When a new post is published', 'When a comment is received', 'When a mention is detected']),
  Appointments: toOptions(['When an appointment is booked', 'When an appointment is cancelled', 'When an appointment is rescheduled']),
  Contacts:     toOptions(['When a new contact is added', 'When a contact is updated', 'When a contact is merged']),
  Ticketing:    toOptions(['When a new ticket is created', 'When a ticket is updated', 'When a ticket is resolved']),
  Payments:     toOptions(['When a payment is received', 'When a payment fails', 'When a refund is issued']),
};

const ENTITY_OPTIONS = Object.keys(CATEGORY_OPTIONS);

function FieldLabel({ label, required }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
      {label}{required && <span style={{ color: '#de1b0c' }}> *</span>}
    </span>
  );
}

export default function EntityTriggerBody({ category, initialValues = {}, onChange }) {
  const isGeneric = !CATEGORY_OPTIONS[category];
  const [selectedEntity, setSelectedEntity] = useState(initialValues.entity ?? '');
  const [description, setDescription] = useState(initialValues.description ?? '');

  const resolvedCategory = isGeneric ? selectedEntity : category;
  const triggerOptions = CATEGORY_OPTIONS[resolvedCategory] ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {isGeneric && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Entity" required />
          <Select
            value={selectedEntity}
            onValueChange={(v) => { setSelectedEntity(v); onChange?.('entity', v); onChange?.('triggerName', ''); }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select entity" />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_OPTIONS.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Trigger" required />
        <Select
          value={initialValues.triggerName || ''}
          onValueChange={(v) => onChange?.('triggerName', v)}
          disabled={isGeneric && !selectedEntity}
        >
          <SelectTrigger>
            <SelectValue placeholder={isGeneric && !selectedEntity ? 'Select entity first' : 'Select trigger'} />
          </SelectTrigger>
          <SelectContent>
            {triggerOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Description" />
        <Textarea
          name="description"
          placeholder="Enter description"
          value={description}
          onChange={(e) => { setDescription(e.target.value); onChange?.('description', e.target.value); }}
        />
      </div>
    </div>
  );
}
