const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const databaseConnect = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth-router');
const cors = require('cors');
dotenv.config({
  path: 'server/config/config.env',
});

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api/messenger', authRouter);
app.use(cors());
const PORT = process.env.PORT || 5000;
app.get('/api', (req, res) => {
  res.send('This is from backend Sever');
});

databaseConnect();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
