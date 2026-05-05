import React, { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';

const font = '"Roboto", arial, sans-serif';

function FieldLabel({ label, required }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 18 }}>
      <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>{label}</span>
      {required && <span style={{ color: '#de1b0c', fontSize: 12 }}>*</span>}
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

function BranchRow({ branch, index, onChange, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      border: '1px solid #e5e9f0', borderRadius: 4, padding: '8px 10px',
    }}>
      <i className="icon_phoenix-splitscreen_add" style={{ fontSize: 18, color: '#8f8f8f', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <Input
          name={`branch-${index}`}
          type="text"
          value={branch.name}
          onChange={(e) => onChange(index, e.target.value)}
          placeholder={`Branch ${index + 1}`}
          style={{ border: 'none', boxShadow: 'none', padding: 0, height: 'auto' }}
        />
      </div>
      <button
        onClick={() => onRemove(index)}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexShrink: 0 }}
      >
        <i className="icon_phoenix-close" style={{ fontSize: 16, color: '#8f8f8f' }} />
      </button>
    </div>
  );
}

export default function ParallelBody({ initialValues = {} }) {
  const [nodeName, setNodeName] = useState(initialValues.nodeName ?? '');
  const [description, setDescription] = useState(initialValues.description ?? '');
  const [branches, setBranches] = useState(initialValues.branches ?? [
    { name: 'Branch 1' },
    { name: 'Branch 2' },
  ]);

  function addBranch() {
    setBranches((prev) => [...prev, { name: `Branch ${prev.length + 1}` }]);
  }

  function updateBranch(index, name) {
    setBranches((prev) => prev.map((b, i) => i === index ? { ...b, name } : b));
  }

  function removeBranch(index) {
    if (branches.length <= 2) return;
    setBranches((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField label="Name" required>
        <Input name="nodeName" type="text" placeholder="Enter name" value={nodeName} onChange={(e) => setNodeName(e.target.value)} />
      </FormField>
      <FormField label="Description">
        <Textarea name="description" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>
          Parallel branches
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {branches.map((b, i) => (
            <BranchRow key={i} branch={b} index={i} onChange={updateBranch} onRemove={removeBranch} />
          ))}
        </div>
        <button
          onClick={addBranch}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', alignSelf: 'flex-start', marginTop: 4 }}
        >
          <i className="icon_phoenix-add_circle" style={{ fontSize: 20, color: '#1976d2' }} />
          <span style={{ fontSize: 12, lineHeight: '18px', letterSpacing: '-0.24px', color: '#1976d2', fontFamily: font }}>
            Add branch
          </span>
        </button>
      </div>
    </div>
  );
}
