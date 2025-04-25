const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Handle SQL errors
  if (err.code && err.code.startsWith('ECON')) {
    return res.status(503).json({ error: 'Database connection error' });
  }
  
  // Generic error
  res.status(500).json({ error: 'Server error occurred' });
};

module.exports = errorHandler;
