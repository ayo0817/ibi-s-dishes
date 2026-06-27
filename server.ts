import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { z } from "zod";
import { db } from "./src/db/index.js";
import { orders as dbOrders, users as dbUsers } from "./src/db/schema.js";
import { desc, eq } from "drizzle-orm";
import { dishes, drinks } from "./src/data.js";

const app = express();
app.set("trust proxy", 1);
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("Missing JWT_SECRET environment variable.");
  process.exit(1);
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// 1. Rate Limiting (Global API limits & stricter Auth limits)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: "Too many requests from this IP, please try again later." },
});
app.use("/api/", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 login/register attempts per hour
  message: { error: "Too many authentication attempts, please try again later." },
});

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 orders per hour
  message: { error: "Too many orders placed, please try again later." },
});

const proofLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 proof uploads per hour
  message: { error: "Too many upload attempts, please try again later." },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 contact messages per hour
  message: { error: "Too many contact requests, please try again later." },
});

// Removed mock databases


// 2. Input Validation Schemas (Zod)
import xss from "xss";

const noHtmlRegex = /^[^<>]*$/;

// Helper to sanitize strings
const sanitizeString = (val: string) => xss(val.trim());

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username is too long").regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores").transform(sanitizeString),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long"),
  role: z.enum(["user", "admin"]).default("user"),
});

const loginSchema = z.object({
  username: z.string().transform(sanitizeString),
  password: z.string(),
});

const orderSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100, "Name is too long").regex(/^[a-zA-Z\s\-']+$/, "Name contains invalid characters").transform(sanitizeString),
  phone: z.string().min(10, "Phone number is too short").max(15, "Phone number is too long").regex(/^\+?[0-9\s\-]+$/, "Phone number contains invalid characters").transform(sanitizeString),
  address: z.string().min(5, "Address is too short").max(255, "Address is too long").regex(noHtmlRegex, "Address contains invalid HTML characters").transform(sanitizeString),
  landmark: z.string().max(255, "Landmark is too long").regex(noHtmlRegex, "Landmark contains invalid HTML characters").optional().or(z.literal('')).transform(val => val ? sanitizeString(val) : val),
  notes: z.string().max(500, "Notes are too long").regex(noHtmlRegex, "Notes contain invalid HTML characters").optional().or(z.literal('')).transform(val => val ? sanitizeString(val) : val),
  items: z.array(z.object({
    id: z.string().transform(sanitizeString),
    name: z.string().transform(sanitizeString),
    price: z.number().positive(),
    quantity: z.number().positive(),
    description: z.string().optional().transform(val => val ? sanitizeString(val) : val),
    image: z.string().optional().transform(val => val ? sanitizeString(val) : val),
    category: z.string().optional().transform(val => val ? sanitizeString(val) : val)
  })),
  total: z.number().positive(),
});

const contactSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100, "Name is too long").transform(sanitizeString),
  email: z.string().email("Invalid email address").transform(sanitizeString),
  message: z.string().min(10, "Message is too short").max(1000, "Message is too long").transform(sanitizeString),
});

// Validation Middleware
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input", details: error.issues });
      } else {
        res.status(400).json({ error: "Invalid input" });
      }
    }
  };
};

// 3. Secure Authentication & Role-Based Access Control Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.auth_token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    (req as any).user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token." });
  }
};

const requireRole = (role: "admin" | "user") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || user.role !== role) {
      res.status(403).json({ error: `Access denied. Requires ${role} role.` });
      return;
    }
    next();
  };
};

// --- API Routes ---

// Register Route (Includes Password Hashing)
app.post("/api/auth/register", authLimiter, validateRequest(registerSchema), async (req, res) => {
  const { username, password } = req.body;
  
  const existingUser = await db.select().from(dbUsers).where(eq(dbUsers.username, username));
  if (existingUser.length > 0) {
    return res.status(400).json({ error: "Username already exists" });
  }

  // 4. Password Hashing (bcrypt)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await db.insert(dbUsers).values({
    username,
    password: hashedPassword,
    role: "user",
  });
  
  res.status(201).json({ message: "User registered successfully" });
});

// Login Route
app.post("/api/auth/login", authLimiter, validateRequest(loginSchema), async (req, res) => {
  const { username, password } = req.body;
  
  const users = await db.select().from(dbUsers).where(eq(dbUsers.username, username));
  const user = users[0];
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Compare hashed password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  // Generate JWT Token
  const token = jwt.sign({ id: user.id.toString(), username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: "1h"
  });

  // Set HTTP-only cookie for secure authentication
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000 // 1 hour
  });

  res.json({ message: "Logged in successfully", token, user: { username: user.username, role: user.role } });
});

