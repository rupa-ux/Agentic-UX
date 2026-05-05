import React from 'react';
import { CardRow } from '../../../../LHSDrawer/LHSDrawer';
import '../../../../LHSDrawer/LHSDrawer.css';
import CanvasNode from '../../../../Molecules/Canvas/CanvasNode/CanvasNode';
import ExpandedRHSModal from '../../../ExpandedRHSModal/ExpandedRHSModal/ExpandedRHSModal';
import ExpandedRHSTest from '../../../ExpandedRHSModal/ExpandedRHSTest/ExpandedRHSTest';
import LoopBody from '../../../../Organisms/Panels/RHS/LoopBody';
import RHS from '../../../../Organisms/Panels/RHS/RHS';

export default {
  title: 'Agent Builder/Modules/Nodes/Control/Loop',
  parameters: { layout: 'centered' },
};


export const LHSPreview = {
  render: () => (
    <div className="lhs-drawer" style={{ padding: '12px 24px' }}>
      <CardRow label="Loop" icon="repeat" action="drag" />
    </div>
  ),
};

export const CanvasPreview = {
  render: () => (
    <CanvasNode
      nodeType="loop"
      label="Loop"
      hasToggle
      toggleEnabled
      stepNumber={4}
      title="Process all reviews"
      description="Iterate over each review in the collection"
    />
  ),
};

export const ExpandedRHS = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ExpandedRHSModal
        title="Loop"
        onCancel={() => {}} onSave={() => {}} onClose={() => {}}
        formContent={
          <LoopBody initialValues={{
            name: 'Process all reviews',
            description: 'Iterate over each review in the collection',
            loopMode: 'variable',
            loopOver: 'reviews_list',
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
      <RHS variant="loop" title="Loop" onClose={() => {}} onSave={() => {}}
        bodyProps={{ initialValues: {
          name: 'Process all reviews',
          description: 'Iterate over each review in the collection',
          loopMode: 'variable',
          loopOver: 'reviews_list',
        } }}
      />
    </div>
  ),
};
