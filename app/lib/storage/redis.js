var redis = require('redis');

module.exports = {
  getClient: function () {
    return redis.createClient({
      host: process.env.REDIS_HOST || 'redis'
    });
  }
};
