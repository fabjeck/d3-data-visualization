import '../styles/main.scss';

import { fetchData, setupDiagram } from './d3/index';

const d3Wrapper = document.getElementById('d3-wrapper');

const init = async () => {
  const data = await fetchData();
  d3Wrapper.append(setupDiagram(data, d3Wrapper));
};

window.addEventListener('load', init);
