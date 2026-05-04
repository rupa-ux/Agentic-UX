import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import EntityTaskBody from '../../../../Organisms/Panels/RHS/EntityTaskBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';


export default {
  title: 'Agent Builder/Modules/Nodes/Task/EntityTask',
  parameters: { layout: 'centered' },
};

const TASK_CARDS = [
  { label: 'Review', icon: 'grade' },
  { label: 'Ticketing', icon: 'confirmation_number' },
  { label: 'Contact', icon: 'group' },
  { label: 'Referral', icon: 'redeem' },
  { label: 'Surveys', icon: 'task_alt' },
  { label: 'External apps', icon: 'grid_view' },
];

export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      {TASK_CARDS.map((card) => (
        <CardRow key={card.label} label={card.label} icon={card.icon} action="chevron" />
      ))}
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
      title="Send Review Response"
      description="Reviews: Post a reply to the selected review"
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
        formContent={
          <EntityTaskBody initialValues={{
            taskName: 'Send Review Response',
            description: 'Post a reply to the selected review from the Reviews source',
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
      <RHS variant="entityTask" title="Task" onClose={() => {}} onSave={() => {}} onPreview={() => {}} onExpand={() => {}}
        bodyProps={{ initialValues: {
          taskName: 'Send Review Response',
          description: 'Post a reply to the selected review from the Reviews source',
        } }}
      />
    </div>
  ),
};
