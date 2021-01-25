import { Products } from "./db.js";

Products.sync()
  .then(() => console.log("Products table created successfully"))
  .catch((err) =>
    console.log("BTW, did you enter wrong database credentials?")
  );

export const getProduct = async (id) => {
  return await Products.findOne({
    where: { id },
  });
};

export const getAllProduct = async () => {
  return await Products.findAll();
};

export const createProduct = async ({ title, price, user_id }) => {
  return await Products.create({ title, price, user_id });
};

export const deleteProduct = async (id) => {
  return await Products.destroy({
    where: { id },
  });
};

export const updateProduct = async (id, data) => {
  return await Products.update({ ...data }, { where: { id } });
};
