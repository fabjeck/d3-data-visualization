import * as d3 from 'd3';

import { getProps, restructureArr, getMaxAmountByYear } from './data-manipulations';

const fetchData = () => Promise.all([
  d3.csv('data/donors.csv', (data) => ({
    country: String(data.Country),
    year: Number(data.Year),
    amount: Number(data.Donation.replace(/\D/g, '')),
  })),
  d3.csv('data/recipients.csv', (data) => ({
    country: String(data.Country),
    year: Number(data.Year),
    amount: Number(data.Receiving.replace(/\D/g, '')),
  })),
]).then((files) => ({
  donors: files[0],
  recipients: files[1],
}));

const setupDiagram = (data, wrapper) => {
  const width = wrapper.offsetWidth;
  const height = wrapper.offsetHeight;
  const margin = {
    top: 50,
    right: 100,
    bottom: 50,
    left: 100,
  };

  const donors = restructureArr(data.donors);

  const recipients = restructureArr(data.recipients);

  /* X-AXIS */

  const xValue = () => {
    const maxVal = Math.max(
      getMaxAmountByYear(donors),
      getMaxAmountByYear(recipients),
    );
    const factor = 5 * (10 ** (maxVal.toString().length - 2));
    return Math.ceil(maxVal / factor) * factor;
  };

  const xScaleLeft = d3.scaleLinear()
    .domain([xValue(), 0])
    .range([margin.left, width / 2]);

  const xScaleRight = d3.scaleLinear()
    .domain([0, xValue()])
    .range([width / 2, width - margin.right]);

  const xAxisLeft = (g) => g
    .attr('transform', `translate(0, ${margin.top})`)
    .call(d3.axisTop(xScaleLeft)
      .ticks(5)
      .tickFormat(d3.format('~s'))
      .tickSizeOuter(0));

  const xAxisRight = (g) => g
    .attr('transform', `translate(0, ${margin.top})`)
    .call(d3.axisTop(xScaleRight)
      .ticks(5)
      .tickFormat(d3.format('~s'))
      .tickSizeOuter(0));

  /* Y-AXIS */

  const yValues = () => {
    const years = [].concat(data.donors, data.recipients);
    return getProps(years, 'year');
  };

  const yScale = d3.scaleBand()
    .domain(yValues())
    .range([margin.top, height - margin.bottom]);

  const yAxis = (g) => g
    .call(d3.axisLeft(yScale)
      .tickSizeOuter(0))
    .call(() => g.select('.domain').attr('transform', `translate(${width / 2},0)`))
    .call(() => g.selectAll('.tick').data(yValues()).attr('transform', (year) => `translate(${margin.left - 20}, ${yScale(year) + (yScale.bandwidth() / 2)})`));

  /* STACKED CHARTS */

  const seriesLeft = d3.stack()
    .keys(getProps(data.donors, 'country'))(donors);

  const seriesRight = d3.stack()
    .keys(getProps(data.recipients, 'country'))(recipients);

  const chartLeft = (g) => g
    .selectAll('g')
    .data(seriesLeft)
    .join('g')
    .selectAll('rect')
    .data((d) => d)
    .join('rect')
    .attr('x', (d) => xScaleLeft(d[1]))
    .attr('y', (d) => yScale(d.data.year))
    .attr('width', (d) => xScaleLeft(d[0]) - xScaleLeft(d[1]) || 0)
    .attr('height', yScale.bandwidth());

  const chartRight = (g) => g
    .selectAll('g')
    .data(seriesRight)
    .join('g')
    .selectAll('rect')
    .data((d) => d)
    .join('rect')
    .attr('x', (d) => xScaleRight(d[0]))
    .attr('y', (d) => yScale(d.data.year))
    .attr('width', (d) => xScaleRight(d[1]) - xScaleRight(d[0]) || 0)
    .attr('height', yScale.bandwidth());

  /* CREATE CHART */

  const svg = d3.create('svg')
    .attr('width', `${width}`)
    .attr('height', `${height}`)
    .attr('viewBox', [0, 0, width, height]);

  svg.append('g')
    .call(xAxisLeft);

  svg.append('g')
    .call(xAxisRight);

  svg.append('g')
    .call(yAxis);

  svg.append('g')
    .call(chartLeft);

  svg.append('g')
    .call(chartRight);

  return svg.node();
};

export { fetchData, setupDiagram };
