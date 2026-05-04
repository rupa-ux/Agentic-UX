import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import EndNodeBody from '../../../../Organisms/Panels/RHS/EndNodeBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';

export default {
  title: 'Conversation Builder/Modules/Nodes/Task/EndTask',
  parameters: { layout: 'centered' },
};

export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      <CardRow label="End" icon="stop_circle" action="drag" />
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
      stepNumber={3}
      title="End"
      description="Close conversation as resolved"
    />
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="End"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <EndNodeBody initialValues={{
            closingMessage: 'Thank you for reaching out! Is there anything else I can help you with?',
            collectFeedback: true,
            feedbackType: 'CSAT',
            endState: 'resolved',
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
      <RHS
        variant="endNode"
        title="End"
        onClose={() => {}} onSave={() => {}} onPreview={() => {}} onExpand={() => {}}
        bodyProps={{ initialValues: {
          closingMessage: 'Thank you for reaching out! Is there anything else I can help you with?',
          collectFeedback: true,
          feedbackType: 'CSAT',
          endState: 'resolved',
        } }}
      />
    </div>
  ),
};
