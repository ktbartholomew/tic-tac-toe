module.exports = function (message) {
  try {
    return JSON.parse(message);
  } catch (e) {
    return null;
  }
};
