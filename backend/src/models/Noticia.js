const mongoose = require('mongoose');

const NoticiaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['treinamento', 'evento', 'operacao'], default: 'treinamento' },
  image: { type: String, default: '' },
  date: { type: String, default: () => new Date().toLocaleDateString('pt-BR') },
  author: { type: String, default: 'Equipe Araras Negras' }
}, { timestamps: true });

module.exports = mongoose.model('Noticia', NoticiaSchema);