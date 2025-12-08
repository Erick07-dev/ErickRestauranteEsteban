const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  categoria: { type: String, required: true },
  stock: { type: Number, required: true },
  descripcion: { type: String, default: "" },
  imagenUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Producto", ProductoSchema);

//Este código define y exporta un modelo de Mongoose llamado "Producto", el cual representa la estructura que tendrán los documentos dentro de la colección productos en una base de datos MongoDB. Para lograrlo, primero se importa la librería mongoose, que es la herramienta más utilizada para trabajar con MongoDB en entornos Node.js, ya que permite definir esquemas, modelos y realizar operaciones de manera sencilla y estructurada.

//Posteriormente, se crea un esquema (ProductoSchema) utilizando mongoose.Schema. Este esquema actúa como una especie de "plantilla" que define qué campos debe tener cada producto y qué tipo de datos se espera en cada uno. Por ejemplo, el campo nombre debe ser una cadena de texto (String) y es obligatorio (required: true), lo que significa que no se puede crear un producto sin proporcionar ese valor. Lo mismo ocurre con precio, categoria y stock, que también son campos obligatorios y con tipos específicos. Por otro lado, descripcion es un campo opcional que por defecto estará vacío (default: "") si no se proporciona, mientras que imagenUrl se define simplemente como una cadena, sin marcarse como obligatoria, permitiendo guardar o no una URL con la imagen del producto.

//El esquema también recibe una configuración adicional { timestamps: true }, la cual le indica a Mongoose que añada automáticamente dos campos a cada documento: createdAt y updatedAt. Estos campos son útiles para llevar un control del momento en que se creó un producto y de cuándo fue modificado por última vez, algo muy común en sistemas de inventarios, tiendas en línea o cualquier aplicación en la que se registren cambios a lo largo del tiempo.

//Finalmente, el código exporta el modelo mediante mongoose.model("Producto", ProductoSchema). Esto permite que cualquier otro archivo de la aplicación pueda importar y utilizar este modelo para realizar operaciones como crear nuevos productos, buscar productos existentes, actualizarlos o eliminarlos en la base de datos. En resumen, este fragmento de código establece la base para gestionar productos de manera estructurada dentro de MongoDB utilizando Mongoose, asegurando consistencia en los datos y facilitando el manejo de la información.