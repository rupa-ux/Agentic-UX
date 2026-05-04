import React, { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import RHSPanelHeader from '../../RHSHeader/RHSHeader';
import RHSPanelFooter from '../../RHSFooter/RHSFooter';

const font = '"Roboto", arial, sans-serif';

const DEFAULT_FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Monthly'];
const DEFAULT_DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_TIME = { hours: '12', minutes: '00', meridiem: 'am' };

function FieldLabel({ label, required }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>{label}</span>
      {required && <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>}
    </div>
  );
}

function TimePicker({ time, onChange }) {
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Select value={time.hours} onValueChange={(v) => onChange({ ...time, hours: v })}>
        <SelectTrigger style={{ width: 80 }}><SelectValue /></SelectTrigger>
        <SelectContent>{hours.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
      </Select>
      <span style={{ fontFamily: font, color: '#212121' }}>:</span>
      <Select value={time.minutes} onValueChange={(v) => onChange({ ...time, minutes: v })}>
        <SelectTrigger style={{ width: 80 }}><SelectValue /></SelectTrigger>
        <SelectContent>{minutes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={time.meridiem} onValueChange={(v) => onChange({ ...time, meridiem: v })}>
        <SelectTrigger style={{ width: 80 }}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="am">AM</SelectItem>
          <SelectItem value="pm">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function ScheduleBasedBody({
  frequencyOptions = DEFAULT_FREQUENCY_OPTIONS,
  dayOptions = DEFAULT_DAY_OPTIONS,
  defaultFrequency,
  defaultDay,
  defaultTime,
}) {
  const [frequency, setFrequency] = useState(defaultFrequency ?? null);
  const [day, setDay] = useState(defaultDay ?? null);
  const [time, setTime] = useState(defaultTime ?? DEFAULT_TIME);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>
          Trigger name <span style={{ color: '#de1b0c' }}>*</span>
        </label>
        <Input name="triggerName" type="text" value="Schedule based" readOnly required />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>
          Description <span style={{ color: '#de1b0c' }}>*</span>
        </label>
        <Textarea name="description" value="Runs the workflow on a set schedule" readOnly required rows={3} style={{ resize: 'none' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Frequency" required />
        <Select value={frequency ?? ''} onValueChange={(v) => setFrequency(v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {frequencyOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Day" required />
        <Select value={day ?? ''} onValueChange={(v) => setDay(v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {dayOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <FieldLabel label="Time" required />
        <TimePicker time={time} onChange={setTime} />
      </div>
    </div>
  );
}

export default function ScheduleBased({
  onClose,
  onExpand,
  onPreview,
  onSave,
  frequencyOptions = DEFAULT_FREQUENCY_OPTIONS,
  dayOptions = DEFAULT_DAY_OPTIONS,
  defaultFrequency,
  defaultDay,
  defaultTime,
}) {
  const [frequency, setFrequency] = useState(defaultFrequency ?? null);
  const [day, setDay] = useState(defaultDay ?? null);
  const [time, setTime] = useState(defaultTime ?? DEFAULT_TIME);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 390, height: '100%', background: '#ffffff', borderLeft: '1px solid #e5e9f0', fontFamily: font }}>
      <RHSPanelHeader title="Trigger" showActions onPreview={onPreview} onExpand={onExpand} onClose={onClose} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 15px', boxSizing: 'border-box' }}>
        <ScheduleBasedBody
          frequencyOptions={frequencyOptions}
          dayOptions={dayOptions}
          defaultFrequency={frequency}
          defaultDay={day}
          defaultTime={time}
        />
      </div>
      <RHSPanelFooter onSave={() => onSave?.({ frequency, day, time })} />
    </div>
  );
}
