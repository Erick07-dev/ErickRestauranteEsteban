const mongoose = require("mongoose");

const OrdenSchema = new mongoose.Schema({
  productos: [
    {
      id: String,
      nombre: String,
      precio: Number,
      cantidad: Number,
      ingredientes: String
    }
  ],
  total: Number,
  mesaId: Number,   
  mesero: String,
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Orden", OrdenSchema);
