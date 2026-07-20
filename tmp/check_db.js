const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const OrderSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  itemType: String,
  itemId: String,
  amount: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");
  const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
  console.log("Latest 5 orders:", orders);
  await mongoose.disconnect();
}

run().catch(console.error);
