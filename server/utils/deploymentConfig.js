const deploymentConfig = {
  port: process.env.PORT || 5000,
  environment: process.env.NODE_ENV || 'development',
  apiEndpoint: '/api',
  clientUrl: 'http://localhost:3000',
  serverUrl: 'http://localhost:5000',
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/animeDB',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  errorHandling: {
    errorHandler: (err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    },
    notFoundHandler: (req, res, next) => {
      res.status(404).send('Not Found!');
    },
  },
};

module.exports = deploymentConfig;