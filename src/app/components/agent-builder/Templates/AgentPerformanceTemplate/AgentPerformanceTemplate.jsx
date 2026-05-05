import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Badge } from '@/app/components/ui/badge';
import { IconStrip, ReviewsL2NavPanel } from '@/app/components/Sidebar';
import { MonitorNotificationsProvider } from '@/app/context/MonitorNotificationsContext';
import {
  APP_MAIN_CONTENT_SHELL_CLASS,
  APP_SHELL_BELOW_TOPBAR_CARD_CLASS,
  APP_SHELL_GUTTER_SURFACE_CLASS,
  APP_SHELL_RAIL_SURFACE_CLASS,
} from '@/app/components/layout/appShellClasses';
import MetricCard from '../../Molecules/MetricCard/MetricCard';
import PerformanceTable from '../../Organisms/DataViews/PerformanceTable/PerformanceTable';

const STATUS_STYLE = {
  Running: { background: '#e8f5e9', color: '#2e7d32' },
  Paused:  { background: '#fff8e1', color: '#f57f17' },
  Draft:   { background: '#f5f5f5', color: '#616161' },
};

const DEFAULT_METRICS = [
  { value: '120',    title: 'Reviews responded',     showTrend: true, trend: '+1.3%', trendPositive: true },
  { value: '82%',    title: 'Response rate',          showTrend: true, trend: '+1.3%', trendPositive: true },
  { value: '20m',    title: 'Average response time',  showTrend: true, trend: '+1.3%', trendPositive: true },
  { value: '2h 20m', title: 'Time saved',             showTrend: true, trend: '+1.3%', trendPositive: true, showConfig: true },
];

const iconStyle = { fontSize: 20, fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 20", lineHeight: 1 };

export default function AgentPerformanceTemplate({
  agentName = 'Outcomes for Review response agent - East Region',
  agentStatus = 'Running',
  metrics = DEFAULT_METRICS,
  tableRows,
  tableSlot,
  onBack,
  onConfigMetric,
  activeNavId = 'reviews',
  onNavChange,
}) {
  const [currentNavId, setCurrentNavId] = useState(activeNavId);
  const statusStyle = STATUS_STYLE[agentStatus] ?? STATUS_STYLE.Draft;

  const handleNavChange = (id) => { setCurrentNavId(id); onNavChange?.(id); };

  return (
    <MonitorNotificationsProvider onNavigateToMonitor={() => handleNavChange('agents-monitor')}>
      <div className={`relative h-screen w-screen flex overflow-hidden ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>

        <IconStrip currentView={currentNavId} onViewChange={handleNavChange} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className={`h-[48px] flex items-center px-4 shrink-0 rounded-tr-lg ${APP_SHELL_RAIL_SURFACE_CLASS}`}>
            <p className="text-[16px] text-[#212121] dark:text-[#e4e4e4] tracking-[-0.31px] font-normal">Reviews AI</p>
          </div>

          <div className={`flex-1 flex min-h-0 overflow-hidden pr-[10px] pb-[10px] pl-0 ${APP_SHELL_GUTTER_SURFACE_CLASS}`}>
            <div className={APP_SHELL_BELOW_TOPBAR_CARD_CLASS}>
              <ReviewsL2NavPanel />

              <div className={APP_MAIN_CONTENT_SHELL_CLASS}>
                {/* Page Header */}
                <div className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-app-shell-border bg-app-shell-main">
                  <div className="flex items-center gap-2 min-w-0">
                    <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-accent border-none bg-transparent cursor-pointer shrink-0">
                      <span className="material-symbols-outlined text-foreground" style={iconStyle}>arrow_left_alt</span>
                    </button>
                    <span className="text-[18px] font-normal text-foreground tracking-[-0.36px] truncate">{agentName}</span>
                    <Badge style={{ ...statusStyle, border: 'none', fontWeight: 400, fontSize: 12 }}>{agentStatus}</Badge>
                  </div>
                  <button className="w-9 h-9 border border-border rounded-md bg-background flex items-center justify-center hover:bg-accent transition-colors cursor-pointer shrink-0">
                    <span className="material-symbols-outlined text-muted-foreground" style={iconStyle}>filter_list</span>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto flex flex-col gap-5 p-6 bg-app-shell-main">
                  <div className="flex gap-4">
                    {metrics.map((m, i) => (
                      <div key={i} className="flex-none w-[310px]">
                        <MetricCard
                          value={m.value}
                          title={m.title}
                          showTrend={m.showTrend}
                          trend={m.trend}
                          trendPositive={m.trendPositive}
                          showConfig={m.showConfig}
                          onConfig={onConfigMetric}
                        />
                      </div>
                    ))}
                  </div>
                  {tableSlot || <PerformanceTable rows={tableRows} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MonitorNotificationsProvider>
  );
}

AgentPerformanceTemplate.propTypes = {
  agentName: PropTypes.string,
  agentStatus: PropTypes.oneOf(['Running', 'Paused', 'Draft']),
  metrics: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    title: PropTypes.string,
    showTrend: PropTypes.bool,
    trend: PropTypes.string,
    trendPositive: PropTypes.bool,
    showConfig: PropTypes.bool,
  })),
  tableRows: PropTypes.array,
  tableSlot: PropTypes.node,
  onBack: PropTypes.func,
  onConfigMetric: PropTypes.func,
  activeNavId: PropTypes.string,
  onNavChange: PropTypes.func,
};
