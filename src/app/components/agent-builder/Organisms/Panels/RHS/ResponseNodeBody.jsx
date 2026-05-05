import React, { useRef, useEffect, useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import SystemPromptInput from '../../../Molecules/Inputs/SystemPromptInput/SystemPromptInput';
import ContextFieldModal from '../../Modals/ContextFieldModal/ContextFieldModal';
import FieldPickerModal from '../../Modals/FieldPickerModal/FieldPickerModal';
import AdvancedConfigDrawer from '../../../Molecules/RHS/Start/AdvancedConfigDrawer';
import ExpandAllBtnIcon from '../../../Molecules/Inputs/icons/expand_all.svg';
import BuildIcon from '../../../Molecules/Inputs/icons/build.svg';
import EditNoteIcon from '../../../Molecules/Inputs/icons/edit_note.svg';
import VariableRichInput from '../../../Molecules/Inputs/VariableRichInput/VariableRichInput';
import AiWandIcon from './icons/ai_text_grammar_wand.svg';

const font = '"Roboto", arial, sans-serif';

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

const EMOJIS = [
  '😊','😂','😍','🥰','😎','🤔','👍','👏','🙏','❤️',
  '🔥','✨','🎉','🚀','💡','📌','✅','⚠️','💬','📝',
  '😅','😢','😤','🤝','💪','🌟','🎯','📊','🔍','💼',
];

function EmojiPicker({ onSelect }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <span
        className="material-symbols-outlined"
        onClick={() => setOpen((v) => !v)}
        style={{ fontSize: 16, width: 16, height: 16, cursor: 'pointer', color: '#616161', userSelect: 'none', display: 'flex', alignItems: 'center' }}
        title="Emoji"
      >
        sentiment_satisfied
      </span>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: '#fff', border: '1px solid #e5e9f0', borderRadius: 6,
          boxShadow: '0px 4px 12px rgba(33,33,33,0.18)',
          padding: 8, display: 'grid', gridTemplateColumns: 'repeat(10, 24px)', gap: 2,
          width: 272,
        }}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => { onSelect(emoji); setOpen(false); }}
              style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, borderRadius: 4, padding: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ConversationalGoalInput({ value, onChange, onFieldIconClick, onToolClick, onAIPromptClick, inputRef }) {
  const internalRef = useRef(null);
  const richRef = inputRef ?? internalRef;

  const insertEmoji = (emoji) => {
    richRef.current?.insertText(emoji) ?? onChange({ target: { value: (value || '') + emoji } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <FieldLabel label="User prompt" required />
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e5e9f0', borderRadius: 4, boxSizing: 'border-box', background: '#fff', width: '100%' }}>
        <VariableRichInput
          ref={richRef}
          value={value}
          onChange={onChange}
          placeholder="Enter prompt"
          style={{ maxHeight: 8 * 20 + 16, overflowY: 'auto' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 11px', height: 44, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={ExpandAllBtnIcon} alt="Variables" style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={onFieldIconClick} />
            <img src={BuildIcon} alt="Tools" style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={onToolClick} />
            <img src={EditNoteIcon} alt="AI prompts" style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={onAIPromptClick} />
            <EmojiPicker onSelect={insertEmoji} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContextInput({ value, onChange, onAdd, inputRef }) {
  return (
    <div style={{ border: '1px solid #e5e9f0', borderRadius: 4, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <VariableRichInput
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder=""
        style={{ minHeight: 36, maxHeight: 120, overflowY: 'auto' }}
      />
      <div style={{ padding: '0 10px 8px' }}>
        <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          <i className="icon_phoenix-add_circle" style={{ fontSize: 20, color: '#1976d2' }} />
          <span style={{ fontSize: 12, lineHeight: '18px', letterSpacing: '-0.24px', color: '#1976d2', fontFamily: font }}>Add</span>
        </button>
      </div>
    </div>
  );
}

export default function ConversationNodeBody({ initialValues = {}, onValuesChange }) {
  const [values, setValues] = useState({
    taskName: 'Response',
    description: initialValues.description ?? '',
    conversationalGoal: initialValues.conversationalGoal ?? '',
    systemPrompt: initialValues.systemPrompt ?? '',
    context: initialValues.context ?? '',
    inputFields: initialValues.inputFields ?? '',
    outputFields: initialValues.outputFields ?? '',
    replyButtons: initialValues.replyButtons ?? [],
    resolutionButtonText: initialValues.resolutionButtonText ?? '',
    escalationButtonText: initialValues.escalationButtonText ?? '',
    aiAgentName: initialValues.aiAgentName ?? '',
    fallbackMessages: initialValues.fallbackMessages ?? [],
    fallbackDuringHours: initialValues.fallbackDuringHours ?? '',
    fallbackAfterHours: initialValues.fallbackAfterHours ?? '',
    unsubscribeTextEnabled: initialValues.unsubscribeTextEnabled ?? false,
    voice: initialValues.voice ?? 'alloy',
    language: initialValues.language ?? 'English',
    llmModelVoice: initialValues.llmModelVoice ?? 'Fast',
    eagerness: initialValues.eagerness ?? 'medium',
    spelling: initialValues.spelling ?? false,
    speculativePatience: initialValues.speculativePatience ?? 'medium',
    maxCallDuration: initialValues.maxCallDuration ?? '',
    recordCall: initialValues.recordCall ?? false,
    piiDetection: initialValues.piiDetection ?? false,
    recordingConsent: initialValues.recordingConsent ?? false,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [fieldPickerTarget, setFieldPickerTarget] = useState(null);
  const [generateOutputState, setGenerateOutputState] = useState('idle');
  const systemPromptRef = useRef(null);
  const userPromptRef = useRef(null);
  const contextRef = useRef(null);
  const inputFieldsRef = useRef(null);
  const outputFieldsRef = useRef(null);

  const set = (field) => (val) => setValues((v) => ({ ...v, [field]: val }));
  const setFromEvent = (field) => (e) => set(field)(e.target.value);
  const handleAdvancedChange = (field, val) => setValues((v) => ({ ...v, [field]: val }));

  function handleVariableSelect(name) {
    const refMap = { systemPrompt: systemPromptRef, conversationalGoal: userPromptRef };
    refMap[fieldPickerTarget]?.current?.insertVariable(name);
    setFieldPickerTarget(null);
  }

  useEffect(() => {
    onValuesChange?.({ ...values, name: values.taskName });
  }, [values]);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Name" />
          <Input name="taskName" type="text" placeholder="Enter name" value={values.taskName} readOnly />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Description" />
          <Textarea name="description" placeholder="Enter description" value={values.description} onChange={setFromEvent('description')} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Context" showInfo />
          <ContextInput
            inputRef={contextRef}
            value={values.context}
            onChange={setFromEvent('context')}
            onAdd={() => setShowContextModal(true)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Input fields" showInfo />
          <div style={{ border: '1px solid #e5e9f0', borderRadius: 4, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <VariableRichInput
              ref={inputFieldsRef}
              value={values.inputFields}
              onChange={setFromEvent('inputFields')}
              placeholder=""
              style={{ minHeight: 36, maxHeight: 120, overflowY: 'auto' }}
            />
          </div>
        </div>

        <SystemPromptInput
          ref={systemPromptRef}
          value={values.systemPrompt}
          onChange={setFromEvent('systemPrompt')}
          onFieldIconClick={() => setFieldPickerTarget('systemPrompt')}
        />

        <ConversationalGoalInput
          value={values.conversationalGoal}
          onChange={setFromEvent('conversationalGoal')}
          inputRef={userPromptRef}
          onFieldIconClick={() => setFieldPickerTarget('conversationalGoal')}
          onToolClick={() => {}}
          onAIPromptClick={() => {}}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <FieldLabel label="Output fields" showInfo />
          <div style={{ border: '1px solid #e5e9f0', borderRadius: 4, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <VariableRichInput
              ref={outputFieldsRef}
              value={values.outputFields}
              onChange={setFromEvent('outputFields')}
              placeholder=""
              style={{ minHeight: 36, maxHeight: 120, overflowY: 'auto' }}
            />
            <div style={{ padding: '0 10px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {generateOutputState === 'idle' ? (
                <button onClick={() => {
                  setGenerateOutputState('generating');
                  setTimeout(() => {
                    setGenerateOutputState('idle');
                    ['sentiment_score', 'key_themes', 'staff_rating'].forEach(name => {
                      outputFieldsRef.current?.insertVariable(name);
                    });
                  }, 2000);
                }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  <img src={AiWandIcon} alt="Generate" style={{ width: 20, height: 20 }} />
                  <span style={{ fontSize: 12, lineHeight: '18px', letterSpacing: '-0.24px', color: '#8f8f8f', fontFamily: font }}>Generate from prompt</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #e5e9f0', borderTopColor: '#6d36bf', animation: 'resp-spin 0.8s linear infinite', flexShrink: 0 }} />
                  <style>{`@keyframes resp-spin{to{transform:rotate(360deg)}}`}</style>
                  <span style={{ fontSize: 11, color: '#212121', opacity: 0.3, fontFamily: font }}>Generating…</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <AdvancedConfigDrawer
          values={values}
          onChange={handleAdvancedChange}
          onBack={() => setShowAdvanced(false)}
        />
      )}

      {showContextModal && (
        <ContextFieldModal
          isOpen={showContextModal}
          onClose={() => setShowContextModal(false)}
          onSave={({ knowledge }) => {
            knowledge?.files?.forEach(f => contextRef.current?.insertVariable(f.name, 'file'));
            knowledge?.links?.forEach(l => contextRef.current?.insertVariable(l.url, 'link'));
          }}
        />
      )}

      {fieldPickerTarget && (
        <FieldPickerModal
          onClose={() => setFieldPickerTarget(null)}
          onSelectField={handleVariableSelect}
        />
      )}
    </>
  );
}
