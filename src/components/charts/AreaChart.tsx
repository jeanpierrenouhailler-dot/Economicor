import React, { useMemo } from 'react';
import { EconomicObservation } from '../../models/Observation';
import { LineChart } from './LineChart';

interface AreaChartProps {
  observations: EconomicObservation[];
  unit?: string;
  height?: number;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  observations,
  unit,
  height = 360
}) => {
  // We can render rich styled line chart or SVG area
  return <LineChart observations={observations} unit={unit} height={height} />;
};
