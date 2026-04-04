import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool, query } from "./db.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-secret";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "12mb" }));

function rowToRentalObject(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    pricePerDay: Number(row.price_per_day),
    image: row.image_url,
    condition: row.condition,
    description: row.description,
    owner: {
      name: row.owner_name,
      phone: row.owner_phone,
      address: row.owner_address,
      coordinates: { lat: Number(row.owner_lat), lng: Number(row.owner_lng) },
    },
    available: row.available,
    depositAmount: Number(row.deposit_amount),
    rating: Number(row.rating),
  };
}

function rowToTransaction(row) {
  return {
    id: row.order_id,
    objectName: row.object_name,
    objectId: row.object_id,
    amount: Number(row.total_amount),
    duration: row.duration_days,
    startDate: row.start_date,
    endDate: row.end_date,
    depositAmount: Number(row.deposit_amount ?? 0),
    includesDeposit: Boolean(row.includes_deposit),
    timestamp: row.created_at?.toISOString?.() ?? row.created_at,
    status: row.order_status,
  };
}

function rowToDeposit(row) {
  return {
    id: row.id,
    objectName: row.object_name,
    amount: Number(row.amount),
    paidDate: row.paid_date?.toISOString?.() ?? row.paid_date,
    returnDate: row.return_date
      ? row.return_date.toISOString?.() ?? row.return_date
      : undefined,
    status: row.status,
  };
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

async function getAccountByUsername(username) {
  const { rows } = await query(
    `SELECT id, username, email, password_hash FROM user_orders
     WHERE username = $1 AND order_id IS NULL`,
    [username]
  );
  return rows[0] ?? null;
}

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body ?? {};
    if (!username?.trim() || !email?.trim() || !password) {
      res.status(400).json({ error: "username, email, and password required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }
    const exists = await getAccountByUsername(username.trim());
    if (exists) {
      res.status(409).json({ error: "Username already exists" });
      return;
    }
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO user_orders (username, email, password_hash, order_id)
       VALUES ($1, $2, $3, NULL)
       RETURNING id, username, email, created_at`,
      [username.trim(), email.trim(), password_hash]
    );
    const user = rows[0];
    const token = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (e) {
    if (e.code === "23505") {
      res.status(409).json({ error: "Username or email already exists" });
      return;
    }
    console.error(e);
    res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username?.trim() || !password) {
      res.status(400).json({ error: "username and password required" });
      return;
    }
    const account = await getAccountByUsername(username.trim());
    if (!account || !(await bcrypt.compare(password, account.password_hash))) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const token = jwt.sign(
      { sub: account.id, username: account.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: account.id,
        username: account.username,
        email: account.email,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/rental-objects", async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM rental_objects ORDER BY name ASC`
    );
    res.json(rows.map(rowToRentalObject));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load rental objects" });
  }
});

