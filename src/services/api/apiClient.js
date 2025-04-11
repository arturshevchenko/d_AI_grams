import { handleApiError } from '../../utils/errorHandling';

export const callAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: await response.json().catch(() => ({}))
        }
      };
    }

    return await response.json();
  } catch (error) {
    const formattedError = handleApiError(error);
    throw formattedError;
  }
};