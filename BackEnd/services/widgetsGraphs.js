import { obtenerCompras } from "./comprasServices.js"; 

function totalProductosComprados() {
    return obtenerCompras().reduce((acc, c) => acc + (+c.cantidad || 0), 0);
}

function totalInvertidoGeneral() {
    return obtenerCompras().reduce(
        (acc, c) => acc + ((+c.precioProducto || 0) * (+c.cantidad || 0)),
        0
    );
}

function generarDatos(callback) {
    const mapa = {};
    obtenerCompras().forEach((c) => {
        if (!mapa[c.fecha]) mapa[c.fecha] = 0;
        mapa[c.fecha] += callback(c);
    });
    return { labels: Object.keys(mapa), data: Object.values(mapa) };
}

function dibujarGraficaBarrasChartJS(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { labels, data } = generarDatos((c) => +c.cantidad || 0);
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
}

function dibujarGraficaLineaChartJS(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const { labels, data } = generarDatos((c) => (+c.precioProducto || 0) * (+c.cantidad || 0));
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
}

export { totalProductosComprados, totalInvertidoGeneral, dibujarGraficaBarrasChartJS, dibujarGraficaLineaChartJS };