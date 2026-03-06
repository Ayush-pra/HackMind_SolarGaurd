import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import inverterRoutes from './routes/inverterRoutes.js';
import inverterAnalyticsRoutes from './routes/inverterAnalyticsRoutes.js';
import plantInverterRoutes from './routes/plantInverterRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import copilotRoutes from './routes/copilotRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
  })
);
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/plants', plantInverterRoutes);
app.use('/api/inverters', inverterRoutes);
app.use('/api/inverter', inverterAnalyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/copilot', copilotRoutes);

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Solar API is running' });
});

// ─── Error handler (must be after routes) ───────────────────────────────────────
app.use(errorMiddleware);

// ─── Start server ───────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};
startServer();
