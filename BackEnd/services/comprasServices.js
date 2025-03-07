import {Compra} from "../models/models.js";
import {LocalStorageManager} from "../database/localStorage.js";
import {DateTimeManager} from "../../FrontEnd/static/scripts/utils/datetime.js";
import {UserManager} from "./usuarioServices.js";
import {NotificationManager} from "../../FrontEnd/static/scripts/utils/showNotifications.js";

class PurchaseService {

    // Clave del localStorage para las compras
    static KEY_PURCHASES = "compras";

    static getPurchases() {
        return LocalStorageManager.getData(this.KEY_PURCHASES);
    }

    static createPurchase(data) {
        try {
            const {fecha, hora} = DateTimeManager.getDateTime();
            const session = UserManager.getCurrentSession();

            if (!session) {
                return {
                    success: false,
                    message: "No hay sesión activa"
                };
            }

            // Asegurarse de que estos valores se guarden correctamente
            const userName = session.nombreUsuario;
            const authorizedBy = `${session.nombres} ${session.apellidos}`;

            const newPurchase = new Compra(
                Date.now(),
                data.proveedor,
                data.ciudad,
                data.telefono,
                data.correo,
                data.producto,
                Number(data.precioProducto),
                Number(data.cantidad),
                Number(data.precioVentaPublico),
                fecha,
                hora,
                userName,    // Usuario que crea la compra
                authorizedBy // Nombre completo del autorizador
            );

            const result = LocalStorageManager.create(this.KEY_PURCHASES, newPurchase);

            console.log('Compra creada:', newPurchase); // Para debug

            return {
                success: result,
                message: result ? "Compra creada con éxito" : "Error al crear la compra"
            };
        } catch (error) {
            console.error("Error al crear compra:", error);
            return {success: false, message: "Error al crear la compra"};
        }
    }

    static deletePurchase(id) {
        try {
            // Primero, verificar permisos
            const purchases = this.getPurchases();
            const purchaseToDelete = purchases.find(c => c.id === id);

            if (!purchaseToDelete || !UserManager.isUserOwner(purchaseToDelete.nombreUsuario)) {
                return {success: false, message: "No tienes permisos para eliminar este registro"};
            }

            // Intentar eliminar
            const result = LocalStorageManager.delete(this.KEY_PURCHASES, id);

            return {
                success: result,
                message: result
                    ? "Registro eliminado con éxito"
                    : "Error al eliminar la compra"
            };
        } catch (error) {
            console.error("Error al eliminar compra:", error);
            return {success: false, message: "Error al eliminar la compra"};
        }
    }

    static updatePurchase(id, data) {
        try {
            const purchases = this.getPurchases();
            const originalPurchase = purchases.find(c => c.id === id);

            if (!originalPurchase || !UserManager.isUserOwner(originalPurchase.nombreUsuario)) {
                return {success: false, message: "No tienes permisos para actualizar este registro"};
            }

            const newQuantity = Number(data.cantidad) || originalPurchase.cantidad;

            // El stock debe actualizarse a la nueva cantidad
            const updatedPurchase = {
                ...originalPurchase,
                proveedor: data.proveedor,
                ciudad: data.ciudad,
                telefono: data.telefono,
                correo: data.correo,
                producto: data.producto,
                precioProducto: Number(data.precioProducto) || originalPurchase.precioProducto,
                cantidad: newQuantity,
                precioVentaPublico: Number(data.precioVentaPublico) || originalPurchase.precioVentaPublico,
                stock: newQuantity, // Stock se actualiza a la nueva cantidad
                productosVendidos: 0 // Reiniciar productos vendidos al actualizar cantidad
            };

            const result = LocalStorageManager.update(this.KEY_PURCHASES, id, updatedPurchase);

            if (result) {
                new NotificationManager().showNotification(
                    `Registro actualizado. Nueva cantidad: ${newQuantity}, Stock actual: ${newQuantity}`,
                    "success"
                );
            }

            return {
                success: result,
                message: result ? "Registro actualizado con éxito" : "Error al actualizar la compra"
            };
        } catch (error) {
            console.error("Error al actualizar compra:", error);
            return {success: false, message: "Error al actualizar la compra"};
        }
    }

    static updateStock(id, change) {
        const notificationManager = new NotificationManager();

        try {
            const purchases = this.getPurchases();
            const purchaseIndex = purchases.findIndex(p => p.id === id);

            if (purchaseIndex === -1) {
                return {
                    success: false,
                    message: "Compra no encontrada"
                };
            }

            const purchase = purchases[purchaseIndex];
            const nuevoStock = purchase.stock + change;

            // Validar límites de stock (ahora permite llegar a 0 pero no menor)
            if (nuevoStock < 0 || nuevoStock > purchase.cantidad) {
                notificationManager.showNotification(
                    `No se puede ${change > 0 ? 'aumentar' : 'disminuir'} más el stock`, "warning");
            }

            // Actualizar stock y productos vendidos
            purchase.stock = nuevoStock;
            purchase.productosVendidos = purchase.cantidad - nuevoStock;

            // Notificar cuando el stock llegue exactamente a cero
            if (nuevoStock === 0) {
                notificationManager.showNotification(
                    `¡Atención! Se han agotado el producto ${purchase.producto}`, "warning");
            }

            // Actualizar en localStorage
            LocalStorageManager.update(this.KEY_PURCHASES, id, purchase);

            return {
                success: true,
                message: "Stock actualizado correctamente",
                updatedPurchase: purchase
            };
        } catch (error) {
            console.error("Error al actualizar stock:", error);
            return {
                success: false,
                message: "Error al actualizar el stock"
            };
        }
    }
}

export {PurchaseService};