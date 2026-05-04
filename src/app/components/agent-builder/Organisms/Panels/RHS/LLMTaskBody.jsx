import React, { useState, useRef } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import SystemPromptInput from '../../../Molecules/Inputs/SystemPromptInput/SystemPromptInput';
import ContextFieldModal from '../../Modals/ContextFieldModal/ContextFieldModal';
import FieldPickerModal from '../../Modals/FieldPickerModal/FieldPickerModal';
import VariableRichInput from '../../../Molecules/Inputs/VariableRichInput/VariableRichInput';
import ExpandAllBtnIcon from '../../../Molecules/Inputs/icons/expand_all.svg';
import BuildIcon from '../../../Molecules/Inputs/icons/build.svg';
import EditNoteIcon from '../../../Molecules/Inputs/icons/edit_note.svg';
import AiWandIcon from './icons/ai_text_grammar_wand.svg';

const font = '"Roboto", arial, sans-serif';

function fieldsToText(fields) {
  if (!fields) return '';
  if (typeof fields === 'string') return fields;
  if (Array.isArray(fields)) return fields.map(f => `{{${f.fieldName}}}`).join(' ');
  return '';
}

const LLM_MODEL_OPTIONS = [
  { value: 'Fast', label: 'Fast' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Advanced', label: 'Advanced' },
];

function FieldLabel({ label, required, showInfo }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font, whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {required && <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>}
      {showInfo && <i className="icon_phoenix-info" style={{ fontSize: 16, color: '#8f8f8f', cursor: 'pointer' }} />}
    </div>
  );
}

function RichInputBox({ value, onChange, inputRef, placeholder, children }) {
  return (
    <div style={{ border: '1px solid #e5e9f0', borderRadius: 4, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <VariableRichInput
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? ''}
        style={{ minHeight: 36, maxHeight: 120, overflowY: 'auto' }}
      />
      {children && (
        <div style={{ padding: '0 10px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function AddBtn({ onClick, label }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
      <i className="icon_phoenix-add_circle" style={{ fontSize: 20, color: '#1976d2' }} />
      <span style={{ fontSize: 12, lineHeight: '18px', letterSpacing: '-0.24px', color: '#1976d2', fontFamily: font }}>{label ?? 'Add'}</span>
    </button>
  );
}

function Spinner() {
  return (
    <>
      <style>{`@keyframes llm-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        border: '2px solid #e5e9f0', borderTopColor: '#6d36bf',
        animation: 'llm-spin 0.8s linear infinite', flexShrink: 0,
      }} />
    </>
  );
}

export default function LLMTaskBody({ initialValues = {}, onChange }) {
  const [values, setValues] = useState({
    taskName: initialValues.taskName ?? '',
    description: initialValues.description ?? '',
    llmModel: initialValues.llmModel ?? 'Fast',
    systemPrompt: initialValues.systemPrompt ?? '',
    userPrompt: initialValues.userPrompt ?? '',
    context: initialValues.context ?? '',
    inputFields: initialValues.inputFields ?? '',
    outputFields: fieldsToText(initialValues.outputFields),
  });
  const [showContextModal, setShowContextModal] = useState(false);
  const [fieldPickerTarget, setFieldPickerTarget] = useState(null);
  const [generateOutputState, setGenerateOutputState] = useState('idle');

  const systemPromptRef = useRef(null);
  const userPromptRef = useRef(null);
  const contextRef = useRef(null);
  const inputFieldsRef = useRef(null);
  const outputFieldsRef = useRef(null);

  const set = (field) => (val) => {
    setValues((v) => ({ ...v, [field]: val }));
    onChange?.(field, val);
  };
  const setFromEvent = (field) => (e) => set(field)(e.target.value);

  function handleVariableSelect(name) {
    const refMap = {
      systemPrompt: systemPromptRef,
      userPrompt: userPromptRef,
    };
    refMap[fieldPickerTarget]?.current?.insertVariable(name);
    setFieldPickerTarget(null);
  }

  function handleContextSave({ knowledge }) {
    knowledge?.files?.forEach(f => contextRef.current?.insertVariable(f.name, 'file'));
    knowledge?.links?.forEach(l => contextRef.current?.insertVariable(l.url, 'link'));
    setShowContextModal(false);
  }

  function handleGenerateOutput() {
    setGenerateOutputState('generating');
    setTimeout(() => {
      setGenerateOutputState('idle');
      ['sentiment_score', 'key_themes', 'staff_rating'].forEach(name => {
        outputFieldsRef.current?.insertVariable(name);
      });
    }, 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Task name" />
        <Input name="taskName" type="text" value={values.taskName || 'Custom'} disabled />
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
        <RichInputBox inputRef={contextRef} value={values.context} onChange={setFromEvent('context')}>
          <AddBtn onClick={() => setShowContextModal(true)} />
        </RichInputBox>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Input fields" showInfo />
        <RichInputBox inputRef={inputFieldsRef} value={values.inputFields} onChange={setFromEvent('inputFields')} />
      </div>

      <SystemPromptInput
        ref={systemPromptRef}
        value={values.systemPrompt}
        onChange={setFromEvent('systemPrompt')}
        required
        onFieldIconClick={() => setFieldPickerTarget('systemPrompt')}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="User prompt" required />
        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e5e9f0', borderRadius: 4, boxSizing: 'border-box', background: '#fff', width: '100%' }}>
          <VariableRichInput
            ref={userPromptRef}
            value={values.userPrompt}
            onChange={setFromEvent('userPrompt')}
            placeholder="Enter prompt"
            style={{ maxHeight: 8 * 20 + 16, overflowY: 'auto' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 11px', height: 44, flexShrink: 0, gap: 10 }}>
            <img src={ExpandAllBtnIcon} alt="Variables" style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={() => setFieldPickerTarget('userPrompt')} />
            <img src={BuildIcon} alt="Tools" style={{ width: 20, height: 20, cursor: 'pointer' }} />
            <img src={EditNoteIcon} alt="AI prompts" style={{ width: 20, height: 20, cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <FieldLabel label="Output fields" showInfo />
        <RichInputBox inputRef={outputFieldsRef} value={values.outputFields} onChange={setFromEvent('outputFields')}>
          {generateOutputState === 'idle' ? (
            <>
              <div style={{ width: 1, height: 16, background: '#e5e9f0', flexShrink: 0 }} />
              <button onClick={handleGenerateOutput} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                <img src={AiWandIcon} alt="Generate" style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 12, lineHeight: '18px', letterSpacing: '-0.24px', color: '#8f8f8f', fontFamily: font }}>Generate from prompt</span>
              </button>
            </>
          ) : (
            <>
              <Spinner />
              <span style={{ fontSize: 11, color: '#212121', opacity: 0.3, fontFamily: font }}>Generating…</span>
            </>
          )}
        </RichInputBox>
      </div>

      {showContextModal && (
        <ContextFieldModal
          isOpen={showContextModal}
          onClose={() => setShowContextModal(false)}
          onSave={handleContextSave}
        />
      )}

      {fieldPickerTarget && (
        <FieldPickerModal
          onClose={() => setFieldPickerTarget(null)}
          onSelectField={handleVariableSelect}
        />
      )}
    </div>
  );
}
