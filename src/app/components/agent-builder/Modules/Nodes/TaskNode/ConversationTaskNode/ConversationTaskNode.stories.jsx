import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import ResponseNodeBody from '../../../../Organisms/Panels/RHS/ResponseNodeBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';

export default {
  title: 'Conversation Builder/Modules/Nodes/Task/ResponseTask',
  parameters: { layout: 'centered' },
};

export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      <CardRow label="Response" icon="forum" action="chevron" />
    </div>
  ),
};

export const CanvasPreview = {
  render: () => (
    <CanvasNode
      nodeType="task"
      label="Task"
      hasToggle
      toggleEnabled
      stepNumber={1}
      title="Response"
      description="Handle inbound support chat"
    />
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Response"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <ResponseNodeBody
            initialValues={{
              taskName: 'Response',
              description: 'Handle inbound support chat',
              llmModel: 'Standard',
              context: 'Customer is reaching out via chat from the website.',
              conversationalGoal: 'Understand the issue and either resolve it or route to a human agent.',
              systemPrompt: 'You are a helpful support agent. Be concise and empathetic.',
            }}
          />
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
      <RHS
        variant="responseNode"
        title="Response"
        onClose={() => {}} onSave={() => {}} onPreview={() => {}} onExpand={() => {}}
        bodyProps={{
          initialValues: {
            taskName: 'Response',
            description: 'Handle inbound support chat',
            llmModel: 'Standard',
            context: 'Customer is reaching out via chat from the website.',
            conversationalGoal: 'Understand the issue and either resolve it or route to a human agent.',
            systemPrompt: 'You are a helpful support agent. Be concise and empathetic.',
          },
        }}
      />
    </div>
  ),
};
