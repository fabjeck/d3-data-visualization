import * as d3 from 'd3';

import { xAxisLeft, xAxisRight } from './x-axis';
import { yAxis } from './y-axis';
import { chartLeft, chartRight } from './chart';

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

  const svg = d3.create('svg')
    .attr('width', `${width}`)
    .attr('height', `${height}`)
    .attr('viewBox', [0, 0, width, height]);

  svg.append('g')
    .call(xAxisLeft, data, margin, width);

  svg.append('g')
    .call(xAxisRight, data, margin, width);

  svg.append('g')
    .call(yAxis, data, margin, width, height);

  svg.append('g')
    .call(chartLeft, data, margin, width, height);

  svg.append('g')
    .call(chartRight, data, margin, width, height);

  return svg.node();
};

export { fetchData, setupDiagram };
