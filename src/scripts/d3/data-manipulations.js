const getYears = (arr) => {
  const years = arr.map((obj) => obj.year);
  return Array.from(new Set(years)).sort((a, b) => b - a);
};

const getCountries = (arr) => {
  const countries = arr.map((obj) => obj.country);
  return Array.from(new Set(countries)).sort((a, b) => b - a);
};

const restructureArr = (arr) => {
  const years = getYears(arr);
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
  const arrByYear = restructureArr(arr);
  const sumPerYear = arrByYear.map((obj) => {
    const el = obj;
    delete el.year;
    return Object.values(el).reduce((total, num) => total + num);
  });
  return Math.max(...sumPerYear);
};

export {
  getYears, getCountries, restructureArr, getMaxAmountByYear,
};
