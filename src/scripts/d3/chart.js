/* eslint-disable max-len */
import * as d3 from 'd3';

import { getCountries, restructureArr } from './data-manipulations';
import { xScaleLeft, xScaleRight } from './x-axis';
import { yScale } from './y-axis';

const series = (data) => d3.stack()
  .keys(getCountries(data))(restructureArr(data));

const chartLeft = (g, data, margin, width, height) => g
  .selectAll('g')
  .data(series(data.donors))
  .join('g')
  .selectAll('rect')
  .data((d) => d)
  .join('rect')
  .attr('x', (d) => xScaleLeft(data, margin, width)(d[1]))
  .attr('y', (d) => yScale(data, margin, height)(d.data.year))
  .attr('width', (d) => xScaleLeft(data, margin, width)(d[0]) - xScaleLeft(data, margin, width)(d[1]) || 0)
  .attr('height', yScale(data, margin, height).bandwidth());

const chartRight = (g, data, margin, width, height) => g
  .selectAll('g')
  .data(series(data.recipients))
  .join('g')
  .selectAll('rect')
  .data((d) => d)
  .join('rect')
  .attr('x', (d) => xScaleRight(data, margin, width)(d[0]))
  .attr('y', (d) => yScale(data, margin, height)(d.data.year))
  .attr('width', (d) => xScaleRight(data, margin, width)(d[1]) - xScaleRight(data, margin, width)(d[0]) || 0)
  .attr('height', yScale(data, margin, height).bandwidth());

export { chartLeft, chartRight };
