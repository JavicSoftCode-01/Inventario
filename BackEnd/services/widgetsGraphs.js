import { PurchaseService } from "./comprasServices.js";

class WidgetsGraphs {

  static totalProductsPurchased() {
    try {
      const purchases = PurchaseService.getPurchases() || [];
      return purchases.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);
    } catch (error) {
      console.error("Error al calcular total de productos comprados:", error);
      return 0;
    }
  }

  static totalInvestedGeneral() {
    try {
      const purchases = PurchaseService.getPurchases() || [];
      return purchases.reduce(
        (acc, item) =>
          acc + ((Number(item.precioProducto) || 0) * (Number(item.cantidad) || 0)),
        0
      );
    } catch (error) {
      console.error("Error al calcular total invertido:", error);
      return 0;
    }
  }

  static generateData(callback) {
    try {
      const dataMap = {};
      const purchases = PurchaseService.getPurchases() || [];
      purchases.forEach((item) => {
        // Se asume que item.fecha contiene la fecha en un formato adecuado
        if (!dataMap[item.fecha]) dataMap[item.fecha] = 0;
        dataMap[item.fecha] += callback(item);
      });
      return { labels: Object.keys(dataMap), data: Object.values(dataMap) };
    } catch (error) {
      console.error("Error al generar datos para la gráfica:", error);
      return { labels: [], data: [] };
    }
  }

    static validateCanvas(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        console.error(`Canvas con ID "${canvasId}" no encontrado en el DOM`);
        return null;
      }
      return canvas;
    }

  static drawBarChart(canvasId) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        throw new Error("Contenedor del canvas no encontrado");
      }
      const { labels, data } = WidgetsGraphs.generateData((item) => Number(item.cantidad) || 0);
      if (!labels.length) return;
      new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Productos comprados por día",
              data,
              backgroundColor: "rgba(76, 175, 80, 0.7)",
              borderColor: "#4caf50",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          scales: {
            x: { ticks: { color: "#fff" }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: "#fff" }, grid: { color: "#555" } },
          },
          plugins: { legend: { labels: { color: "#fff" } } },
        },
      });
    } catch (error) {
      console.error("Error al dibujar gráfica de barras:", error);
    }
  }

  static drawLineChart(canvasId) {
    try {
      const canvas = document.getElementById(canvasId);
      if (!canvas) {
        throw new Error("Contenedor del canvas no encontrado");
      }
      const { labels, data } = WidgetsGraphs.generateData(
        (item) =>
          (Number(item.precioProducto) || 0) * (Number(item.cantidad) || 0)
      );
      if (!labels.length) return;
      new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Dinero Invertido por Día",
              data,
              fill: "start",
              backgroundColor: "rgba(255, 87, 34, 0.3)",
              borderColor: "#FF5722",
              borderWidth: 2,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          scales: {
            x: { ticks: { color: "#fff" }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: "#fff" }, grid: { color: "#555" } },
          },
          plugins: { legend: { labels: { color: "#fff" } } },
        },
      });
    } catch (error) {
      console.error("Error al dibujar gráfica lineal:", error);
    }
  }
}

export { WidgetsGraphs };