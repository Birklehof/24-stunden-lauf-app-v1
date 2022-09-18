const { env } = require('process');

module.exports = {
  experimental: {
    outputStandalone: true
  },
  env: {
    HOUSES: process.env.HOUSES,
    GRADES: process.env.GRADES,
    METERS_PER_LAP: process.env.METERS_PER_LAP,
    MIN_TIME_PER_LAP: process.env.MIN_TIME_PER_LAP
  }
};
