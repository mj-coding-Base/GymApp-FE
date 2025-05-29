export type CommonResponseDataType = {
  status: "SUCCESS" | "FAIL";
  message: string;
  data: unknown | null;
};
