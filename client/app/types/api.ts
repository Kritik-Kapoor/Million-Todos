export type ApiResponse<TData> = {
  success: boolean;
  message: string;
  data: TData;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: unknown[];
};
