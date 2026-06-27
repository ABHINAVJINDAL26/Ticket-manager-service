const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Welcome / Index Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Welcome to the Ticket System API!",
    endpoints: {
      health: "/health",
      auth: {
        register: "/auth/register",
        login: "/auth/login"
      },
      tickets: "/tickets"
    }
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
