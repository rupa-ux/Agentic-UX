import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import CustomTriggerBody from '../../../../Organisms/Panels/RHS/CustomTriggerBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';

export default {
  title: 'Agent Builder/Modules/Nodes/Trigger/CustomTrigger',
  parameters: { layout: 'centered' },
};

export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      <CardRow label="Custom trigger" icon="tune" action="drag" />
    </div>
  ),
};

export const CanvasPreview = {
  render: () => (
    <CanvasNode
      nodeType="trigger"
      label="Trigger"
      hasToggle
      toggleEnabled
      stepNumber={1}
      title="New message received"
      description="Custom trigger: Triggers when a new message is received in Inbox"
    />
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Custom trigger"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <CustomTriggerBody initialValues={{
            entityType: 'Inbox',
            selectedEvents: ['New message received', 'Conversation assigned'],
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
        variant="customTrigger"
        title="Custom trigger"
        onClose={() => {}} onSave={() => {}} onPreview={() => {}} onExpand={() => {}}
        bodyProps={{ initialValues: {
          entityType: 'Inbox',
          selectedEvents: ['New message received', 'Conversation assigned'],
        } }}
      />
    </div>
  ),
};
