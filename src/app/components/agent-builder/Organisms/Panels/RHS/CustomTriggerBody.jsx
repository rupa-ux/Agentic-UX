import React, { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

const font = '"Roboto", arial, sans-serif';

const INBOX_EVENT_GROUPS = [
  { group: 'Text', events: [{ value: 'Text:Message received', label: 'Message received' }] },
  { group: 'Voice', events: [{ value: 'Voice:Call received', label: 'Call received' }] },
  { group: 'Webchat', events: [{ value: 'Webchat:Message received', label: 'Message received' }] },
];

const ENTITY_EVENTS = {
  Reviews:      ['When a new review is received', 'When a review is updated', 'When a review is responded', 'When a new review is received or updated'],
  Listings:     ['When a listing is updated', 'When a new listing is added', 'When listing data changes'],
  Social:       ['When a new post is published', 'When a comment is received', 'When a mention is detected'],
  Appointments: ['When an appointment is booked', 'When an appointment is cancelled', 'When an appointment is rescheduled'],
  Contacts:     ['When a new contact is added', 'When a contact is updated', 'When a contact is merged'],
  Ticketing:    ['When a new ticket is created', 'When a ticket is updated', 'When a ticket is resolved'],
  Payments:     ['When a payment is received', 'When a payment fails', 'When a refund is issued'],
};

const ENTITY_OPTIONS = [
  { value: 'Inbox', label: 'Inbox' },
  ...Object.keys(ENTITY_EVENTS).map((e) => ({ value: e, label: e })),
];

const TIME_CONDITION_OPTIONS = [
  { value: 'during_business_hours',  label: 'During business hours' },
  { value: 'before_business_hours',  label: 'Before business hours' },
  { value: 'after_business_hours',   label: 'After business hours' },
  { value: 'custom',                 label: 'Custom' },
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
      <button type="button" onClick={() => setOpen((v) => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', border: '1px solid var(--border-onlightsurface-default, #e5e9f0)', borderRadius: 4, background: '#fff', cursor: 'pointer', fontFamily: font, fontSize: 13, color: 'var(--text-onlightsurface-primary, #212121)' }}>
        <span>{label}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
      </button>
      {open && (
        <ul style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 0, zIndex: 200, margin: 0, padding: '4px 0', listStyle: 'none', background: '#fff', border: '1px solid #e5e9f0', borderRadius: 4, boxShadow: '0 4px 8px rgba(33,33,33,0.18)', maxHeight: 220, overflowY: 'auto', minWidth: '100%' }}>
          {HOUR_OPTIONS.map((opt) => (
            <li key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{ padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontFamily: font, background: opt.value === value ? '#f0f4ff' : 'transparent', color: '#212121' }}>
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
        <button type="button" onClick={onConfigureCustom} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, fontFamily: font, color: '#1976d2', textDecoration: 'underline' }}>
          Set schedule
        </button>
      )}
    </div>
  );
}

function GroupedMultiselect({ groups, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle = (value) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const totalSelected = selected.length;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((v) => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid var(--border-onlightsurface-default, #e5e9f0)', borderRadius: 4, background: '#fff', cursor: 'pointer', fontFamily: font, fontSize: 13, color: totalSelected > 0 ? 'var(--text-onlightsurface-primary, #212121)' : '#9e9e9e', boxSizing: 'border-box' }}>
        <span>{totalSelected > 0 ? `${totalSelected} event${totalSelected !== 1 ? 's' : ''} selected` : 'Select'}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#616161' }}>{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0, zIndex: 200, background: '#fff', border: '1px solid #e5e9f0', borderRadius: 4, boxShadow: '0 4px 12px rgba(33,33,33,0.15)', overflow: 'hidden', padding: '16px 0' }}>
          {groups.map(({ group, events }) => (
            <div key={group} style={{ paddingBottom: 12 }}>
              <div style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, color: '#9e9e9e', fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{group}</div>
              {events.map(({ value, label }) => (
                <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', background: selected.includes(value) ? '#f5f8ff' : 'transparent' }}>
                  <input type="checkbox" checked={selected.includes(value)} onChange={() => toggle(value)} style={{ accentColor: '#1976d2', width: 14, height: 14, cursor: 'pointer' }} />
                  <span style={{ fontSize: 13, fontFamily: font, color: '#212121' }}>{label}</span>
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldLabel({ label, required }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font }}>{label}</span>
      {required && <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>}
    </div>
  );
}

export default function CustomTriggerBody({ initialValues = {}, onChange, onValuesChange }) {
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [entityType, setEntityType] = useState(initialValues.entityType ?? '');
  const [selectedEvents, setSelectedEvents] = useState(initialValues.selectedEvents ?? []);
  const [eventTimeMap, setEventTimeMap] = useState(initialValues.eventTimeMap ?? {});
  const [scheduleModalEvent, setScheduleModalEvent] = useState(null);
  const [draftSchedule, setDraftSchedule] = useState(null);
  const [activeInboxTab, setActiveInboxTab] = useState(() => (initialValues.selectedEvents ?? [])[0] ?? null);

  useEffect(() => {
    onValuesChange?.({ name: 'Custom', description, entityType, selectedEvents, eventTimeMap });
  }, [description, entityType, selectedEvents, eventTimeMap]);

  const handleEntityChange = (value) => {
    setEntityType(value);
    setSelectedEvents([]);
    setEventTimeMap({});
  };

  const handleInboxEventsChange = (vals) => {
    const added = vals.filter((v) => !selectedEvents.includes(v));
    const removed = selectedEvents.filter((v) => !vals.includes(v));
    added.forEach((v) => {
      setEventTimeMap((m) => ({ ...m, [v]: { timeCondition: '', schedule: makeDefaultSchedule() } }));
    });
    removed.forEach((v) => {
      setEventTimeMap((m) => { const copy = { ...m }; delete copy[v]; return copy; });
    });
    setSelectedEvents(vals);
    setActiveInboxTab((prev) => {
      if (prev && vals.includes(prev)) return prev;
      return vals[0] ?? null;
    });
  };

  const toggleEvent = (event) => {
    setSelectedEvents((prev) => {
      if (prev.includes(event)) return prev.filter((e) => e !== event);
      setEventTimeMap((m) => ({ ...m, [event]: { timeCondition: '', schedule: makeDefaultSchedule() } }));
      return [...prev, event];
    });
  };

  const handleTimeConditionChange = (eventKey, value) => {
    setEventTimeMap((prev) => {
      const existing = prev[eventKey] ?? { timeCondition: '', schedule: makeDefaultSchedule() };
      return { ...prev, [eventKey]: { ...existing, timeCondition: value } };
    });
  };

  const handleScheduleChange = (eventKey, schedule) => {
    setEventTimeMap((prev) => ({ ...prev, [eventKey]: { ...prev[eventKey], schedule } }));
  };

  const isInbox = entityType === 'Inbox';
  const flatEvents = !isInbox && entityType ? ENTITY_EVENTS[entityType] : [];

  const inboxTabs = selectedEvents.map((eventKey) => {
    const [channel] = eventKey.split(':');
    return { label: channel, value: eventKey };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Name" />
        <Input name="name" type="text" value="Custom" readOnly />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Entity" required />
        <Select value={entityType} onValueChange={handleEntityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select entity" />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {entityType && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <FieldLabel label="Events" required />

          {isInbox ? (
            <>
              <GroupedMultiselect groups={INBOX_EVENT_GROUPS} selected={selectedEvents} onChange={handleInboxEventsChange} />
              {inboxTabs.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <Tabs value={activeInboxTab ?? ''} onValueChange={(v) => setActiveInboxTab(v)}>
                    <TabsList>
                      {inboxTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <div style={{ marginTop: 16 }}>
                    {activeInboxTab && (() => {
                      const timeData = eventTimeMap[activeInboxTab] ?? { timeCondition: '', schedule: makeDefaultSchedule() };
                      return (
                        <TimeConditionSelect
                          value={timeData.timeCondition}
                          onTimeChange={(val) => handleTimeConditionChange(activeInboxTab, val)}
                          onConfigureCustom={() => {
                            setScheduleModalEvent(activeInboxTab);
                            setDraftSchedule(timeData.schedule);
                          }}
                        />
                      );
                    })()}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {flatEvents.map((event) => (
                <label key={event} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: `1px solid ${selectedEvents.includes(event) ? '#1976d2' : '#e5e9f0'}`, borderRadius: 4, background: selectedEvents.includes(event) ? '#f5f8ff' : '#fff', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={selectedEvents.includes(event)} onChange={() => toggleEvent(event)} style={{ accentColor: '#1976d2', width: 16, height: 16, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, lineHeight: '20px', color: '#212121', fontFamily: font }}>{event}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={!!scheduleModalEvent} onOpenChange={(open) => { if (!open) setScheduleModalEvent(null); }}>
        <DialogContent style={{ maxWidth: 560, maxHeight: '80vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>Custom schedule</DialogTitle>
          </DialogHeader>
          {draftSchedule && (
            <BusinessHoursSchedule schedule={draftSchedule} onChange={setDraftSchedule} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleModalEvent(null)}>Cancel</Button>
            <Button onClick={() => { handleScheduleChange(scheduleModalEvent, draftSchedule); setScheduleModalEvent(null); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
