import React, { useState, useEffect } from 'react';
import { Input } from '@/app/components/ui/input';
import Conditions from '../../../Molecules/Conditions/Conditions';
import UserPromptInput from '../../../Molecules/Inputs/UserPromptInput/UserPromptInput';

const fieldOptions = [
  { value: 'rating', label: 'Rating' },
  { value: 'sentiment', label: 'Sentiment' },
  { value: 'source', label: 'Source' },
  { value: 'location', label: 'Location' },
  { value: 'keyword', label: 'Keyword' },
];

const operatorOptions = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
];

const valueOptions = [
  { value: '1', label: '1 star' },
  { value: '2', label: '2 stars' },
  { value: '3', label: '3 stars' },
  { value: '4', label: '4 stars' },
  { value: '5', label: '5 stars' },
];

const makeCondition = (id) => ({
  id,
  fieldOptions,
  operatorOptions,
  valueOptions,
  fieldValue: '',
  operatorValue: '',
  valueValue: '',
});

const font = '"Roboto", arial, sans-serif';
const helpTextStyle = { fontSize: 11, lineHeight: '16px', color: '#8f8f8f', fontFamily: font };

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

export default function BranchBody({ initialValues = {}, onValuesChange }) {
  const basedOn = initialValues.basedOn ?? 'conditions';
  const [branchName, setBranchName] = useState(initialValues.branchName ?? 'Branch');
  const [conditions, setConditions] = useState(initialValues.conditions?.length ? initialValues.conditions : [makeCondition(1)]);
  const [logic, setLogic] = useState(initialValues.logic ?? 'OR');
  const [fieldValue, setFieldValue] = useState(initialValues.fieldValue ?? '');
  const [percentage, setPercentage] = useState(initialValues.percentage ?? 0);
  const [llmConditionTokens, setLlmConditionTokens] = useState(initialValues.llmConditionTokens ?? []);

  useEffect(() => {
    onValuesChange?.({ ...initialValues, branchName, conditions, logic, fieldValue, percentage, llmConditionTokens });
  }, [branchName, conditions, logic, fieldValue, percentage, llmConditionTokens]);

  function handleConditionChange(id, field, value) {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [`${field}Value`]: value } : c))
    );
  }

  function handleAddCondition() {
    setConditions((prev) => [...prev, makeCondition(prev.length + 1)]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormField label="Branch name" required>
        <Input
          name="branchName"
          type="text"
          placeholder="Enter name"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
        />
      </FormField>

      {basedOn === 'conditions' && (
        <Conditions
          conditions={conditions}
          logic={logic}
          onConditionChange={handleConditionChange}
          onLogicChange={setLogic}
          onAddCondition={handleAddCondition}
          onAdvancedFilters={() => {}}
        />
      )}

      {basedOn === 'llm' && (
        <UserPromptInput
          label="LLM condition"
          tokens={llmConditionTokens}
          onTokensChange={setLlmConditionTokens}
          required
        />
      )}

      {basedOn === 'field' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {initialValues.parentFieldName && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#8f8f8f', fontFamily: font }}>Field</span>
              <span style={{ fontSize: 14, color: '#212121', fontFamily: font }}>{initialValues.parentFieldName}</span>
            </div>
          )}
          <FormField label="Field value" required>
            <Input
              name="fieldValue"
              type="text"
              placeholder="Value that routes to this branch"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
            />
          </FormField>
        </div>
      )}

      {basedOn === 'percentage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, color: '#212121', fontFamily: font }}>Percentage</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Input
              name="percentage"
              type="number"
              value={String(percentage)}
              onChange={(e) => setPercentage(Number(e.target.value))}
              min="0"
              max="100"
            />
            <span style={{ fontSize: 13, color: '#555', fontFamily: font }}>%</span>
          </div>
        </div>
      )}
    </div>
  );
}
