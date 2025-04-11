export const handleApiError = (error) => {
    // Log error details for debugging
    console.error('API Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with an error status
      return {
        type: 'SERVER_ERROR',
        message: error.response.data.message || 'Server error occurred',
        statusCode: error.response.status,
        details: error.response.data
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        type: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        details: error.request
      };
    } else {
      // Something else happened while setting up the request
      return {
        type: 'CLIENT_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: error
      };
    }
  };