// Logout Route
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({ message: "Logged out successfully" });
});

// Get Current User (Protected)
app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({ user: (req as any).user });
});

// Submit Order (Protected, User or Admin)
app.post("/api/orders", authenticateToken, orderLimiter, validateRequest(orderSchema), async (req, res) => {
  try {
    const allItems = [...dishes, ...drinks];
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of req.body.items as any[]) {
      const menuData = allItems.find(m => m.id === item.id);
      if (!menuData) {
        return res.status(400).json({ error: `Invalid item found in order: ${item.name || item.id}` });
      }

      calculatedTotal += menuData.price * item.quantity;

      validatedItems.push({
        ...item,
        price: menuData.price, // Override with server price
        name: menuData.name,   // Override with server name
      });
    }

    const orderValues = {
      userId: (req as any).user.id,
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      landmark: req.body.landmark,
      notes: req.body.notes || null,
      items: validatedItems,
      total: calculatedTotal,
      status: "pending",
    };
    
    const [insertedOrder] = await db.insert(dbOrders).values(orderValues).returning();
    res.status(201).json({ message: "Order placed successfully", orderId: insertedOrder.id, order: insertedOrder });
  } catch (err: any) {
    console.error("Error saving order:", err);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// Upload Payment Proof (Protected)
app.post("/api/orders/:id/proof", authenticateToken, proofLimiter, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    const { proofBase64 } = req.body;
    if (!proofBase64 || typeof proofBase64 !== 'string') {
      return res.status(400).json({ error: "Missing or invalid payment proof" });
    }

    // Basic format validation
    const match = proofBase64.match(/^data:(image\/jpeg|image\/png|application\/pdf);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: "Invalid file format. Only JPG, PNG, and PDF are allowed." });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    // Decode to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // 1. Check size (5MB max)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds 5MB limit" });
    }

    // 2. Check magic bytes
    const isJPEG = buffer.length > 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    const isPNG = buffer.length > 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 && buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A;
    const isPDF = buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF

    if (!isJPEG && !isPNG && !isPDF) {
       return res.status(400).json({ error: "Invalid file content. Must be a real JPG, PNG, or PDF." });
    }

    // Prevent mismatch between mimetype and actual content
    if (mimeType === 'image/jpeg' && !isJPEG) return res.status(400).json({ error: "Invalid JPEG" });
    if (mimeType === 'image/png' && !isPNG) return res.status(400).json({ error: "Invalid PNG" });
    if (mimeType === 'application/pdf' && !isPDF) return res.status(400).json({ error: "Invalid PDF" });

    // Update order with proof
    const updatedOrder = await db.update(dbOrders)
      .set({ paymentProof: proofBase64 })
      .where(eq(dbOrders.id, orderId))
      .returning();

    if (updatedOrder.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Payment proof uploaded successfully" });
  } catch (err: any) {
    console.error("Error saving payment proof:", err);
    res.status(500).json({ error: "Failed to save payment proof" });
  }
});

// Contact Form Endpoint
app.post("/api/contact", contactLimiter, validateRequest(contactSchema), async (req, res) => {
  try {
    // In a real application, this would send an email or save to a database.
    // For now, we'll just log it and return success.
    console.log("Contact form submission:", req.body);
    res.json({ message: "Message sent successfully" });
  } catch (err: any) {
    console.error("Error processing contact form:", err);
    res.status(500).json({ error: "Failed to process message" });
  }
});

// Get All Orders (Admin Only - RBAC)
app.get("/api/admin/orders", authenticateToken, requireRole("admin"), async (req, res) => {
  try {
    const allOrders = await db.select().from(dbOrders).orderBy(desc(dbOrders.createdAt));
    res.json(allOrders);
  } catch (err: any) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// --- Vite & Static File Serving ---
async function setupAdminUser() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.log("ADMIN_USERNAME or ADMIN_PASSWORD not set. Skipping default admin creation.");
      return;
    }
    
    const existingAdmin = await db.select().from(dbUsers).where(eq(dbUsers.username, adminUsername));
    if (existingAdmin.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await db.insert(dbUsers).values({
        username: adminUsername,
        password: hashedPassword,
        role: "admin",
      });
      console.log("Default admin user created.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (err) {
    console.error("Failed to setup admin user:", err);
  }
}

async function startServer() {
  await setupAdminUser();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