app.post("/api/rental-objects", authMiddleware, async (req, res) => {
  try {
    const o = req.body ?? {};
    const id = String(o.id ?? Date.now());
    const owner = o.owner ?? {};
    const coords = owner.coordinates ?? {};
    await query(
      `INSERT INTO rental_objects (
        id, name, category, price_per_day, image_url, condition, description,
        owner_name, owner_phone, owner_address, owner_lat, owner_lng,
        available, deposit_amount, rating
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        price_per_day = EXCLUDED.price_per_day,
        image_url = EXCLUDED.image_url,
        condition = EXCLUDED.condition,
        description = EXCLUDED.description,
        owner_name = EXCLUDED.owner_name,
        owner_phone = EXCLUDED.owner_phone,
        owner_address = EXCLUDED.owner_address,
        owner_lat = EXCLUDED.owner_lat,
        owner_lng = EXCLUDED.owner_lng,
        available = EXCLUDED.available,
        deposit_amount = EXCLUDED.deposit_amount,
        rating = EXCLUDED.rating`,
      [
        id,
        o.name,
        o.category,
        o.pricePerDay,
        o.image ?? o.imageUrl ?? "",
        o.condition,
        o.description ?? "",
        owner.name ?? "",
        owner.phone ?? "",
        owner.address ?? "",
        coords.lat ?? 0,
        coords.lng ?? 0,
        o.available !== false,
        o.depositAmount ?? 0,
        o.rating ?? 0,
      ]
    );
    const { rows } = await query(`SELECT * FROM rental_objects WHERE id = $1`, [
      id,
    ]);
    res.status(201).json(rowToRentalObject(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save rental object" });
  }
});

app.patch("/api/rental-objects/:id/availability", authMiddleware, async (req, res) => {
  try {
    const { available } = req.body ?? {};
    await query(
      `UPDATE rental_objects SET available = $1 WHERE id = $2`,
      [Boolean(available), req.params.id]
    );
    const { rows } = await query(`SELECT * FROM rental_objects WHERE id = $1`, [
      req.params.id,
    ]);
    if (!rows[0]) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(rowToRentalObject(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update availability" });
  }
});

app.post("/api/bookings", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const u = req.user.username;
    const account = await getAccountByUsername(u);
    if (!account) {
      res.status(401).json({ error: "Account not found" });
      return;
    }

    const {
      objectId,
      objectName,
      amount,
      duration,
      startDate,
      endDate,
      depositAmount,
      includesDeposit,
      pricePerDay,
    } = req.body ?? {};

    if (
      !objectId ||
      !objectName ||
      amount == null ||
      duration == null ||
      !startDate ||
      !endDate
    ) {
      res.status(400).json({ error: "Missing booking fields" });
      return;
    }

    const orderId = `TXN-${Date.now()}`;
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO user_orders (
        username, email, password_hash, order_id, object_id, object_name,
        total_amount, price_per_day, duration_days, start_date, end_date,
        deposit_amount, includes_deposit, order_status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::date,$11::date,$12,$13,$14)`,
      [
        account.username,
        account.email,
        account.password_hash,
        orderId,
        objectId,
        objectName,
        amount,
        pricePerDay ?? null,
        duration,
        startDate,
        endDate,
        depositAmount ?? 0,
        Boolean(includesDeposit),
        "active",
      ]
    );

    await client.query(
      `UPDATE rental_objects SET available = FALSE WHERE id = $1`,
      [objectId]
    );

    if (includesDeposit) {
      const depId = `DEP-${Date.now()}`;
      await client.query(
        `INSERT INTO deposit_records (id, username, rental_object_id, object_name, amount, status)
         VALUES ($1, $2, $3, $4, $5, 'held')`,
        [depId, account.username, objectId, objectName, depositAmount ?? 0]
      );
    }

    await client.query("COMMIT");

    const { rows } = await query(
      `SELECT order_id, object_id, object_name, total_amount, price_per_day,
              duration_days, start_date, end_date, deposit_amount, includes_deposit,
              order_status, created_at
       FROM user_orders WHERE order_id = $1`,
      [orderId]
    );
    res.status(201).json({ transaction: rowToTransaction(rows[0]) });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(e);
    res.status(500).json({ error: "Booking failed" });
  } finally {
    client.release();
  }
});

app.get("/api/me/dashboard", authMiddleware, async (req, res) => {
  try {
    const u = req.user.username;
    const { rows: orderRows } = await query(
      `SELECT order_id, object_id, object_name, total_amount, price_per_day,
              duration_days, start_date, end_date, deposit_amount, includes_deposit,
              order_status, created_at
       FROM user_orders
       WHERE username = $1 AND order_id IS NOT NULL
       ORDER BY created_at DESC`,
      [u]
    );
    const { rows: depRows } = await query(
      `SELECT id, object_name, amount, paid_date, return_date, status
       FROM deposit_records WHERE username = $1 ORDER BY paid_date DESC`,
      [u]
    );
    res.json({
      transactions: orderRows.map(rowToTransaction),
      deposits: depRows.map(rowToDeposit),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

app.patch("/api/deposits/:id/return", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const u = req.user.username;
    await client.query("BEGIN");

    const { rows } = await client.query(
      `UPDATE deposit_records
       SET status = 'returned', return_date = NOW()
       WHERE id = $1 AND username = $2 AND status = 'held'
       RETURNING rental_object_id, object_name`,
      [req.params.id, u]
    );
    if (!rows[0]) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Deposit not found" });
      return;
    }

    const { rental_object_id, object_name } = rows[0];
    if (rental_object_id) {
      await client.query(
        `UPDATE rental_objects SET available = TRUE WHERE id = $1`,
        [rental_object_id]
      );
    } else {
      await client.query(
        `UPDATE rental_objects SET available = TRUE WHERE name = $1`,
        [object_name]
      );
    }

    await client.query("COMMIT");
    const { rows: depRows } = await query(
      `SELECT id, object_name, amount, paid_date, return_date, status
       FROM deposit_records WHERE id = $1`,
      [req.params.id]
    );
    res.json(rowToDeposit(depRows[0]));
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(e);
    res.status(500).json({ error: "Failed to return deposit" });
  } finally {
    client.release();
  }
});

app.post("/api/damage-reports", authMiddleware, async (req, res) => {
  try {
    const { objectName, damageDescription, estimatedCost, photoUrl } =
      req.body ?? {};
    if (!objectName?.trim() || !damageDescription?.trim()) {
      res.status(400).json({ error: "objectName and damageDescription required" });
      return;
    }
    const id = `REPORT-${Date.now()}`;
    await query(
      `INSERT INTO damage_reports (
        id, username, object_name, damage_description, estimated_cost, photo_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
      [
        id,
        req.user.username,
        objectName.trim(),
        damageDescription.trim(),
        estimatedCost ?? 0,
        photoUrl || null,
      ]
    );
    res.status(201).json({
      id,
      objectName,
      userName: req.user.username,
      damageDescription,
      estimatedCost: estimatedCost ?? 0,
      reportDate: new Date().toISOString(),
      photoUrl: photoUrl || undefined,
      status: "pending",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to submit damage report" });
  }
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const account = await getAccountByUsername(req.user.username);
    if (!account) {
      res.status(401).json({ error: "Not found" });
      return;
    }
    res.json({
      user: {
        id: account.id,
        username: account.username,
        email: account.email,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});