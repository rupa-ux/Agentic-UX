import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import DataType from '../../../Molecules/DataType/DataType';
import VariableSelectionModal from '../VariableSelectionModal/VariableSelectionModal';

const font = '"Roboto", arial, sans-serif';

export default function AddInputFieldModal({ onClose, onAdd }) {
  const [fieldName, setFieldName] = useState('');
  const [fieldValueChips, setFieldValueChips] = useState([]);
  const [variablePickerOpen, setVariablePickerOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const fieldValueRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (fieldValueRef.current && !fieldValueRef.current.contains(e.target)) {
        setVariablePickerOpen(false);
      }
    }
    if (variablePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [variablePickerOpen]);

  function openVariablePicker() {
    if (fieldValueRef.current) {
      const rect = fieldValueRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        right: 'auto',
        marginTop: 0,
        zIndex: 9999,
      });
    }
    setVariablePickerOpen(true);
  }

  function removeChip(index) {
    setFieldValueChips((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAdd() {
    if (!fieldName || fieldValueChips.length === 0) return;
    onAdd({ fieldName, fieldValue: fieldValueChips });
    onClose();
  }

  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent style={{ maxWidth: 600, padding: 0 }}>
          <DialogHeader style={{ padding: '24px 24px 12px' }}>
            <DialogTitle style={{ fontSize: 16, fontWeight: 400, lineHeight: '24px', letterSpacing: '-0.32px', fontFamily: font }}>
              Add input field
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '0 24px' }}>
            {/* Field name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>Field name</span>
                <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>
              </div>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Enter field name"
                style={{
                  width: '100%', height: 36, border: '1px solid #e0e0e0', borderRadius: 4,
                  padding: '0 12px', fontSize: 14, lineHeight: '20px', letterSpacing: '-0.28px',
                  color: '#212121', fontFamily: font, outline: 'none', boxSizing: 'border-box', background: '#fff',
                }}
              />
            </div>

            {/* Field value */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 400, lineHeight: '18px', color: '#212121', fontFamily: font }}>Field value</span>
                <span style={{ fontSize: 12, lineHeight: '18px', color: '#de1b0c', fontFamily: font }}>*</span>
              </div>
              <div ref={fieldValueRef} style={{ display: 'flex' }}>
                <div
                  onClick={openVariablePicker}
                  style={{
                    flex: 1, minHeight: 36, border: '1px solid #e0e0e0', borderRadius: '4px 0 0 4px',
                    padding: '4px 8px', display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                    gap: 6, boxSizing: 'border-box', background: '#fff', cursor: 'pointer',
                  }}
                >
                  {fieldValueChips.length === 0 && (
                    <span style={{ fontSize: 14, lineHeight: '20px', color: '#8f8f8f', fontFamily: font, userSelect: 'none' }}>
                      Select field value
                    </span>
                  )}
                  {fieldValueChips.map((chip, i) => (
                    <DataType
                      key={`${chip}-${i}`}
                      type="variable"
                      label={chip}
                      onRemove={(e) => { e.stopPropagation(); removeChip(i); }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={openVariablePicker}
                  style={{
                    width: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#ecf5fd', borderRadius: '0 4px 4px 0',
                    border: '1px solid #d1e5f9', borderLeft: 'none',
                    cursor: 'pointer', padding: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20", fontSize: 16, width: 16, height: 16, lineHeight: 1, color: '#1a73e8', overflow: 'hidden' }}>
                    data_object
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '12px 24px 24px' }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!fieldName || fieldValueChips.length === 0}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      <VariableSelectionModal
        dropdown
        isOpen={variablePickerOpen}
        onClose={() => setVariablePickerOpen(false)}
        onVariableSelect={(variable) => {
          setFieldValueChips((prev) => [...prev, variable]);
          setVariablePickerOpen(false);
        }}
        dropdownStyle={dropdownStyle}
      />
    </>
  );
}
