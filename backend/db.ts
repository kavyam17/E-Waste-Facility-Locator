import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    credits INTEGER DEFAULT 0,
    totalDisposed REAL DEFAULT 0,
    rank INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    distance TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    acceptedItems TEXT NOT NULL, -- JSON string
    hours TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rewards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cost INTEGER NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_rewards (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    rewardId TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (rewardId) REFERENCES rewards(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS disposal_history (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    facilityId TEXT NOT NULL,
    itemName TEXT NOT NULL,
    category TEXT NOT NULL,
    weight REAL NOT NULL,
    creditsEarned INTEGER NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    proofUrl TEXT,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (facilityId) REFERENCES facilities(id)
  );
`);

// Seed initial data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  // Add an admin
  db.prepare('INSERT INTO users (id, name, email, password, role, credits) VALUES (?, ?, ?, ?, ?, ?)')
    .run('admin-1', 'Admin User', 'admin@ecocycle.com', 'admin123', 'admin', 0);
  
  // Add a test user
  db.prepare('INSERT INTO users (id, name, email, password, role, credits) VALUES (?, ?, ?, ?, ?, ?)')
    .run('user-1', 'Test User', 'user@example.com', 'user123', 'user', 500);
}

const facilityCount = db.prepare('SELECT COUNT(*) as count FROM facilities').get() as { count: number };
if (facilityCount.count === 0) {
  const mockFacilities = [
    {
      id: "F001",
      name: "Green E-Waste Center",
      address: "123 Eco St",
      city: "Chennai",
      phone: "+91 98765 43210",
      distance: "2.5 km",
      lat: 13.0827,
      lng: 80.2707,
      acceptedItems: JSON.stringify(["Mobile", "Laptop", "Battery"]),
      hours: "9 AM - 6 PM"
    },
    {
      id: "F002",
      name: "Tech Recycle Hub",
      address: "45 Digital Way",
      city: "Bangalore",
      phone: "+91 98765 43211",
      distance: "4.2 km",
      lat: 12.9716,
      lng: 77.5946,
      acceptedItems: JSON.stringify(["Monitor", "CPU", "Printer"]),
      hours: "10 AM - 7 PM"
    }
  ];

  const insertFacility = db.prepare('INSERT INTO facilities (id, name, address, city, phone, distance, lat, lng, acceptedItems, hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  mockFacilities.forEach(f => {
    insertFacility.run(f.id, f.name, f.address, f.city, f.phone, f.distance, f.lat, f.lng, f.acceptedItems, f.hours);
  });
}

const rewardCount = db.prepare('SELECT COUNT(*) as count FROM rewards').get() as { count: number };
if (rewardCount.count === 0) {
  const mockRewards = [
    { id: 'r1', name: 'Amazon Voucher', cost: 500, type: 'Voucher', description: '₹500 Amazon Gift Card' },
    { id: 'r2', name: 'Eco-friendly Bottle', cost: 300, type: 'Product', description: 'Stainless steel water bottle' }
  ];

  const insertReward = db.prepare('INSERT INTO rewards (id, name, cost, type, description) VALUES (?, ?, ?, ?, ?)');
  mockRewards.forEach(r => {
    insertReward.run(r.id, r.name, r.cost, r.type, r.description);
  });
}

export default db;
