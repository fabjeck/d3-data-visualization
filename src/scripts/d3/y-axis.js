import * as d3 from 'd3';

import { getYears } from './data-manipulations';

const yValues = (data) => {
  const years = [].concat(data.donors, data.recipients);
  return getYears(years);
};

const yScale = (data, margin, height) => d3.scaleBand()
  .domain(yValues(data))
  .range([margin.top, height - margin.bottom]);

const yAxis = (g, data, margin, width, height) => g
  .call(d3.axisLeft(yScale(data, margin, height))
    .tickSizeOuter(0))
  .call(() => g.select('.domain').attr('transform', `translate(${width / 2},0)`))
  .call(() => g.selectAll('.tick').data(yValues(data)).attr('transform', (year) => `translate(${margin.left - 20}, ${yScale(data, margin, height)(year) + (yScale(data, margin, height).bandwidth() / 2)})`));

export { yAxis, yScale };
