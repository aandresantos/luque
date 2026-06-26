export const notFound = (message?: string): never => {
  throw { statusCode: 404, message: message ?? "Company membership not found" };
};

export const forbidden = (message?: string): never => {
  throw {
    statusCode: 403,
    message: message ?? "Only company admins can manage memberships",
  };
};

export const conflict = (message?: string): never => {
  throw { statusCode: 409, message: message ?? "Entity already exists" };
};
