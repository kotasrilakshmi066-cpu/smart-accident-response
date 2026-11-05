const Database = require("better-sqlite3");
const db = new Database("emergency.db");
db.pragma("journal_mode=WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS accidents(
 id INTEGER PRIMARY KEY AUTOINCREMENT, latitude REAL NOT NULL, longitude REAL NOT NULL,
 description TEXT, severity TEXT, verification_status TEXT, verification_score INTEGER,
 confirmations INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS vehicles(
 id INTEGER PRIMARY KEY AUTOINCREMENT, vehicle_number TEXT NOT NULL, type TEXT NOT NULL,
 latitude REAL NOT NULL, longitude REAL NOT NULL, status TEXT NOT NULL DEFAULT 'Available'
);
CREATE TABLE IF NOT EXISTS hospitals(
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, latitude REAL NOT NULL,
 longitude REAL NOT NULL, emergency_available INTEGER DEFAULT 1, phone TEXT
);
CREATE TABLE IF NOT EXISTS dispatches(
 id INTEGER PRIMARY KEY AUTOINCREMENT, accident_id INTEGER NOT NULL, vehicle_id INTEGER NOT NULL,
 distance_km REAL, eta_min INTEGER, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`);

if (db.prepare("SELECT COUNT(*) c FROM vehicles").get().c === 0) {
  const ins=db.prepare("INSERT INTO vehicles(vehicle_number,type,latitude,longitude,status) VALUES(?,?,?,?,?)");
  const seed=db.transaction(()=>[
    ["AP-AMB-101","Ambulance",15.8230,80.3510,"Available"],
    ["AP-AMB-102","Ambulance",15.8265,80.3490,"Available"],
    ["AP-FIRE-201","Fire Engine",15.8200,80.3550,"Available"],
    ["AP-POL-301","Police",15.8250,80.3570,"Available"],
    ["AP-POL-302","Police",15.8185,80.3470,"Available"]
  ].forEach(x=>ins.run(...x)));
  seed();
}
if (db.prepare("SELECT COUNT(*) c FROM hospitals").get().c === 0) {
  const ins=db.prepare("INSERT INTO hospitals(name,latitude,longitude,emergency_available,phone) VALUES(?,?,?,?,?)");
  const seed=db.transaction(()=>[
    ["Government General Hospital (Demo)",15.8285,80.3505,1,"108"],
    ["City Care Hospital (Demo)",15.8175,80.3535,1,"08643-000000"],
    ["LifeLine Emergency Hospital (Demo)",15.8310,80.3600,1,"08643-111111"]
  ].forEach(x=>ins.run(...x)));
  seed();
}
module.exports=db;