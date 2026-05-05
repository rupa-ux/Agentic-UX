import React from 'react';
import PropTypes from 'prop-types';
import './PerformanceTable.css';

const COLUMNS = [
  { key: 'location',         label: 'Location',              width: 350 },
  { key: 'reviewsResponded', label: 'Reviews responded',     width: 230 },
  { key: 'responseRate',     label: 'Response rate',         width: 230 },
  { key: 'avgResponseTime',  label: 'Average response time', width: 230 },
  { key: 'timeSaved',        label: 'Time saved',            width: 230 },
];

const DEFAULT_ROWS = [
  { location: 'Atlanta, GA',       reviewsResponded: 19, responseRate: '90%', avgResponseTime: '1h 48m', timeSaved: '4h 20m' },
  { location: 'Stamford, CT',      reviewsResponded: 9,  responseRate: '92%', avgResponseTime: '2h 05m', timeSaved: '2h 10m' },
  { location: 'Los Angeles, CA',   reviewsResponded: 22, responseRate: '90%', avgResponseTime: '2h 22m', timeSaved: '2h 05m' },
  { location: 'New York City, NY', reviewsResponded: 18, responseRate: '90%', avgResponseTime: '2h 10m', timeSaved: '2h 40m' },
  { location: 'San Diego, CA',     reviewsResponded: 7,  responseRate: '95%', avgResponseTime: '2h 40m', timeSaved: '3h 05m' },
  { location: 'Las Vegas, NV',     reviewsResponded: 3,  responseRate: '94%', avgResponseTime: '3h 05m', timeSaved: '2h 10m' },
  { location: 'Chicago, IL',       reviewsResponded: 10, responseRate: '92%', avgResponseTime: '3h 05m', timeSaved: '3h 05m' },
];

export default function PerformanceTable({ rows = DEFAULT_ROWS }) {
  return (
    <div style={{ background: '#fff', overflowX: 'auto' }} className="performance-table">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Roboto", arial, sans-serif', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e9f0' }}>
            {COLUMNS.map((col) => (
              <th key={col.key} style={{ width: col.width, padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 500, color: '#555', whiteSpace: 'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 12px', color: '#212121' }}>{row.location}</td>
              <td style={{ padding: '12px 12px', color: '#212121' }}>{row.reviewsResponded}</td>
              <td style={{ padding: '12px 12px', color: '#212121' }}>{row.responseRate}</td>
              <td style={{ padding: '12px 12px', color: '#212121' }}>{row.avgResponseTime}</td>
              <td style={{ padding: '12px 12px', color: '#212121' }}>{row.timeSaved}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

PerformanceTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    location:        PropTypes.string.isRequired,
    reviewsResponded:PropTypes.number,
    responseRate:    PropTypes.string,
    avgResponseTime: PropTypes.string,
    timeSaved:       PropTypes.string,
  })),
};
