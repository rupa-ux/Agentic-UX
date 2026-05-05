import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import SystemPromptInput from '../../../Molecules/Inputs/SystemPromptInput/SystemPromptInput';
import ContextFieldModal from '../../Modals/ContextFieldModal/ContextFieldModal';
import FieldPickerModal from '../../Modals/FieldPickerModal/FieldPickerModal';
import ExpandAllBtnIcon from '../../../Molecules/Inputs/icons/expand_all.svg';
import BuildIcon from '../../../Molecules/Inputs/icons/build.svg';
import EditNoteIcon from '../../../Molecules/Inputs/icons/edit_note.svg';

const font = '"Roboto", arial, sans-serif';

export const LLM_MODEL_OPTIONS = [
  { value: 'Fast', label: 'Fast' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Advanced', label: 'Advanced' },
];

export const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'nova', label: 'Nova' },
  { value: 'shimmer', label: 'Shimmer' },
];

export const EAGERNESS_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const SPECULATIVE_PATIENCE_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const THINK_MODE_OPTIONS = [
  { value: 'off', label: 'Off' },
  { value: 'standard', label: 'Standard' },
  { value: 'deep', label: 'Deep' },
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

export function SectionDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 500, lineHeight: '16px', color: '#8f8f8f', fontFamily: font, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: '#e5e9f0' }} />
    </div>
  );
}

function ConversationalGoalInput({ value, onChange, onFieldIconClick, onToolClick, onAIPromptClick }) {
  const textareaRef = useRef(null);
  const LINE_HEIGHT = 20;
  const MAX_TEXTAREA_HEIGHT = 8 * LINE_HEIGHT + 16;

  const resize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const capped = Math.min(ta.scrollHeight, MAX_TEXTAREA_HEIGHT);
    ta.style.height = capped + 'px';
    ta.style.overflowY = ta.scrollHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
  }, [MAX_TEXTAREA_HEIGHT]);

  useEffect(() => { resize(); }, [value, resize]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label="Conversational goal" required />
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e5e9f0', borderRadius: 4, boxSizing: 'border-box', background: '#fff', width: '100%' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          placeholder="Describe the goal of this conversation..."
          rows={1}
          style={{
            width: '100%', border: 'none', outline: 'none', resize: 'none',
            padding: '8px 12px', fontSize: 14, fontWeight: 400, lineHeight: `${LINE_HEIGHT}px`,
            letterSpacing: '-0.28px', color: '#212121', fontFamily: font,
            boxSizing: 'border-box', background: 'transparent', overflowY: 'hidden',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 11px', height: 44, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={ExpandAllBtnIcon} alt="Variables" style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={onFieldIconClick} />
            <img src={BuildIcon} alt="Tools" style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={onToolClick} />
            <img src={EditNoteIcon} alt="AI prompts" style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={onAIPromptClick} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AddBox({ onAdd, children }) {
  return (
    <div style={{ border: '1px solid #e5e9f0', borderRadius: 4, padding: '16px 10px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        <i className="icon_phoenix-add_circle" style={{ fontSize: 20, color: '#1976d2' }} />
        <span style={{ fontSize: 12, lineHeight: '18px', letterSpacing: '-0.24px', color: '#1976d2', fontFamily: font }}>Add</span>
      </button>
      {children}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, lineHeight: '20px', color: '#212121', fontFamily: font }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, cursor: 'pointer', flexShrink: 0,
          background: checked ? '#1976d2' : '#ccc', position: 'relative', transition: 'background 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}

export default function ConversationNodeBody({ initialValues = {} }) {
  const [values, setValues] = useState({
    taskName:           initialValues.taskName           ?? 'Conversation',
    description:        initialValues.description        ?? '',
    llmModel:           initialValues.llmModel           ?? 'Fast',
    conversationalGoal: initialValues.conversationalGoal ?? '',
    systemPrompt:       initialValues.systemPrompt       ?? '',
  });
  const [showContextModal, setShowContextModal] = useState(false);
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  const set = (field) => (val) => setValues((v) => ({ ...v, [field]: val }));
  const setFromEvent = (field) => (e) => set(field)(e.target.value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Name" required />
        <Input name="taskName" type="text" placeholder="Enter name" value={values.taskName} onChange={setFromEvent('taskName')} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Description" />
        <Textarea name="description" placeholder="Enter description" value={values.description} onChange={setFromEvent('description')} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="LLM Model" showInfo />
        <Select value={values.llmModel} onValueChange={(v) => set('llmModel')(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {LLM_MODEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Context" showInfo />
        <AddBox onAdd={() => setShowContextModal(true)} />
      </div>

      <ConversationalGoalInput
        value={values.conversationalGoal}
        onChange={setFromEvent('conversationalGoal')}
        onFieldIconClick={() => setShowFieldPicker(true)}
        onToolClick={() => {}}
        onAIPromptClick={() => {}}
      />

      <SystemPromptInput
        value={values.systemPrompt}
        onChange={setFromEvent('systemPrompt')}
      />

      {showContextModal && (
        <ContextFieldModal
          isOpen={showContextModal}
          onClose={() => setShowContextModal(false)}
        />
      )}

      {showFieldPicker && (
        <FieldPickerModal
          onClose={() => setShowFieldPicker(false)}
          onSelectField={(field) => {
            set('conversationalGoal')(values.conversationalGoal + `{{${field}}}`);
            setShowFieldPicker(false);
          }}
        />
      )}
    </div>
  );
}
