import * as d3 from 'd3';

import { getProps, sortArrByYear, getMaxAmountByYear } from './data-manipulations';

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
    top: 100,
    right: 100,
    bottom: 50,
    left: 100,
  };
  const locale = {
    decimal: '.',
    thousands: '\'',
    grouping: [3],
    currency: ['$', ''],
  };

  d3.formatDefaultLocale(locale);

  const donors = sortArrByYear(data.donors);
  const recipients = sortArrByYear(data.recipients);

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
      .ticks(10)
      .tickFormat(d3.format('$,'))
      .tickSize(0)
      .tickPadding(10))
    .call(() => g.select('.domain').remove())
    .call(() => g.selectAll('.tick:nth-child(even) text').remove())
    .call(() => g.selectAll('.tick line')
      .attr('y1', height - margin.top - margin.bottom))
    .call(() => g.append('text')
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'alphabetic')
      .attr('x', xScaleLeft(xValue()))
      .attr('y', -margin.top / 2)
      .attr('class', 'roles-title')
      .text('Donators'));

  const xAxisRight = (g) => g
    .attr('transform', `translate(0, ${margin.top})`)
    .call(d3.axisTop(xScaleRight)
      .ticks(10)
      .tickFormat(d3.format('$,'))
      .tickSize(0)
      .tickPadding(10))
    .call(() => g.select('.domain').remove())
    .call(() => g.selectAll('.tick:nth-child(even) text').remove())
    .call(() => g.selectAll('.tick line')
      .attr('y1', height - margin.top - margin.bottom))
    .call(() => g.append('text')
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'alphabetic')
      .attr('x', xScaleRight(0))
      .attr('y', -margin.top / 2)
      .attr('class', 'roles-title')
      .text('Recipients'));

  /* Y-AXIS */

  const yValues = () => {
    const years = [].concat(data.donors, data.recipients);
    return getProps(years, 'year');
  };

  const yScale = d3.scaleBand()
    .domain(yValues())
    .range([margin.top, height - margin.bottom])
    .paddingInner(0.4)
    .paddingOuter(0.4);

  const yAxis = (g) => g
    .call(d3.axisLeft(yScale)
      .tickSize(0)
      .tickPadding(10))
    .call(() => g.select('.domain').remove())
    .call(() => g.selectAll('.tick').data(yValues())
      .attr('transform', (year) => `translate(${margin.left}, ${yScale(year) + (yScale.bandwidth() / 2)})`))
    .call(() => g.selectAll('.tick line').attr('x1', width - margin.left - margin.right));

  /* STACKED CHARTS & TOOLTIP */

  const colors = d3.scaleOrdinal()
    .domain([getProps([].concat(data.donors, data.recipients), 'country')])
    .range(d3.schemeSpectral[11]);

  const seriesLeft = d3.stack()
    .keys(getProps(data.donors, 'country'))(donors);

  const seriesRight = d3.stack()
    .keys(getProps(data.recipients, 'country'))(recipients);

  const tooltip = d3.select(wrapper).append('div')
    .attr('class', 'tooltip');

  const chartLeft = (g) => g
    .selectAll('g')
    .data(seriesLeft)
    .join('g')
    .attr('fill', (d) => colors(d.key))
    .selectAll('rect')
    .data((d) => d.map((el) => Object.assign(el, { key: d.key })))
    .join('rect')
    .attr('x', (d) => xScaleLeft(d[1]))
    .attr('y', (d) => yScale(d.data.year))
    .attr('width', (d) => xScaleLeft(d[0]) - xScaleLeft(d[1]) || 0)
    .attr('height', yScale.bandwidth())
    .on('mouseover', (d) => {
      tooltip
        .html(d.key)
        .style('left', `${xScaleLeft(d[1]) + ((xScaleLeft(d[0]) - xScaleLeft(d[1])) / 2)}px`)
        .style('transform', 'translate(-50%, 0)')
        .style('top', `${yScale(d.data.year) + yScale.bandwidth()}px`)
        .style('opacity', 1);
    })
    .on('mouseout', () => {
      tooltip
        .style('opacity', 0);
    });

  const chartRight = (g) => g
    .selectAll('g')
    .data(seriesRight)
    .join('g')
    .attr('fill', (d) => colors(d.key))
    .selectAll('rect')
    .data((d) => d.map((el) => Object.assign(el, { key: d.key })))
    .join('rect')
    .attr('x', (d) => xScaleRight(d[0]))
    .attr('y', (d) => yScale(d.data.year))
    .attr('width', (d) => xScaleRight(d[1]) - xScaleRight(d[0]) || 0)
    .attr('height', yScale.bandwidth())
    .on('mouseover', (d) => {
      tooltip
        .html(d.key)
        .style('left', `${xScaleRight(d[0]) + ((xScaleRight(d[1]) - xScaleRight(d[0])) / 2)}px`)
        .style('transform', 'translate(-50%, 0)')
        .style('top', `${yScale(d.data.year) + yScale.bandwidth()}px`)
        .style('opacity', 1);
    })
    .on('mouseout', () => {
      tooltip
        .style('opacity', 0);
    });

  /* SEPARATOR */

  const verticalSeparator = (g) => g
    .attr('class', 'separator')
    .attr('y1', margin.top)
    .attr('y2', height - margin.bottom)
    .attr('transform', `translate(${xScaleLeft(0)}, 0)`);

  /* CREATE CHART */

  const svg = d3.create('svg')
    .attr('class', 'd3-chart')
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

  svg.append('line')
    .call(verticalSeparator);

  return svg.node();
};

export { fetchData, setupDiagram };
