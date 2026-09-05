const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'out_of_stock', 'discontinued'],
        message: "Status phai la 'available', 'out_of_stock' hoac 'discontinued'",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
