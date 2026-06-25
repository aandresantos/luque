export const notFound = (): never => {
  throw { statusCode: 404, message: "Company membership not found" };
};

export const forbidden = (): never => {
  throw {
    statusCode: 403,
    message: "Only company admins can manage memberships",
  };
};
