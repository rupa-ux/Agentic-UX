import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import TransferNodeBody from '../../../../Organisms/Panels/RHS/TransferNodeBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';

export default {
  title: 'Conversation Builder/Modules/Nodes/Task/TransferTask',
  parameters: { layout: 'centered' },
};

export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      <CardRow label="Transfer" icon="swap_horiz" action="drag" />
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
      stepNumber={2}
      title="Transfer"
      description="Route to human agent"
    />
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Transfer"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <TransferNodeBody initialValues={{
            transferTo: 'agent',
            selectedAgent: 'agent-1',
            delayBeforeTransfer: '30',
            transferMessage: 'Please hold while I connect you with a specialist.',
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
        variant="transferNode"
        title="Transfer"
        onClose={() => {}} onSave={() => {}} onPreview={() => {}} onExpand={() => {}}
        bodyProps={{ initialValues: {
          transferTo: 'agent',
          selectedAgent: 'agent-1',
          delayBeforeTransfer: '30',
          transferMessage: 'Please hold while I connect you with a specialist.',
        } }}
      />
    </div>
  ),
};
