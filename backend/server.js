require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ✅ SAFE REQUIRE FUNCTION
function safeRequire(modulePath, moduleName) {
  try {
    const mod = require(modulePath);
    if (typeof mod === 'function' || typeof mod === 'object') {
      console.log(`✓ ${moduleName} loaded`);
      return mod;
    } else {
      throw new Error("Invalid router");
    }
  } catch (err) {
    console.error(`✗ ${moduleName} failed:`, err.message);
    const router = express.Router();
    router.use((req, res) =>
      res.status(500).json({ error: `${moduleName} not available` })
    );
    return router;
  }
}

// ✅ IMPORT ROUTES
const authRoutes = safeRequire('./routes/authRoutes', 'authRoutes');
const profileRoutes = safeRequire('./routes/profileRoutes', 'profileRoutes');
const internshipRoutes = safeRequire('./routes/internshipRoutes', 'internshipRoutes');
const savedRoutes = safeRequire('./routes/savedRoutes', 'savedRoutes');
const announcementRoutes = safeRequire('./routes/announcementRoutes', 'announcementRoutes');
const aiRoutes = safeRequire('./routes/aiRoutes', 'aiRoutes');
const adminApplicationRoutes = safeRequire('./routes/adminApplicationRoutes', 'adminApplicationRoutes');

// ✅ CORS – allow localhost + any Vercel preview deployment
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  /\.vercel\.app$/,   // matches any Vercel preview (e.g., project-xxx.vercel.app)
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(pattern =>
      typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// ✅ HELMET (simplified for Render)
app.use(helmet());

// ✅ BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ STATIC FILES (for uploaded acceptance letters)
app.use('/uploads', express.static('uploads'));

// ✅ RATE LIMITING
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

// ✅ ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin-applications', adminApplicationRoutes);

// ✅ HEALTH CHECKS
app.get('/', (req, res) => res.send('API is running...'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ✅ DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));