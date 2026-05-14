interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  backoffMs?: number;
}

export class NetworkError extends Error {
  public status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
  }
}

export async function safeFetch<T>(url: string, options: SafeFetchOptions = {}): Promise<T> {
  const { timeoutMs = 10000, retries = 2, backoffMs = 1000, ...fetchOptions } = options;
  let attempt = 0;

  while (attempt <= retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {})
      };

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal as AbortSignal,
      });

      clearTimeout(id);

      if (!response.ok) {
        throw new NetworkError(`HTTP error! status: ${response.status}`, response.status);
      }

      // Check if there is content to parse
      const text = await response.text();
      try {
        return text ? JSON.parse(text) : ({} as T);
      } catch (e) {
        throw new Error("Invalid JSON response from server.");
      }
    } catch (error: any) {
      clearTimeout(id);
      attempt++;

      if (error.name === 'AbortError') {
        if (attempt > retries) {
          throw new NetworkError("Request timed out.", 408);
        }
      } else if (attempt > retries) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, backoffMs * Math.pow(2, attempt - 1)));
    }
  }

  throw new Error("safeFetch failed unexpectedly");
}
