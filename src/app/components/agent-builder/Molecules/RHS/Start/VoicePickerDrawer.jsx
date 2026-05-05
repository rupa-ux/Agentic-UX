import React, { useState, useMemo } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import './OptionPickerDrawer.css';
import './VoicePickerDrawer.css';

const VOICES = [
  { value: 'alloy',   label: 'Alloy',   gender: 'Female', accent: 'American', type: 'Provider', traits: ['American', 'Young', 'Provider'],      voiceId: 'openai-Alloy' },
  { value: 'echo',    label: 'Echo',    gender: 'Male',   accent: 'American', type: 'Provider', traits: ['American', 'Young', 'Provider'],      voiceId: 'openai-Echo' },
  { value: 'fable',   label: 'Fable',   gender: 'Male',   accent: 'British',  type: 'Provider', traits: ['British', 'Young', 'Provider'],       voiceId: 'openai-Fable' },
  { value: 'onyx',    label: 'Onyx',    gender: 'Male',   accent: 'American', type: 'Provider', traits: ['American', 'Middle Aged', 'Provider'], voiceId: 'openai-Onyx' },
  { value: 'nova',    label: 'Nova',    gender: 'Female', accent: 'American', type: 'Provider', traits: ['American', 'Young', 'Provider'],      voiceId: 'openai-Nova' },
  { value: 'shimmer', label: 'Shimmer', gender: 'Female', accent: 'American', type: 'Provider', traits: ['American', 'Young', 'Provider'],      voiceId: 'openai-Shimmer' },
  { value: 'adrian',  label: 'Adrian',  gender: 'Male',   accent: 'American', type: 'Retell',   traits: ['American', 'Young', 'Retell'],        voiceId: 'openai-Adrian' },
  { value: 'andrew',  label: 'Andrew',  gender: 'Male',   accent: 'American', type: 'Retell',   traits: ['American', 'Young', 'Retell'],        voiceId: 'openai-Andrew' },
  { value: 'anna',    label: 'Anna',    gender: 'Female', accent: 'American', type: 'Retell',   traits: ['American', 'Young', 'Retell'],        voiceId: 'openai-Anna' },
  { value: 'ash',     label: 'Ash',     gender: 'Male',   accent: 'American', type: 'Provider', traits: ['American', 'Middle Aged', 'Provider'], voiceId: 'openai-Ash' },
  { value: 'ballad',  label: 'Ballad',  gender: 'Male',   accent: 'American', type: 'Provider', traits: ['American', 'Middle Aged', 'Provider'], voiceId: 'openai-Ballad' },
  { value: 'brian',   label: 'Brian',   gender: 'Male',   accent: 'American', type: 'Retell',   traits: ['American', 'Young', 'Retell'],        voiceId: 'openai-Brian' },
  { value: 'cedar',   label: 'Cedar',   gender: 'Male',   accent: 'American', type: 'Provider', traits: ['American', 'Middle Aged', 'Provider'], voiceId: 'openai-Cedar' },
  { value: 'chloe',   label: 'Chloe',   gender: 'Female', accent: 'American', type: 'Retell',   traits: ['American', 'Young', 'Retell'],        voiceId: 'openai-Chloe' },
  { value: 'jessica', label: 'Jessica', gender: 'Female', accent: 'British',  type: 'Retell',   traits: ['British', 'Young', 'Retell'],         voiceId: 'openai-Jessica' },
  { value: 'liam',    label: 'Liam',    gender: 'Male',   accent: 'British',  type: 'Retell',   traits: ['British', 'Middle Aged', 'Retell'],   voiceId: 'openai-Liam' },
];

const GENDER_OPTIONS = [
  { value: '__all__', label: 'All genders' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

const ACCENT_OPTIONS = [
  { value: '__all__', label: 'All accents' },
  { value: 'American', label: 'American' },
  { value: 'British', label: 'British' },
  { value: 'Australian', label: 'Australian' },
];

const TYPE_OPTIONS = [
  { value: '__all__', label: 'All types' },
  { value: 'Provider', label: 'Provider' },
  { value: 'Retell', label: 'Retell' },
  { value: 'User', label: 'User' },
];

export default function VoicePickerDrawer({ selected = [], onSelectionChange, onBack }) {
  const [gender, setGender] = useState('__all__');
  const [accent, setAccent] = useState('__all__');
  const [type, setType] = useState('__all__');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => VOICES.filter((v) => {
    if (gender !== '__all__' && v.gender !== gender) return false;
    if (accent !== '__all__' && v.accent !== accent) return false;
    if (type !== '__all__' && v.type !== type) return false;
    if (search && !v.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [gender, accent, type, search]);

  const selectedSet = new Set(selected);

  function toggle(value) {
    const next = selectedSet.has(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onSelectionChange(next);
  }

  return (
    <div className="opd-overlay">
      <div className="opd-drawer" style={{ width: 700 }}>

        {/* Header */}
        <div className="opd-header">
          <div className="opd-header__left">
            <button className="opd-back-btn" onClick={onBack}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className="opd-title">Select Voice</span>
          </div>
          <Button onClick={onBack}>Done</Button>
        </div>

        {/* Filters */}
        <div className="vpd-filters">
          <div className="vpd-filter">
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="vpd-filter">
            <Select value={accent} onValueChange={setAccent}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACCENT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="vpd-filter">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="vpd-search">
            <Input
              name="voiceSearch"
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table header */}
        <div className="vpd-table-header">
          <span>Voice</span>
          <span>Trait</span>
          <span>Voice ID</span>
          <span />
        </div>

        {/* Voice list */}
        <div className="opd-body">
          {filtered.length === 0 && (
            <div className="vpd-empty">No voices match your filters</div>
          )}
          {filtered.map((voice) => {
            const isSelected = selectedSet.has(voice.value);
            return (
              <button key={voice.value} className="vpd-row" onClick={() => toggle(voice.value)}>
                <div className="vpd-voice-cell">
                  <button className="vpd-play-btn" onClick={(e) => e.stopPropagation()}>
                    <span className="material-symbols-outlined">play_arrow</span>
                  </button>
                  <div className="vpd-avatar">{voice.label.slice(0, 2).toUpperCase()}</div>
                  <span className="vpd-name">{voice.label}</span>
                </div>
                <div className="vpd-traits">
                  {voice.traits.map((t) => (
                    <span key={t} className="vpd-trait">{t}</span>
                  ))}
                </div>
                <span className="vpd-voice-id">{voice.voiceId}</span>
                <div className="vpd-check">
                  {isSelected && (
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#2e7d32' }}>check_circle</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
