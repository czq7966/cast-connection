'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/cjs/adhoc-cast-connection.min.js');
} else {
  module.exports = require('./dist/cjs/adhoc-cast-connection.min.js');
}
