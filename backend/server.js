import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import subjectsRouter    from './routes/subjects.js';
import attendanceRouter  from './routes/attendance.js';
import timetableRouter   from './routes/timetable.js';
import settingsRouter    from './routes/settings.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use('/api/subjects',   subjectsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/timetable',  timetableRouter);
app.use('/api/settings',   settingsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Let'sBunk API running on http://localhost:${PORT}`);
});
