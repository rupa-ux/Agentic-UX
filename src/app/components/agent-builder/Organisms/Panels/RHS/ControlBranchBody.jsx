import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';

const font = '"Roboto", arial, sans-serif';

const BASED_ON_OPTIONS = [
  { value: 'conditions', label: 'Conditions' },
  { value: 'llm', label: 'LLM' },
  { value: 'field', label: 'Field' },
  { value: 'percentage', label: 'Percentage' },
];

function SectionLabel({ label, required }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>
        {label}
      </span>
      {required && <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>}
    </div>
  );
}

function BranchItem({ index, name, onRename, onDelete }) {
  const [draft, setDraft] = useState(name);
  const inputRef = useRef(null);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) onRename(index, trimmed);
    else setDraft(name);
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '6px 12px', border: '1px solid #e5e9f0', borderRadius: 4,
      background: '#fff', gap: 6,
    }}>
      <span style={{ fontSize: 14, lineHeight: '20px', color: '#8f8f8f', fontFamily: font, flexShrink: 0 }}>
        {index + 1}.
      </span>
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') { setDraft(name); e.currentTarget.blur(); }
        }}
        style={{
          flex: 1, border: 'none', outline: 'none',
          fontSize: 14, lineHeight: '20px', color: '#212121',
          fontFamily: font, letterSpacing: '-0.28px',
          background: 'transparent', padding: 0, minWidth: 0,
        }}
      />
      <button
        onClick={() => onDelete(index)}
        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 2, cursor: 'pointer', flexShrink: 0, borderRadius: 2 }}
        title="Delete branch"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#bdbdbd' }}>delete</span>
      </button>
      <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#c8d0dc', flexShrink: 0, cursor: 'grab' }}>
        drag_indicator
      </span>
    </div>
  );
}

function PercentageBranchItem({ index, name, percentage, onRename, onDelete, onChange }) {
  const [draft, setDraft] = useState(name);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) onRename(index, trimmed);
    else setDraft(name);
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '6px 12px', border: '1px solid #e5e9f0', borderRadius: 4,
      background: '#fff', gap: 6,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#c8d0dc', flexShrink: 0, cursor: 'grab' }}>
        drag_indicator
      </span>
      <span style={{ fontSize: 14, lineHeight: '20px', color: '#8f8f8f', fontFamily: font, flexShrink: 0 }}>
        {index + 1}.
      </span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') { setDraft(name); e.currentTarget.blur(); }
        }}
        style={{
          flex: 1, border: 'none', outline: 'none',
          fontSize: 14, lineHeight: '20px', color: '#212121',
          fontFamily: font, letterSpacing: '-0.28px',
          background: 'transparent', padding: 0, minWidth: 0,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, width: 80 }}>
        <Input
          name={`branch-pct-${index}`}
          type="number"
          value={String(percentage)}
          onChange={(e) => onChange(index, Number(e.target.value))}
          min="0"
          max="100"
        />
        <span style={{ fontSize: 13, color: '#555', fontFamily: font }}>%</span>
      </div>
      <button
        onClick={() => onDelete(index)}
        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', padding: 2, cursor: 'pointer', flexShrink: 0, borderRadius: 2 }}
        title="Delete branch"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#bdbdbd' }}>delete</span>
      </button>
    </div>
  );
}

export default function ControlBranchBody({ initialValues = {}, onValuesChange }) {
  const [basedOn, setBasedOn] = useState(initialValues.basedOn ?? 'conditions');
  const [fieldName, setFieldName] = useState(initialValues.fieldName ?? '');
  const [branches, setBranches] = useState(() => {
    const initial = initialValues.branches ?? [];
    return initial.map((b) => ({ ...b, percentage: b.percentage ?? 0 }));
  });
  const [nextId, setNextId] = useState((initialValues.branches?.length ?? 0) + 1);

  function addBranch() {
    setBranches((prev) => [...prev, { id: nextId, name: `Branch ${nextId}`, percentage: 0 }]);
    setNextId((n) => n + 1);
  }

  function renameBranch(index, newName) {
    setBranches((prev) => prev.map((b, i) => i === index ? { ...b, name: newName } : b));
  }

  function deleteBranch(index) {
    setBranches((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePercentage(index, value) {
    setBranches((prev) => prev.map((b, i) => i === index ? { ...b, percentage: value } : b));
  }

  const totalPercentage = branches.reduce((sum, b) => sum + (b.percentage || 0), 0);

  useEffect(() => {
    const label = BASED_ON_OPTIONS.find((o) => o.value === basedOn)?.label ?? basedOn;
    onValuesChange?.({ basedOn, branches, fieldName, name: label });
  }, [basedOn, branches, fieldName]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionLabel label="Based on" required />
        <Select value={basedOn} onValueChange={(v) => setBasedOn(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {BASED_ON_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {basedOn === 'field' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SectionLabel label="Field" required />
          <Input
            name="fieldName"
            type="text"
            placeholder="Field name"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
          <span style={{ fontSize: 11, lineHeight: '16px', color: '#8f8f8f', fontFamily: font }}>
            Select the field whose value determines the branch
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionLabel label="Branches" />
          {basedOn === 'percentage' && (
            <span style={{
              fontSize: 11, fontFamily: font,
              color: totalPercentage === 100 ? '#2e7d32' : '#de1b0c',
            }}>
              Total: {totalPercentage}%
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {branches.map((b, i) =>
            basedOn === 'percentage' ? (
              <PercentageBranchItem key={b.id} index={i} name={b.name} percentage={b.percentage} onRename={renameBranch} onDelete={deleteBranch} onChange={updatePercentage} />
            ) : (
              <BranchItem key={b.id} index={i} name={b.name} onRename={renameBranch} onDelete={deleteBranch} />
            )
          )}
        </div>
        <button
          onClick={addBranch}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', alignSelf: 'flex-start' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#1976d2' }}>add_circle</span>
          <span style={{ fontSize: 14, lineHeight: '20px', color: '#1976d2', fontFamily: font }}>Add</span>
        </button>
      </div>
    </div>
  );
}
