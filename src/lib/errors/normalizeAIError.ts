export interface NormalizedAIError {
  message: string;
  isRetryable: boolean;
  code: string;
}

export function normalizeAIError(error: any): NormalizedAIError {
  const errString = error?.toString() || "";
  const errMessage = error?.message || errString;

  if (errMessage.includes("NetworkError") || errMessage.includes("Network Error") || errMessage.includes("Failed to fetch") || errMessage.includes("timed out")) {
    return {
      message: "Network connection is unstable. Please check your internet connection.",
      isRetryable: true,
      code: "NETWORK_UNSTABLE"
    };
  }

  if (errMessage.includes("429") || errMessage.includes("Too Many Requests")) {
    return {
      message: "The AI service is currently experiencing high traffic. Please wait a few moments and try again.",
      isRetryable: true,
      code: "RATE_LIMITED"
    };
  }

  if (errMessage.includes("401") || errMessage.includes("API key")) {
    return {
      message: "API authentication failed. Please check your service configuration.",
      isRetryable: false,
      code: "UNAUTHORIZED"
    };
  }

  if (errMessage.includes("Invalid JSON") || errMessage.includes("Unexpected token")) {
    return {
      message: "The AI generated an invalid response format. We're automatically retrying safely.",
      isRetryable: true,
      code: "PARSE_ERROR"
    };
  }

  if (errMessage.includes("Worker timeout") || errMessage.includes("524") || errMessage.includes("504")) {
    return {
      message: "The inference request timed out. This usually happens with complex requests.",
      isRetryable: true,
      code: "TIMEOUT"
    };
  }

  return {
    message: "An unexpected error occurred during processing. Please try again.",
    isRetryable: true,
    code: "UNKNOWN_ERROR"
  };
}
