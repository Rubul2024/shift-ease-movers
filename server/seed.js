/* Seeds the database with an admin, a demo customer, serviceable areas and services.
 * Usage: npm run seed   (safe to re-run: it upserts, never duplicates)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Area = require('./models/Area');
const Service = require('./models/Service');

const areas = [
  { name: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', pincodes: ['560034', '560095'], lat: 12.9352, lng: 77.6245, vehicleTypes: ['Mini Truck', 'Tempo', 'Large Truck'], availableCabs: 12 },
  { name: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', pincodes: ['560066', '560067'], lat: 12.9698, lng: 77.75, vehicleTypes: ['Mini Truck', 'Tempo', 'Large Truck', 'Container'], availableCabs: 9 },
  { name: 'Andheri', city: 'Mumbai', state: 'Maharashtra', pincodes: ['400053', '400058', '400069'], lat: 19.1136, lng: 72.8697, vehicleTypes: ['Mini Truck', 'Tempo'], availableCabs: 8 },
  { name: 'Powai', city: 'Mumbai', state: 'Maharashtra', pincodes: ['400076'], lat: 19.1176, lng: 72.906, vehicleTypes: ['Mini Truck', 'Tempo', 'Large Truck'], availableCabs: 6 },
  { name: 'Hinjewadi', city: 'Pune', state: 'Maharashtra', pincodes: ['411057'], lat: 18.5912, lng: 73.7389, vehicleTypes: ['Mini Truck', 'Tempo', 'Large Truck'], availableCabs: 7 },
  { name: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', pincodes: ['500032'], lat: 17.44, lng: 78.3489, vehicleTypes: ['Mini Truck', 'Tempo', 'Large Truck', 'Container'], availableCabs: 10 },
  { name: 'Dwarka', city: 'New Delhi', state: 'Delhi', pincodes: ['110075', '110077'], lat: 28.5921, lng: 77.046, vehicleTypes: ['Mini Truck', 'Tempo', 'Large Truck'], availableCabs: 11 },
  { name: 'Salt Lake', city: 'Kolkata', state: 'West Bengal', pincodes: ['700091', '700064'], lat: 22.5867, lng: 88.4171, vehicleTypes: ['Mini Truck', 'Tempo'], availableCabs: 5 },
  { name: 'Velachery', city: 'Chennai', state: 'Tamil Nadu', pincodes: ['600042'], lat: 12.9815, lng: 80.218, vehicleTypes: ['Mini Truck', 'Tempo', 'Large Truck'], availableCabs: 6 },
  { name: 'Dispur', city: 'Guwahati', state: 'Assam', pincodes: ['781006'], lat: 26.1433, lng: 91.7898, vehicleTypes: ['Mini Truck', 'Tempo'], availableCabs: 4, isActive: false, notes: 'Launching next month' },
];

const services = [
  { title: 'Home Relocation', icon: 'home', startingPrice: 4999, description: 'Door-to-door shifting of 1 RK to 4 BHK homes with trained packers, bubble-wrap and careful loading.' },
  { title: 'Office Shifting', icon: 'office', startingPrice: 14999, description: 'Weekend moves for workstations, servers and files so your team is back at work on Monday.' },
  { title: 'Vehicle Transport', icon: 'car', startingPrice: 6999, description: 'Enclosed carriers for cars and bikes between cities with GPS tracking and transit insurance.' },
  { title: 'Packing & Unpacking', icon: 'box', startingPrice: 1999, description: 'Five-layer packing for fragile items, furniture dismantling and re-assembly at the new place.' },
  { title: 'Storage & Warehousing', icon: 'warehouse', startingPrice: 2499, description: 'CCTV-monitored, pest-controlled storage by the month when your new home is not ready yet.' },
  { title: 'Intercity Moves', icon: 'route', startingPrice: 9999, description: 'Dedicated or shared trucks to 120+ cities with live tracking and a fixed delivery window.' },
];

async function upsertUser({ email, ...rest }) {
  let user = await User.findOne({ email });
  if (!user) user = new User({ email, ...rest });
  else Object.assign(user, rest);
  await user.save();
  return user;
}

(async () => {
  await connectDB();

  const isProd = process.env.NODE_ENV === 'production';
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@shiftease.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  if (isProd && (!process.env.ADMIN_PASSWORD || adminPassword === 'Admin@123')) {
    throw new Error('Set a strong ADMIN_PASSWORD in the environment before seeding production.');
  }
  // Demo customer is for local development and demos only.
  const seedDemo = !isProd || process.env.SEED_DEMO_CUSTOMER === 'true';

  await upsertUser({ name: 'ShiftEase Admin', email: adminEmail, password: adminPassword, phone: '9000000000', role: 'admin' });
  if (seedDemo) {
    await upsertUser({
      name: 'Rahul Sharma',
      email: 'customer@shiftease.com',
      password: 'Customer@123',
      phone: '9876543210',
      role: 'customer',
    });
  }

  for (const a of areas) {
    await Area.findOneAndUpdate({ name: a.name, city: a.city }, a, { upsert: true, new: true, runValidators: true });
  }
  for (const s of services) {
    await Service.findOneAndUpdate({ title: s.title }, s, { upsert: true, new: true });
  }

  console.log(`Seeded: ${seedDemo ? 2 : 1} users, ${areas.length} areas, ${services.length} services`);
  console.log(`Admin    -> ${adminEmail}${isProd ? '' : ` / ${adminPassword}`}`);
  if (seedDemo) console.log('Customer -> customer@shiftease.com / Customer@123');
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
