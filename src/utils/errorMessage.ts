import axios from "axios";
import { ZodError } from "zod";

const technicalMessages: Record<string, string> = {
  "Network Error": "Unable to connect to the server. Check your internet connection and try again.",
  ECONNABORTED: "The request took too long. Please try again.",
  ERR_NETWORK: "Unable to connect to the server. Check your internet connection and try again.",
};

const getResponseMessage = (data: unknown): string | undefined => {
  if (typeof data !== "object" || data === null) return undefined;

  if ("error" in data && typeof data.error === "string") return data.error;
  if ("message" in data && typeof data.message === "string") return data.message;
  return undefined;
};

const humanize = (message: string): string => technicalMessages[message] ?? message;

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Please check the form and try again.";
  }

  if (axios.isAxiosError(error)) {
    const responseMessage = getResponseMessage(error.response?.data);
    if (responseMessage) return humanize(responseMessage);
    if (error.code && technicalMessages[error.code]) return technicalMessages[error.code];
    if (!error.response) return technicalMessages["Network Error"];
  }

  if (error instanceof Error && error.message) return humanize(error.message);
  return fallback;
};