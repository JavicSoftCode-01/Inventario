// BackEnd/database/localStorage.js

function getData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export { getData, setData };
