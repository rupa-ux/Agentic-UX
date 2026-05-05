import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import ParallelBody from '../../../../Organisms/Panels/RHS/ParallelBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';

export default {
  title: 'Agent Builder/Modules/Nodes/Control/Parallel',
  parameters: { layout: 'centered' },
};


export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      <CardRow label="Parallel tasks" icon="splitscreen_add" action="drag" />
    </div>
  ),
};

export const CanvasPreview = {
  render: () => (
    <CanvasNode
      nodeType="parallel"
      label="Parallel tasks"
      hasToggle
      toggleEnabled
      hasAddButton
      stepNumber={3}
      title="Run tasks simultaneously"
      description="Execute multiple branches in parallel"
    />
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Parallel tasks"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <ParallelBody initialValues={{
            nodeName: 'Run tasks simultaneously',
            description: 'Execute multiple branches in parallel',
            branches: [{ name: 'Reviews Handler' }, { name: 'Inbox Handler' }, { name: 'Survey Handler' }],
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
      <RHS variant="parallel" title="Parallel tasks" onClose={() => {}} onSave={() => {}}
        bodyProps={{ initialValues: {
          nodeName: 'Run tasks simultaneously',
          description: 'Execute multiple branches in parallel',
          branches: [{ name: 'Reviews Handler' }, { name: 'Inbox Handler' }, { name: 'Survey Handler' }],
        } }}
      />
    </div>
  ),
};
