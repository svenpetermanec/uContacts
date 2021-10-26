const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

connectDB();

app.use(express.json({ extended: false }));

const expressSwagger = require('express-swagger-generator')(app);

let options = {
  swaggerDefinition: {
    info: {
      description: 'Contacts keeper API',
      title: 'Swagger',
      version: '1.0.0',
    },
    host: 'localhost:5000',
    basePath: '/api',
    produces: ['application/json', 'application/xml'],
    schemes: ['http', 'https'],
    securityDefinitions: {
      JWT: {
        type: 'apiKey',
        in: 'header',
        name: 'x-auth-token',
        description: '',
      },
    },
  },
  basedir: __dirname,
  files: ['./routes/*.js'],
};

expressSwagger(options);

app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
