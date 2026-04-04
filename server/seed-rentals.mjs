import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const samples = [
  {
    id: "1",
    name: "NCERT Physics Textbook Class 12",
    category: "books",
    price_per_day: 15,
    image_url:
      "https://images.unsplash.com/photo-1589998059171-988d887df646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    condition: "excellent",
    description: "NCERT Physics textbook Class 12.",
    owner_name: "Rajesh Kumar",
    owner_phone: "+91 98765 43210",
    owner_address: "123 MG Road, Bangalore, Karnataka 560001",
    owner_lat: 12.9716,
    owner_lng: 77.5946,
    available: true,
    deposit_amount: 100,
    rating: 4.8,
  },
  {
    id: "2",
    name: "Scientific Calculator Casio FX-991EX",
    category: "equipment",
    price_per_day: 20,
    image_url:
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=1080",
    condition: "excellent",
    description: "Scientific calculator with advanced functions.",
    owner_name: "Priya Sharma",
    owner_phone: "+91 87654 32109",
    owner_address: "456 Nehru Place, New Delhi, Delhi 110019",
    owner_lat: 28.6139,
    owner_lng: 77.209,
    available: true,
    deposit_amount: 150,
    rating: 4.9,
  },
];

async function main() {
  for (const r of samples) {
    await pool.query(
      `INSERT INTO rental_objects (
        id, name, category, price_per_day, image_url, condition, description,
        owner_name, owner_phone, owner_address, owner_lat, owner_lng,
        available, deposit_amount, rating
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      ON CONFLICT (id) DO NOTHING`,
      [
        r.id,
        r.name,
        r.category,
        r.price_per_day,
        r.image_url,
        r.condition,
        r.description,
        r.owner_name,
        r.owner_phone,
        r.owner_address,
        r.owner_lat,
        r.owner_lng,
        r.available,
        r.deposit_amount,
        r.rating,
      ]
    );
  }
  console.log("Seed complete (sample rows inserted if missing).");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
