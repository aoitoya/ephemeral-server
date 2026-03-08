import { AxiosError } from "axios";

export type ErrResType = {
  error: true;
  status: number;
  code: string;
  message: string;
};
type OkResType<T = undefined> = { error: false; data: T };

type ListOkResType<T> = {
  error: false;
  data: T[];
  count: number;
  page: number;
  limit: number;
};

export type ResType<T = undefined> = ErrResType | OkResType<T>;
export type ListResType<T> = ErrResType | ListOkResType<T>;

export function handleApiErr(error: unknown): ErrResType {
  console.log(error);

  let status;
  let code;
  let message;

  if (error instanceof Error) {
    if (error instanceof AxiosError) {
      status = error.response?.status;

      if (error.response?.data.code) {
        code = error.response?.data.code;
      }

      if (error.response?.data.message) {
        message = error.response?.data.message;
      }
    }
  }

  return {
    error: true,
    status: status || 500,
    code: code || "",
    message: message || "Something went wrong",
  };
}

export function isLoggedIn() {
  try {
    return localStorage.getItem("logged_in") === "true";
  } catch (error) {
    console.log(error);
  }
}
