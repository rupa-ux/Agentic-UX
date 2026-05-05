import React, { useState, useEffect } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const font = '"Roboto", arial, sans-serif';

const TRANSFER_TO_OPTIONS = [
  { value: 'agent', label: 'Agent' },
  { value: 'phone-number', label: 'Phone number' },
];

const TRANSFER_TYPE_OPTIONS = [
  { value: 'conference', label: 'Conference' },
  { value: 'sip-refer', label: 'SIP Refer' },
];

const DESTINATION_TYPE_OPTIONS = [
  { value: 'phone-number', label: 'Phone number' },
  { value: 'dynamic-variable', label: 'Phone number as dynamic variable' },
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

function AddIfAny({ label, value, onChange, placeholder }) {
  const [expanded, setExpanded] = useState(!!value);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', alignSelf: 'flex-start' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#1976d2' }}>add_circle</span>
        <span style={{ fontSize: 14, lineHeight: '20px', color: '#1976d2', fontFamily: font }}>Add {label}</span>
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label={label} />
      <Input
        name={label.toLowerCase().replace(/\s/g, '-')}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function TransferNodeBody({ initialValues = {}, onValuesChange }) {
  const [values, setValues] = useState({
    name: 'Transfer',
    description: initialValues.description ?? '',
    transferTo: initialValues.transferTo ?? 'agent',
    selectedAgent: initialValues.selectedAgent ?? '',
    delayBeforeTransfer: initialValues.delayBeforeTransfer ?? '',
    transferMessage: initialValues.transferMessage ?? '',
    transferType: initialValues.transferType ?? 'conference',
    destinationType: initialValues.destinationType ?? 'phone-number',
    phoneNumber: initialValues.phoneNumber ?? '',
    postDialDigits: initialValues.postDialDigits ?? '',
    sipHeader: initialValues.sipHeader ?? '',
  });

  const set = (field) => (val) => setValues((v) => ({ ...v, [field]: val }));
  const setFromEvent = (field) => (e) => set(field)(e.target.value);

  useEffect(() => {
    onValuesChange?.({ ...values, name: 'Transfer' });
  }, [values]);

  const isAgent = values.transferTo === 'agent';
  const isPhone = values.transferTo === 'phone-number';
  const isConference = values.transferType === 'conference';
  const isSipRefer = values.transferType === 'sip-refer';

  const agentOptions = [
    { value: 'agent-1', label: 'Support Agent' },
    { value: 'agent-2', label: 'Sales Agent' },
    { value: 'agent-3', label: 'Billing Agent' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField label="Name">
        <Input name="name" type="text" placeholder="Enter name" value={values.name} readOnly />
      </FormField>

      <FormField label="Description">
        <Textarea name="description" placeholder="Enter description" value={values.description} onChange={(e) => set('description')(e.target.value)} />
      </FormField>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Transfer to" required />
        <Select value={values.transferTo} onValueChange={(v) => set('transferTo')(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {TRANSFER_TO_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAgent && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Select agent" required />
            <Select value={values.selectedAgent} onValueChange={(v) => set('selectedAgent')(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {agentOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FormField label="Delay before transfer (seconds)">
            <Input name="delayBeforeTransfer" type="number" value={values.delayBeforeTransfer} onChange={setFromEvent('delayBeforeTransfer')} min="0" />
          </FormField>
          <FormField label="Transfer message">
            <Textarea name="transferMessage" placeholder="Enter message" value={values.transferMessage} onChange={setFromEvent('transferMessage')} />
          </FormField>
        </>
      )}

      {isPhone && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Transfer type" required />
            <Select value={values.transferType} onValueChange={(v) => set('transferType')(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {TRANSFER_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FieldLabel label="Destination type" required />
            <Select value={values.destinationType} onValueChange={(v) => set('destinationType')(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {DESTINATION_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FormField label={values.destinationType === 'dynamic-variable' ? 'Variable name' : 'Phone number'} required>
            <Input
              name="phoneNumber"
              type="text"
              placeholder={values.destinationType === 'dynamic-variable' ? '{{phone_number}}' : '+1 (555) 000-0000'}
              value={values.phoneNumber}
              onChange={setFromEvent('phoneNumber')}
            />
          </FormField>
          {isConference && (
            <AddIfAny
              label="Post dial digits"
              value={values.postDialDigits}
              onChange={set('postDialDigits')}
              placeholder="e.g. 1234#"
            />
          )}
          {isSipRefer && (
            <AddIfAny
              label="SIP header"
              value={values.sipHeader}
              onChange={set('sipHeader')}
              placeholder="e.g. X-Custom-Header: value"
            />
          )}
        </>
      )}
    </div>
  );
}
