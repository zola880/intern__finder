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
    if (typeof mod === 'function' || (mod && typeof mod === 'object')) {
      console.log(`✓ ${moduleName} loaded successfully`);
      return mod;
    } else {
      console.warn(`⚠️ ${moduleName} is not a valid router (type: ${typeof mod})`);
      const dummyRouter = express.Router();
      dummyRouter.use((req, res) => res.status(501).json({ error: `${moduleName} not implemented` }));
      return dummyRouter;
    }
  } catch (err) {
    console.error(`✗ Failed to load ${moduleName}:`, err.message);
    const dummyRouter = express.Router();
    dummyRouter.use((req, res) => res.status(501).json({ error: `${moduleName} not available` }));
    return dummyRouter;
  }

  // fallback router
  const dummyRouter = express.Router();
  dummyRouter.use((req, res) => {
    res.status(501).json({ error: `${moduleName} not available` });
  });
  return dummyRouter;
}

// Import routes
const authRoutes = safeRequire('./routes/authRoutes', 'authRoutes');
const profileRoutes = safeRequire('./routes/profileRoutes', 'profileRoutes');
const internshipRoutes = safeRequire('./routes/internshipRoutes', 'internshipRoutes');
const savedRoutes = safeRequire('./routes/savedRoutes', 'savedRoutes');
const announcementRoutes = safeRequire('./routes/announcementRoutes', 'announcementRoutes');
const aiRoutes = safeRequire('./routes/aiRoutes', 'aiRoutes');
const adminApplicationRoutes = require('./routes/adminApplicationRoutes');
// ...



// ========== CORS (must be before routes) ==========
app.use(cors({ origin: true, credentials: true }));
// ==================================================

// ========== Custom Helmet CSP for development ==========
// Allows 'unsafe-eval' for React DevTools and other dev tools
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
    },
  },
}));
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


// ✅ RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin-applications', adminApplicationRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ✅ HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});


// ✅ DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


// ✅ START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));