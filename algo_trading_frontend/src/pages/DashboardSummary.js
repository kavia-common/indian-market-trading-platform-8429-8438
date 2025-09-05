import React from 'react';
import WidgetCard from '../components/WidgetCard';

export default function DashboardSummary({ items = [] }) {
  return (
    <WidgetCard title="Summary">
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {items.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
    </WidgetCard>
  );
}
