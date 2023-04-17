const UserRoutes = require("express").Router();
const { isAuth } = require("../../middlewares/isAuth.js");

const {
  register,
  login,
  logout,
  confirm,
  verifyToken,
  addFavorites,
  deleteFav,
} = require("./users.controllers");

UserRoutes.post("/register", register);
UserRoutes.post("/login", login);
UserRoutes.post("/confirmar-usuario/:token", confirm);
UserRoutes.get("/verify-token/:token", verifyToken);
UserRoutes.post("/add-favorites/:token", addFavorites);
UserRoutes.delete("/delete-fav/:city", deleteFav);
UserRoutes.get("/logout/:token", isAuth, logout);

module.exports = UserRoutes;
