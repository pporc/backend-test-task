import { User } from "./db.js";

User.sync()
  .then(() => console.log("User table created successfully"))
  .catch((err) =>
    console.log("BTW, did you enter wrong database credentials?")
  );

export const createUser = async ({ name, password, email, phone }) => {
  return await User.create({ name, password, email, phone });
};
export const getUser = async (obj) => {
  return await User.findOne({
    where: obj,
  });
};
