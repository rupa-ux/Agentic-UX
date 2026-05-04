import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import DelayBody from '../../../../Organisms/Panels/RHS/DelayBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';

export default {
  title: 'Agent Builder/Modules/Nodes/Control/Delay',
  parameters: { layout: 'centered' },
};

export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      <CardRow label="Delay" icon="schedule" action="drag" />
    </div>
  ),
};

export const CanvasPreview = {
  render: () => (
    <CanvasNode
      nodeType="delay"
      label="Delay"
      hasToggle
      toggleEnabled
      stepNumber={4}
      title="Wait before continuing"
      description="Pause the workflow for 24 hours"
    />
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Delay"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <DelayBody initialValues={{ name: 'Wait before continuing', duration: '24', unit: 'hours' }} />
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
      <RHS variant="delay" title="Delay" onClose={() => {}} onSave={() => {}}
        bodyProps={{ initialValues: { name: 'Wait before continuing', duration: '24', unit: 'hours' } }}
      />
    </div>
  ),
};
