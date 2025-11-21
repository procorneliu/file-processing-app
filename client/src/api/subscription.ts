import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/subscription';

// Configure axios to send credentials (cookies) with all requests
axios.defaults.withCredentials = true;

export type ActivateSubscriptionResponse = {
  checkoutUrl: string;
  sessionId: string;
};

export type CancelSubscriptionResponse = {
  message: string;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    const message = error.response.data.message;
    return Array.isArray(message) ? message.join(', ') : message;
  }
  return error instanceof Error ? error.message : 'An error occurred';
}

export async function activateSubscription(): Promise<ActivateSubscriptionResponse> {
  try {
    const response = await axios.post<ActivateSubscriptionResponse>(
      `${API_BASE}/activate`,
      {},
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function cancelSubscription(): Promise<CancelSubscriptionResponse> {
  const response = await axios.post<CancelSubscriptionResponse>(
    `${API_BASE}/cancel`,
    {},
    {
      withCredentials: true,
    },
  );
  return response.data;
}
