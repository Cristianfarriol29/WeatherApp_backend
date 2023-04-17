const { generateToken } = require("../../utils/jwt/jwt.js");
const { generateID } = require("../../utils/generateID/generateID.js");
const jwt = require("jsonwebtoken");
const User = require("./users.model");

const nodemailer = require("nodemailer");

const register = async (req, res, next) => {
  try {
    const regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,12}$/;
    const { name, email, surname, password } = req.body;
    if (password.length < 8) {
      return res.json("¡El password es muy corto!");
    }
    if (!regexp.test(password)) {
      return res.json("¡El password no cumple con los minimos requerimientos!");
    }
    const user = new User();
    user.name = name;
    user.email = email;
    user.surname = surname;
    user.password = password;
    user.token = generateID();
    // Miramos si el email existea
    const userExist = await User.findOne({ email: user.email });

    if (userExist) {
      const error = new Error("El correo electronico ya existe");
      return res.json({ msg: error.message });
    }
    const userDB = await user.save();

    return res.status(201).json(userDB);
  } catch (error) {
    const err = new Error("Ha ocurrido un error con el registro");
    return res.status(404).json({ msg: err.message });
  }
};

const confirm = async (req, res, next) => {
  const { token } = req.params;
  const userConfirm = await User.findOne({ token });
  if (!userConfirm) {
    const error = new Error("Token is invalid");
    return res.status(403).json({ msg: error.message });
  }

  try {
    userConfirm.confirmed = true;
    userConfirm.token = "";
    await userConfirm.save();
    return res.status(200).json({ msg: "¡Confirmed user!" });
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      const error = new Error("The user don't exist");
      return res.status(500).json({ msg: error.message });
    }
    if (!(await user.passwordCheck(req.body.password))) {
      const error = new Error(
        "The email or password is not correct, check them and try again"
      );
      return res.status(500).json({ msg: error.message });
    }

    if (!user.confirmed) {
      const error = new Error("¡You haven't confirmed your account yet!");
      return res.json({ msg: error.message });
    }
    if (await user.passwordCheck(req.body.password)) {
      const token = generateToken(user._id, user.email);
      user.token = token;
      await user.save();
      const userToShare = {
        name: user.name,
        surname: user.surname,
        token: user.token,
      };
      return res.json(userToShare);
    } else {
      const error = new Error(
        "The email or password is not correct, check them and try again"
      );
      return res.json({ msg: error.message });
    }
  } catch (error) {
    const err = new Error("Ha ocurrido un error con el inicio de sesión.");
    return res.json({ msg: err.message });
  }
};

const logout = async (req, res, next) => {
  const { token } = req.params;
  const userConfirm = await User.findOne({ token });
  try {
    userConfirm.token = null;
    await userConfirm.save();

    return res.status(201).json(userConfirm.token);
  } catch (error) {
    return next(error);
  }
};

const verifyToken = async (req, res, next) => {
  const { token } = req.params;

  try {
    const validToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: validToken.email });
    if (validToken) {
      const userWithoutPass = {
        token: user.token,
        role: user.role,
        favorites: user.favorites,
      };
      return res.json(userWithoutPass);
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

const addFavorites = async (req, res, next) => {
  const { token } = req.params;
  const user = await User.findOne({ token });

  try {
    if (user.role === "Admin") {
      let cities = user.favorites?.length
        ? user.favorites.map((f) => f.name)
        : [];
      if (!cities.includes(req.body.city.name)) {
        user.favorites.push(req.body.city);
        await user.save();
      } else {
        await user.save();
        return res.json({ msg: "Por favor, no repitas las ciudades" });
      }
      let userWithMsg = { ...user, msg: "Añadido correctamente a favoritos" };
      return res.status(200).json(userWithMsg);
    } else {
      res.status(500).json({ msg: "No tienes permiso" });
    }
  } catch (error) {
    res.status(404).json({ msg: "Ha ocurrido un error" });
  }
};

const deleteFav = async (req, res, next) => {
  const { city } = req.params;
  const token = req.headers.authorization;
  const parsedToken = token.replace("Bearer ", "");
  let user = await User.findOne({ token: parsedToken });
  try {
    user.favorites = user.favorites.filter((f) => f.name !== city);
    await user.save();
    let userFavoritesWithMsg = {
      favorites: user.favorites,
      msg: "Se ha eliminado correctamente",
    };
    return res.status(200).json(userFavoritesWithMsg);
  } catch (error) {}
};

module.exports = {
  register,
  login,
  logout,
  confirm,
  verifyToken,
  addFavorites,
  deleteFav,
};
