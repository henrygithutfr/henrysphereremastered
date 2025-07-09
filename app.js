// app.js
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const path = require('path');
const compression = require('compression');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const indexRouter = require('./routes/index')
const blogsRouter = require('./routes/blogs')
const portfolioRoute = require('./routes/portfolio');
const aboutRoute = require('./routes/about');
const coursesRoute = require('./routes/courses');
const contentRoute = require('./routes/content');
const contactRoute = require('./routes/contact');
const ppRoute = require('./routes/pp');

const app = express();

app.set('view engine', 'ejs');
app.set('layout', './layouts/main')

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.use(expressLayouts)

// Home route
app.use('/', indexRouter)
app.use('/blogs', blogsRouter)
app.use('/portfolio', portfolioRoute);
app.use('/about', aboutRoute);
app.use('/courses', coursesRoute);
app.use('/content', contentRoute);
app.use('/contact', contactRoute);
app.use('/privacy-policy', ppRoute);

app.get('/sitemap.xml', function (req, res) {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('X-Robots-Tag', 'all');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.use(compression());
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.disable('x-powered-by');

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});