// models/Producto.js
const db = require('../mysql'); 

const Producto = {
    // 1. Obtener todos
    findAll: async () => {
        const query = 'SELECT * FROM productos';
        const [rows] = await db.execute(query);
        return rows;
    },

    // 2. Obtener por ID
    findById: async (id) => {
        const query = 'SELECT * FROM productos WHERE id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    },

    // 3. Crear
    create: async (datos) => {
        const { nombre, precio, categoria, stock, descripcion, imagenUrl } = datos;
        
        const query = `
            INSERT INTO productos (nombre, precio, categoria, stock, descripcion, imagenUrl)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [
            nombre, 
            precio, 
            categoria, 
            stock, 
            descripcion || "", 
            imagenUrl || null
        ]);
        
        return { id: result.insertId, ...datos };
    },

    // ---------------------------------------------------------
    // 4. ACTUALIZAR (CORREGIDO PARA NO BORRAR IMÁGENES)
    // ---------------------------------------------------------
    update: async (id, datos) => {
        // Creamos arrays para guardar solo los campos que vienen en 'datos'
        const campos = [];
        const valores = [];

        // Verificamos cada campo. Si existe en 'datos', lo agregamos a la consulta.
        if (datos.nombre !== undefined) { campos.push('nombre = ?'); valores.push(datos.nombre); }
        if (datos.precio !== undefined) { campos.push('precio = ?'); valores.push(datos.precio); }
        if (datos.categoria !== undefined) { campos.push('categoria = ?'); valores.push(datos.categoria); }
        if (datos.stock !== undefined) { campos.push('stock = ?'); valores.push(datos.stock); }
        if (datos.descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(datos.descripcion); }
        
        // La imagen solo se actualiza si viene una nueva URL (distinta de undefined)
        if (datos.imagenUrl !== undefined) { 
            campos.push('imagenUrl = ?'); 
            valores.push(datos.imagenUrl); 
        }

        // Si no hay nada que actualizar, salimos
        if (campos.length === 0) return null;

        // Agregamos el ID al final para el WHERE
        valores.push(id);

        // Construimos la query dinámica: UPDATE productos SET nombre=?, precio=? ... WHERE id=?
        const query = `UPDATE productos SET ${campos.join(', ')} WHERE id = ?`;

        await db.execute(query, valores);
        
        return { id, ...datos };
    },

    // 5. Eliminar
    delete: async (id) => {
        const query = 'DELETE FROM productos WHERE id = ?';
        const [result] = await db.execute(query, [id]);
        return result;
    },
    
    // 6. Descontar Stock
    descontarStock: async (id, cantidad) => {
        const query = 'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?';
        const [result] = await db.execute(query, [cantidad, id, cantidad]);
        return result.affectedRows > 0;
    }
};

module.exports = Producto;