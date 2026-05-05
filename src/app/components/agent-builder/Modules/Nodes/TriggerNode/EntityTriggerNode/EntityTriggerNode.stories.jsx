import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import EntityTriggerBody from '../../../../Organisms/Panels/RHS/EntityTriggerBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';


export default {
  title: 'Agent Builder/Modules/Nodes/Trigger/EntityTrigger',
  parameters: { layout: 'centered' },
};

const TRIGGER_CARDS = [
  { label: 'Reviews', icon: 'grade' },
  { label: 'Inbox', icon: 'sms' },
  { label: 'Listings', icon: 'location_on' },
  { label: 'Social', icon: 'workspaces' },
  { label: 'Surveys', icon: 'assignment_turned_in' },
  { label: 'Ticketing', icon: 'shapes' },
  { label: 'Contact', icon: 'group' },
  { label: 'External apps', icon: 'grid_view' },
];

export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      {TRIGGER_CARDS.map((card) => (
        <CardRow key={card.label} label={card.label} icon={card.icon} action="chevron" />
      ))}
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
      title="New Review Received"
      description="Reviews: Triggers when a new or updated review is received across all sources and locations"
    />
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Trigger"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <EntityTriggerBody initialValues={{
            triggerName: 'New Review Received',
            description: 'Triggers when a new or updated review is received across all sources and locations',
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
      <RHS variant="entityTrigger" title="Trigger" onClose={() => {}} onSave={() => {}} onPreview={() => {}} onExpand={() => {}}
        bodyProps={{ initialValues: {
          triggerName: 'New Review Received',
          description: 'Triggers when a new or updated review is received across all sources and locations',
        } }}
      />
    </div>
  ),
};
