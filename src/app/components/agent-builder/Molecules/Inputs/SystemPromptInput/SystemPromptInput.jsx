import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import ExpandAllIcon from '../../RHS/RHSHeader/icons/expand_all.svg';
import ExpandAllBtnIcon from '../icons/expand_all.svg';
import EditNoteIcon from '../icons/edit_note.svg';
import VariableRichInput from '../VariableRichInput/VariableRichInput';

const font = '"Roboto", arial, sans-serif';
const MAX_HEIGHT = 8 * 20 + 16;

const SystemPromptInput = forwardRef(function SystemPromptInput({ value, onChange, onFieldIconClick, required }, ref) {
  const richInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    insertVariable: (name) => richInputRef.current?.insertVariable(name),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', letterSpacing: '-0.24px', color: '#212121', fontFamily: font, whiteSpace: 'nowrap' }}>
          System prompt
        </span>
        {required && <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e5e9f0', borderRadius: 4, boxSizing: 'border-box', background: '#ffffff', width: '100%' }}>
        <VariableRichInput
          ref={richInputRef}
          value={value}
          onChange={onChange}
          placeholder="Enter prompt"
          style={{ maxHeight: MAX_HEIGHT, overflowY: 'auto' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 11px', height: 44, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={ExpandAllBtnIcon} alt="Expand all" style={{ width: 20, height: 20, cursor: 'pointer' }} onClick={onFieldIconClick} />
            <img src={EditNoteIcon} alt="Edit note" style={{ width: 20, height: 20, cursor: 'pointer' }} />
          </div>
          <img src={ExpandAllIcon} alt="Expand" style={{ width: 20, height: 20, transform: 'rotate(90deg)', cursor: 'pointer' }} />
        </div>
      </div>
    </div>
  );
});

export default SystemPromptInput;
