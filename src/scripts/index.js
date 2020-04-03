import '../styles/main.scss';

import * as d3 from 'd3';

const fetchData = () => Promise.all([
  d3.csv('data/donors.csv', (data) => ({
    country: data.Country,
    year: data.Year,
    amount: Number(data.Donation.replace(/\D/g, '')),
  })),
  d3.csv('data/recipients.csv', (data) => ({
    country: data.Country,
    year: data.Year,
    amount: Number(data.Receiving.replace(/\D/g, '')),
  })),
]).then((files) => ({
  donors: files[0],
  recipients: files[1],
}));

const setupDiagram = (data) => {
  const width = 100;
  const height = 100;
  const margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  const svg = d3.create('svg')
    .attr('width', `${width}%`)
    .attr('height', `${height}%`)
    .attr('viewBox', [0, 0, width, height]);

  /* X-AXIS */

  const xValue = () => {
    const amounts = [].concat(data.donors, data.recipients)
      .map((obj) => obj.amount);
    const maxVal = Math.max(...amounts);
    const factor = 5 * (10 ** (maxVal.toString().length - 2));
    return Math.ceil(maxVal / factor) * factor;
  };

  const xAxis = (g) => g
    .call(d3.axisTop(
      d3.scaleLinear()
        .domain([0, xValue()])
        .range([margin.left, width - margin.right]),
    )
      .ticks(5)
      .tickSizeOuter(0));

  svg.append('g')
    .call(xAxis);

  /* Y-AXIS */

  const yValues = () => {
    const years = [].concat(data.donors, data.recipients)
      .map((obj) => obj.year);
    return Array.from(new Set(years)).sort().reverse();
  };

  const yAxis = (g) => g
    .call(d3.axisLeft(
      d3.scaleBand()
        .domain(yValues())
        .range([margin.top, height - margin.bottom]),
    )
      .tickSizeOuter(0));

  svg.append('g')
    .call(yAxis);

  return svg.node();
};

const init = async () => {
  const data = await fetchData();
  document.getElementById('d3-wrapper').append(setupDiagram(data));
};

window.addEventListener('load', init);
