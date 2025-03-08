import {ExecuteManager} from "../../../../BackEnd/utils/execute.js";
import {NotificationManager} from "./showNotifications.js";

class PurchaseManager {
    // Definir los campos de búsqueda como propiedad estática
    static searchFields = [
        'proveedor',
        'autorizador',
        'telefono',
        'producto',
        'ciudad'
    ];

    static calculateTotal(purchase) {
        return ExecuteManager.execute(() => {
            const price = Number(purchase.precioProducto) || 0;
            const quantity = Number(purchase.cantidad) || 0;
            return price * quantity;
        }, "Total calculado correctamente", "Error al calcular el total:");
    }

    static search(data, searchTerm, searchFields = this.searchFields, options = { matchType: 'includes' }) {
        return ExecuteManager.execute(() => {
            if (!Array.isArray(data) || data.length === 0) {
                NotificationManager.info("No hay datos disponibles para buscar");
                return [];
            }

            if (!searchTerm?.trim()) {
                return data;
            }

            const { matchType } = options;
            const lowerSearchTerm = searchTerm.toString().toLowerCase();

            return data.filter(item =>
                searchFields.some(field => {
                    const fieldValue = item[field]?.toString().toLowerCase();
                    if (!fieldValue) return false;

                    return matchType === 'exact'
                        ? fieldValue === lowerSearchTerm
                        : fieldValue.includes(lowerSearchTerm);
                })
            );
        }, "Búsqueda realizada con éxito", "Error al realizar la búsqueda:");
    }

    static filterPurchasesByTotal(purchases, order = "max") {
        return ExecuteManager.execute(() => {
            if (!Array.isArray(purchases) || purchases.length === 0) {
                NotificationManager.info("No hay compras para filtrar");
                return [];
            }

            const totals = purchases.map(purchase => this.calculateTotal(purchase));
            const filterValue = order === "max"
                ? Math.max(...totals)
                : Math.min(...totals);

            return purchases.filter(purchase =>
                this.calculateTotal(purchase) === filterValue
            );
        }, "Filtrado por total completado", "Error al filtrar por total:");
    }
}

export {PurchaseManager};