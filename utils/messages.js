const moment = require('moment-timezone')

formatMessage = (username, text) => {
  return {
    username,
    text
  }
}

module.exports = formatMessage