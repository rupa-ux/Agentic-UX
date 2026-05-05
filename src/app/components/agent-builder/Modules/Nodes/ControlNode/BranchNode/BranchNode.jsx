import React from 'react';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';

const BASED_ON_DESCRIPTIONS = {
  conditions: 'Build condition-specific flows',
  field: 'Branch by field value',
  percentage: 'Split traffic by percentage',
  llm: 'Classify with LLM',
};

export default function BranchNode({
  basedOn = 'conditions',
  label = 'Branch',
  stepNumber,
  title = 'Based on conditions',
  hasToggle,
  toggleEnabled,
  onToggleChange,
  hasAddButton,
  onAddClick,
  onDelete,
  state,
}) {
  const description = BASED_ON_DESCRIPTIONS[basedOn] ?? BASED_ON_DESCRIPTIONS.conditions;

  return (
    <CanvasNode
      nodeType="branch"
      label={label}
      stepNumber={stepNumber}
      title={title}
      description={description}
      hasToggle={hasToggle}
      toggleEnabled={toggleEnabled}
      onToggleChange={onToggleChange}
      hasAddButton={hasAddButton}
      onAddClick={onAddClick}
      onDelete={onDelete}
      state={state}
    />
  );
}
