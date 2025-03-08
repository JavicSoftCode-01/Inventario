// import {PurchaseService} from "../../../../BackEnd/services/purchaseService.js";
// import {ExecuteManager} from "../../../../BackEnd/utils/execute.js";
// import {NotificationManager} from "./showNotifications.js";
//
// class WidgetsGraphs {
//
//   static chartDefaults = {
//     responsive: true,
//     maintainAspectRatio: true,
//     aspectRatio: 2,
//     scales: {
//       x: {ticks: {color: "#fff"}, grid: {display: false}},
//       y: {beginAtZero: true, ticks: {color: "#fff"}, grid: {color: "#555"}}
//     },
//     plugins: {legend: {labels: {color: "#fff"}}}
//   };
//
//   static totalProductsPurchased() {
//     return ExecuteManager.execute(() => {
//       const purchases = PurchaseService.getPurchases();
//       return purchases.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);
//     }, "Exito! Al calcular total de productos.", "Error! Al calcular total de productos:") ?? 0;
//   }
//
//   static totalInvestedGeneral() {
//     return ExecuteManager.execute(() => {
//       const purchases = PurchaseService.getPurchases();
//       return purchases.reduce(
//         (acc, item) => acc + ((Number(item.precioProducto) || 0) * (Number(item.cantidad) || 0)),
//         0
//       );
//     }, "Exito! Al calcular total invertido.", "Error! Al calcular total invertido:") ?? 0;
//   }
//
//   static generateChartData(dataCallback) {
//     return ExecuteManager.execute(() => {
//       const purchases = PurchaseService.getPurchases();
//       const groupedData = purchases.reduce((acc, item) => {
//         const value = dataCallback(item);
//         acc[item.fecha] = (acc[item.fecha] || 0) + value;
//         return acc;
//       }, {});
//
//       return {
//         labels: Object.keys(groupedData),
//         data: Object.values(groupedData)
//       };
//     }, "Exito! Al generar datos para la gráfica.", "Error! Al generar datos para la gráfica:") ?? {
//       labels: [],
//       data: []
//     };
//   }
//
//   static validateCanvas(canvasId) {
//     return ExecuteManager.execute(() => {
//       const canvas = document.getElementById(canvasId);
//       if (!canvas) throw new Error(`Canvas con ID '${canvasId}' no encontrado`);
//       return canvas;
//     }, "Exito! Al validar canvas.", "Error! Al validar canvas:");
//   }
//
//   static drawBarChart(canvasId) {
//     ExecuteManager.execute(() => {
//       const canvas = this.validateCanvas(canvasId);
//       if (!canvas) return;
//
//       const {labels, data} = this.generateChartData(item => Number(item.cantidad) || 0);
//       if (!labels.length) {
//         NotificationManager.info("Gráfica Productos sin datos");
//         return;
//       }
//
//       new Chart(canvas, {
//         type: "bar",
//         data: {
//           labels,
//           datasets: [{
//             label: "Productos comprados por día",
//             data,
//             backgroundColor: "rgba(76, 175, 80, 0.7)",
//             borderColor: "#4caf50",
//             borderWidth: 1
//           }]
//         },
//         options: this.chartDefaults
//       });
//     }, "Exito! Al generar gráfica de barras.", "Error! Al generar gráfica de barras:");
//   }
//
//   static drawLineChart(canvasId) {
//     ExecuteManager.execute(() => {
//       const canvas = this.validateCanvas(canvasId);
//       if (!canvas) return;
//
//       const {labels, data} = this.generateChartData(
//         item => (Number(item.precioProducto) || 0) * (Number(item.cantidad) || 0)
//       );
//       if (!labels.length) {
//         NotificationManager.info("Gráfica Capital sin datos");
//         return;
//       }
//
//       new Chart(canvas, {
//         type: "line",
//         data: {
//           labels,
//           datasets: [{
//             label: "Capital invertido por Día",
//             data,
//             fill: "start",
//             backgroundColor: "rgba(255, 87, 34, 0.3)",
//             borderColor: "#FF5722",
//             borderWidth: 2,
//             tension: 0.3
//           }]
//         },
//         options: this.chartDefaults
//       });
//     }, "Exito! Al generar gráfica lineal.", "Error! Al generar gráfica lineal:");
//   }
// }
//
// export {WidgetsGraphs};

import {PurchaseService} from "../../../../BackEnd/services/purchaseService.js";
import {ExecuteManager} from "../../../../BackEnd/utils/execute.js";
import {NotificationManager} from "./showNotifications.js";

