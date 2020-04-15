import * as d3 from 'd3';

import { getMaxAmountByYear } from './data-manipulations';

const xValue = (data) => {
  const maxVal = Math.max(
    getMaxAmountByYear(data.donors),
    getMaxAmountByYear(data.recipients),
  );
  const factor = 5 * (10 ** (maxVal.toString().length - 2));
  return Math.ceil(maxVal / factor) * factor;
};

const xScaleLeft = (data, margin, width) => d3.scaleLinear()
  .domain([xValue(data), 0])
  .range([margin.left, width / 2]);

const xAxisLeft = (g, data, margin, width) => g
  .attr('transform', `translate(0, ${margin.top})`)
  .call(d3.axisTop(xScaleLeft(data, margin, width))
    .ticks(5)
    .tickFormat(d3.format('~s'))
    .tickSizeOuter(0));

const xScaleRight = (data, margin, width) => d3.scaleLinear()
  .domain([0, xValue(data)])
  .range([width / 2, width - margin.right]);

const xAxisRight = (g, data, margin, width) => g
  .attr('transform', `translate(0, ${margin.top})`)
  .call(d3.axisTop(xScaleRight(data, margin, width))
    .ticks(5)
    .tickFormat(d3.format('~s'))
    .tickSizeOuter(0));

export {
  xAxisLeft, xAxisRight, xScaleLeft, xScaleRight,
};
