class PurchaseManager {

    static calculateTotal(purchase) {
        try {
            // Convertir precio y cantidad a número, utilizando 0 si no son válidos.
            const price = Number(purchase.precioProducto) || 0;
            const quantity = Number(purchase.cantidad) || 0;
            return price * quantity;
        } catch (error) {
            console.error("Error al calcular el total de la compra:", error.message);
            return 0;
        }
    }

    static filterPurchasesByQuery(purchases, query) {
        try {
            if (!Array.isArray(purchases)) {
                throw new Error("El primer parámetro debe ser un arreglo de compras.");
            }
            const lowerQuery = query.toLowerCase();
            return purchases.filter(purchase => {
                // Uso del operador de encadenamiento opcional para evitar errores si las propiedades no existen.
                return (
                    purchase.proveedor?.toLowerCase().includes(lowerQuery) ||
                    purchase.autorizador?.toLowerCase().includes(lowerQuery) ||
                    purchase.telefono?.toLowerCase().includes(lowerQuery)
                );
            });
        } catch (error) {
            console.error("Error al filtrar compras por query:", error.message);
            return [];
        }
    }

    static filterPurchasesByTotal(purchases, order = "max") {
        try {
            if (!Array.isArray(purchases) || purchases.length === 0) {
                return [];
            }
            // Calcula los totales para cada compra.
            const totals = purchases.map(purchase => PurchaseManager.calculateTotal(purchase));
            // Determina el valor a filtrar según el orden indicado.
            const filterValue = order === "max" ? Math.max(...totals) : Math.min(...totals);
            return purchases.filter(purchase => PurchaseManager.calculateTotal(purchase) === filterValue);
        } catch (error) {
            console.error("Error al filtrar compras por total:", error.message);
            return [];
        }
    }
}

export {PurchaseManager};