class WidgetsGraphs {

  // Propiedad estática utilizada en todas las gráficas.
  static chartDefaults = {
    responsive: true, maintainAspectRatio: true, aspectRatio: 2, scales: {
      x: {ticks: {color: "#fff"}, grid: {display: false}},
      y: {beginAtZero: true, ticks: {color: "#fff"}, grid: {color: "#555"}}
    }, plugins: {legend: {labels: {color: "#fff"}}}
  };

  // >>> Métodos estáticos utilizados en otros archivos. <<<

  /**
   * 🔰Método para calcular el total de productos comprados.🔰
   */
  static totalProductsPurchased() {
    return ExecuteManager.execute(() => {
      const purchases = PurchaseService.getPurchases();
      return purchases.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);
    }, "Exito! Al calcular total de productos.", "Error! Al calcular total de productos:") ?? 0;
  }

  /**
   *  🔰Método para calcular el total invertido en general.🔰
   */
  static totalInvestedGeneral() {
    return ExecuteManager.execute(() => {
      const purchases = PurchaseService.getPurchases();
      return purchases.reduce((acc, item) => acc + ((Number(item.precioProducto) || 0) * (Number(item.cantidad) || 0)), 0);
    }, "Exito! Al calcular total invertido.", "Error! Al calcular total invertido:") ?? 0;
  }

  /**
   *  🔰Método para dibujar una gráfica de barras de productos comprados por día.🔰
   */
  static drawBarChart(canvasId) {
    ExecuteManager.execute(() => {
      const canvas = new WidgetsGraphs().validateCanvas(canvasId);
      if (!canvas) return;

      const {labels, data} = new WidgetsGraphs().generateChartData(item => Number(item.cantidad) || 0);
      if (!labels.length) {
        NotificationManager.info("Gráfica Productos sin datos");
        return;
      }

      new Chart(canvas, {
        type: "bar", data: {
          labels, datasets: [{
            label: "Productos comprados por día",
            data,
            backgroundColor: "rgba(76, 175, 80, 0.7)",
            borderColor: "#4caf50",
            borderWidth: 1
          }]
        }, options: this.chartDefaults
      });
    }, "Exito! Al generar gráfica de barras.", "Error! Al generar gráfica de barras:");
  }

  /**
   *  🔰Método para dibujar una gráfica lineal del capital invertido por día.🔰
   */
  static drawLineChart(canvasId) {
    ExecuteManager.execute(() => {
      const canvas = new WidgetsGraphs().validateCanvas(canvasId);
      if (!canvas) return;

      const {
        labels,
        data
      } = new WidgetsGraphs().generateChartData(item => (Number(item.precioProducto) || 0) * (Number(item.cantidad) || 0));
      if (!labels.length) {
        NotificationManager.info("Gráfica Capital sin datos");
        return;
      }

      new Chart(canvas, {
        type: "line", data: {
          labels, datasets: [{
            label: "Capital invertido por Día",
            data,
            fill: "start",
            backgroundColor: "rgba(255, 87, 34, 0.3)",
            borderColor: "#FF5722",
            borderWidth: 2,
            tension: 0.3
          }]
        }, options: this.chartDefaults
      });
    }, "Exito! Al generar gráfica lineal.", "Error! Al generar gráfica lineal:");
  }

  // >>> Métodos utilizados solo dentro de esta clase. <<<

  // Genera datos para la gráfica agrupando los datos de las compras según una función de callback.
  generateChartData(dataCallback) {
    return ExecuteManager.execute(() => {
      const purchases = PurchaseService.getPurchases();
      const groupedData = purchases.reduce((acc, item) => {
        const value = dataCallback(item);
        acc[item.fecha] = (acc[item.fecha] || 0) + value;
        return acc;
      }, {});

      return {
        labels: Object.keys(groupedData), data: Object.values(groupedData)
      };
    }, "Exito! Al generar datos para la gráfica.", "Error! Al generar datos para la gráfica:") ?? {
      labels: [], data: []
    };
  }

  // Valida la existencia de un elemento canvas en el DOM por su ID.
  validateCanvas(canvasId) {
    return ExecuteManager.execute(() => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) throw new Error(`Canvas con ID '${canvasId}' no encontrado`);
      return canvas;
    }, "Exito! Al validar canvas.", "Error! Al validar canvas:");
  }
}

export {WidgetsGraphs};