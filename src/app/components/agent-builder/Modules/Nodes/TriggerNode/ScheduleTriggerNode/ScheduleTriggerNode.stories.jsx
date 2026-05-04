import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import ScheduleBased, { ScheduleBasedBody } from '../../../../Molecules/RHS/Trigger/ScheduleBased/ScheduleBased';


export default {
  title: 'Agent Builder/Modules/Nodes/Trigger/ScheduleTrigger',
  parameters: { layout: 'centered' },
};

export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      <CardRow label="Schedule-based" icon="schedule" action="drag" />
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
      title="Run every day at 9:00 AM"
      description="Schedule-based: Runs on a recurring schedule"
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
          <ScheduleBasedBody
            frequencyOptions={['Hourly', 'Daily', 'Weekly', 'Monthly']}
            dayOptions={['1 day', '2 days', '3 days', '7 days', '14 days', '30 days']}
            timeOptions={['12:00 AM', '6:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM', '3:00 PM', '6:00 PM']}
            defaultFrequency="Daily"
            defaultDay="7 days"
            defaultTime="9:00 AM"
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
      <ScheduleBased
        onClose={() => {}} onExpand={() => {}} onPreview={() => {}} onSave={() => {}}
        frequencyOptions={['Hourly', 'Daily', 'Weekly', 'Monthly']}
        dayOptions={['1 day', '2 days', '3 days', '7 days', '14 days', '30 days']}
        timeOptions={['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM']}
        defaultFrequency="Daily" defaultDay="7 days" defaultTime="9:00 AM"
      />
    </div>
  ),
};
