import '../styles/main.scss';

import { fetchData, setupInfographic } from './d3/index';

const d3Wrapper = document.getElementById('d3-wrapper');
let windowWidth = window.innerWidth;

const debounce = (func) => {
  let resizeTimer;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(func, 250);
};

const update = (data) => {
  debounce(() => {
    if (window.innerWidth !== windowWidth) {
      windowWidth = window.innerWidth;
      d3Wrapper.innerHTML = '';
      d3Wrapper.append(setupInfographic(data, d3Wrapper));
    }
  });
};

const init = () => {
  const data = fetchData();
  d3Wrapper.append(setupInfographic(data, d3Wrapper));
  window.addEventListener('resize', () => { update(data); });
};

init();
