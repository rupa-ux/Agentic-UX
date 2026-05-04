import React from 'react';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';

export default function SubWorkflowNode({
  label = 'Sub Workflow',
  stepNumber,
  title = 'Run a workflow for each item',
  hasToggle,
  toggleEnabled,
  onToggleChange,
  onDelete,
  state,
}) {
  return (
    <CanvasNode
      nodeType="subWorkflow"
      label={label}
      stepNumber={stepNumber}
      title={title}
      description="Processes each item in parallel"
      hasToggle={hasToggle}
      toggleEnabled={toggleEnabled}
      onToggleChange={onToggleChange}
      onDelete={onDelete}
      state={state}
    />
  );
}
