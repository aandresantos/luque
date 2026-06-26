const isUniqueViolation = (err: unknown): err is { code: string } =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  err.code === "23505";

type ServiceError = { statusCode: number; message: string };

function isServiceError(err: unknown): err is ServiceError {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    "message" in err
  );
}
export { isUniqueViolation, isServiceError, ServiceError };
