const getProps = (arr, prop) => {
  const props = arr.map((obj) => obj[prop]);
  return Array.from(new Set(props)).sort((a, b) => b - a);
};

const restructureArr = (arr) => {
  const years = getProps(arr, 'year');
  const restructuredArr = [];
  years.forEach((year) => {
    const el = { year };
    arr.filter((obj) => obj.year === year)
      .forEach((obj) => {
        el[obj.country] = obj.amount;
      });
    restructuredArr.push(el);
  });
  return restructuredArr;
};

const getMaxAmountByYear = (arr) => {
  const sumPerYear = arr.map((obj) => Object.values(obj)
    .splice(1)
    .reduce((total, num) => total + num));
  return Math.max(...sumPerYear);
};

export { getProps, restructureArr, getMaxAmountByYear };
