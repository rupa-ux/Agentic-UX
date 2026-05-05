import React, { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';

const font = '"Roboto", arial, sans-serif';

const CHANNEL_TRIGGER_OPTIONS = {
  Voice: [{ value: 'Call received', label: 'Call received' }],
  Text: [{ value: 'Message received', label: 'Message received' }],
  Webchat: [{ value: 'Message received', label: 'Message received' }],
};

const TIME_CONDITION_OPTIONS = [
  { value: 'during_business_hours', label: 'During business hours' },
  { value: 'before_business_hours', label: 'Before business hours' },
  { value: 'after_business_hours',  label: 'After business hours' },
  { value: 'custom',                label: 'Custom' },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const ampm = i < 12 ? 'AM' : 'PM';
  const h = i % 12 === 0 ? 12 : i % 12;
  return { value: `${String(i).padStart(2, '0')}:00`, label: `${String(h).padStart(2, '0')}:00 ${ampm}` };
});

function makeDefaultSlot() {
  return { open: '09:00', close: '17:00' };
}

function makeDefaultSchedule() {
  return Object.fromEntries(DAYS_OF_WEEK.map((d) => [d, { closed: false, slots: [makeDefaultSlot()] }]));
}

function TimeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const label = HOUR_OPTIONS.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 110, flex: 1 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px', border: '1px solid var(--border-onlightsurface-default, #e5e9f0)',
          borderRadius: 4, background: '#fff', cursor: 'pointer', fontFamily: font, fontSize: 13,
          color: 'var(--text-onlightsurface-primary, #212121)',
        }}
      >
        <span>{label}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
      </button>
      {open && (
        <ul style={{
          position: 'absolute', top: 'calc(100% + 2px)', left: 0, zIndex: 200, margin: 0, padding: '4px 0',
          listStyle: 'none', background: '#fff', border: '1px solid #e5e9f0',
          borderRadius: 4, boxShadow: '0 4px 8px rgba(33,33,33,0.18)',
          maxHeight: 220, overflowY: 'auto', minWidth: '100%',
        }}>
          {HOUR_OPTIONS.map((opt) => (
            <li
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontFamily: font,
                background: opt.value === value ? '#f0f4ff' : 'transparent',
                color: '#212121',
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BusinessHoursSchedule({ schedule, onChange }) {
  const updateSlot = (day, slotIdx, field, val) => {
    const dayData = schedule[day];
    const newSlots = dayData.slots.map((s, i) => i === slotIdx ? { ...s, [field]: val } : s);
    onChange({ ...schedule, [day]: { ...dayData, slots: newSlots } });
  };

  const addSlot = (day) => {
    const dayData = schedule[day];
    onChange({ ...schedule, [day]: { ...dayData, slots: [...dayData.slots, makeDefaultSlot()] } });
  };

  const removeSlot = (day, slotIdx) => {
    const dayData = schedule[day];
    onChange({ ...schedule, [day]: { ...dayData, slots: dayData.slots.filter((_, i) => i !== slotIdx) } });
  };

  const toggleClosed = (day) => {
    const dayData = schedule[day];
    onChange({ ...schedule, [day]: { ...dayData, closed: !dayData.closed } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12, width: '100%' }}>
      {DAYS_OF_WEEK.map((day) => {
        const { closed, slots } = schedule[day];
        return (
          <div key={day} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 80, flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontFamily: font, fontWeight: 500, color: '#212121', lineHeight: '20px' }}>{day}</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', userSelect: 'none' }}>
                <input type="checkbox" checked={closed} onChange={() => toggleClosed(day)} style={{ accentColor: '#1976d2', width: 13, height: 13 }} />
                <span style={{ fontSize: 11, fontFamily: font, color: '#616161' }}>Closed</span>
              </label>
            </div>
            {!closed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {slots.map((slot, slotIdx) => (
                  <div key={slotIdx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TimeDropdown value={slot.open} onChange={(v) => updateSlot(day, slotIdx, 'open', v)} />
                    <TimeDropdown value={slot.close} onChange={(v) => updateSlot(day, slotIdx, 'close', v)} />
                    {slotIdx === slots.length - 1 ? (
                      <button type="button" onClick={() => addSlot(day)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: '#616161', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>add_circle</span>
                      </button>
                    ) : (
                      <button type="button" onClick={() => removeSlot(day, slotIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: '#616161', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>do_not_disturb_on</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TimeConditionSelect({ value, onTimeChange, onConfigureCustom }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
        Select time
      </span>
      <Select value={value || ''} onValueChange={(v) => onTimeChange(v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {TIME_CONDITION_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === 'custom' && (
        <button
          type="button"
          onClick={onConfigureCustom}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, fontFamily: font, color: '#1976d2', textDecoration: 'underline' }}
        >
          Set schedule
        </button>
      )}
    </div>
  );
}

export default function InboxTriggerBody({ channel = 'Voice', initialValues = {}, onChange }) {
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [timeCondition, setTimeCondition] = useState(initialValues.timeCondition ?? '');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [draftSchedule, setDraftSchedule] = useState(null);
  const [savedSchedule, setSavedSchedule] = useState(initialValues.schedule ?? makeDefaultSchedule());

  const selectOptions = CHANNEL_TRIGGER_OPTIONS[channel] ?? [];

  const handleTimeChange = (val) => {
    setTimeCondition(val);
    onChange?.('timeCondition', val);
  };

  const handleScheduleSave = (schedule) => {
    setSavedSchedule(schedule);
    onChange?.('schedule', schedule);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>
          Trigger <span style={{ color: '#de1b0c' }}>*</span>
        </span>
        <Select value={initialValues.triggerName || ''} onValueChange={(v) => onChange?.('triggerName', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select trigger" />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>Description</span>
        <Textarea
          name="description"
          placeholder="Enter description"
          value={description}
          onChange={(e) => { setDescription(e.target.value); onChange?.('description', e.target.value); }}
        />
      </div>
      <TimeConditionSelect
        value={timeCondition}
        onTimeChange={handleTimeChange}
        onConfigureCustom={() => {
          setDraftSchedule(savedSchedule);
          setScheduleModalOpen(true);
        }}
      />
      <Dialog open={scheduleModalOpen && !!draftSchedule} onOpenChange={(open) => { if (!open) setScheduleModalOpen(false); }}>
        <DialogContent style={{ maxWidth: 560, maxHeight: '80vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>Custom schedule</DialogTitle>
          </DialogHeader>
          {draftSchedule && (
            <BusinessHoursSchedule schedule={draftSchedule} onChange={setDraftSchedule} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleModalOpen(false)}>Cancel</Button>
            <Button onClick={() => { handleScheduleSave(draftSchedule); setScheduleModalOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
