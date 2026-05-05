import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import LLMTaskBody from '../../../../Organisms/Panels/RHS/LLMTaskBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';


export default {
  title: 'Agent Builder/Modules/Nodes/Task/CustomTask',
  parameters: { layout: 'centered' },
};

export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      <CardRow label="Custom" icon="dashboard_customize" action="drag" />
    </div>
  ),
};

export const CanvasPreview = {
  render: () => (
    <CanvasNode
      nodeType="task"
      label="Task"
      hasAiIcon
      hasToggle
      toggleEnabled
      stepNumber={2}
      title="Identify relevant mentions in the review"
      description="LLM: Extract product or service-specific feedback from the review"
    />
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Task"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        showPromptStrength promptStrength="Weak" promptFillWidth={83}
        formContent={
          <LLMTaskBody initialValues={{
            taskName: 'Identify relevant mentions in the review',
            description: 'Extract product or service–specific feedback from the review',
            llmModel: 'Fast',
            systemPrompt: 'You are a classification agent who identifies the products and services mentioned in the review comment',
            userPrompt: 'Identify service or product mentioned in the review. If multiple are identified, prioritize by relevance and select only one.',
            outputFields: [{ fieldName: 'Identified_product', fieldType: 'Text' }],
          }} />
        }
        testContent={<ExpandedRHSTest />}
      />
    </div>
  ),
};

export const RHSPreview = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: 390, height: '100vh' }}>
      <RHS variant="llmTask" title="Custom task" onClose={() => {}} onSave={() => {}} onPreview={() => {}} onExpand={() => {}}
        bodyProps={{ initialValues: {
          taskName: 'Identify relevant mentions in the review',
          description: 'Extract product or service-specific feedback from the review',
          llmModel: 'Fast',
          systemPrompt: 'You are a classification agent who identifies the products and services mentioned in the review comment',
          userPrompt: 'Identify service or product mentioned in the review. If multiple are identified, prioritize by relevance and select only one.',
          outputFields: [{ fieldName: 'Identified_product', fieldType: 'Text' }],
        } }}
      />
    </div>
  ),
};
