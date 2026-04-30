const mongoose = require('mongoose');

const GaleriaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['treinamento', 'operacao', 'equipe'], required: true },
  src: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Galeria', GaleriaSchema);