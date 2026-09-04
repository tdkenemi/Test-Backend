const mongoose = require('mongoose');

// ───────────────────────────────────────────────
//  User Model
// ───────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email la bat buoc'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password la bat buoc'],
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

// ───────────────────────────────────────────────
//  Product Model
// ───────────────────────────────────────────────
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

const Product = mongoose.model('Product', productSchema);

module.exports = { User, Product };
