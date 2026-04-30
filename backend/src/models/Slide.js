const mongoose = require('mongoose');

const SlideSchema = new mongoose.Schema({
  tagline: { type: String, default: 'Bem-vindo à' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  buttonText: { type: String, default: 'Conheça-nos' },
  buttonLink: { type: String, default: '#institucional' }
}, { timestamps: true });

module.exports = mongoose.model('Slide', SlideSchema);