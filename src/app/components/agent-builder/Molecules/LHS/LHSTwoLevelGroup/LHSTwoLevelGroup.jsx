import React from 'react';
import './LHSTwoLevelGroup.css';

export default function LHSTwoLevelGroup({ title, platforms = {}, nodeType, onDragStart }) {
  const handleDragStart = (e, platformName, item) => {
    e.dataTransfer.setData('application/reactflow-type', nodeType);
    e.dataTransfer.setData('application/reactflow-label', platformName);
    e.dataTransfer.setData('application/reactflow-description', item);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => onDragStart?.(), 0);
  };

  return (
    <div className="lhs-two-level-group">
      <div className="lhs-two-level-group__panel">
        <p className="lhs-two-level-group__title">{title}</p>
        <div className="lhs-two-level-group__sections">
          {Object.entries(platforms).map(([name, config]) => (
            <div key={name} className="lhs-two-level-group__section">
              <p className="lhs-two-level-group__section-label">{name}</p>
              <div className="lhs-two-level-group__items">
                {config.items.map((item) => (
                  <div
                    key={item}
                    className="lhs-two-level-group__item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, name, item)}
                  >
                    <span className="lhs-two-level-group__item-label">{item}</span>
                    <span className="lhs-two-level-group__item-drag material-symbols-outlined">
                      drag_indicator
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
