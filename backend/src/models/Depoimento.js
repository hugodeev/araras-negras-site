const mongoose = require('mongoose');

const DepoimentoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Depoimento', DepoimentoSchema);