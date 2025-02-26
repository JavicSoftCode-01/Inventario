// BackEnd/database/localStorage.js

function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  
  function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  // Manejo de un valor simple (ej: total de compras) 
  function getValue(key) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : 0;
  }
  
  function setValue(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }
  
  export { getData, setData, getValue, setValue };
  