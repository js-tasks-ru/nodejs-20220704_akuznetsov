function sum(a, b) {
  try {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new TypeError('Both arguments must be numbers');
    }
    return a + b;
  } finally {
    console.log('done');
  }
}

module.exports = sum;
