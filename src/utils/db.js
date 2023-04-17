const mongoose = require("mongoose");

const connect = async (mongoDB) => {
  try {
    const db = await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Nombre de DB y el Host en el que está
    const { name, host } = db.connection;
    console.log(`Conectado a la DB : ${name} en el host: ${host}`);
  } catch (error) {
    console.error(`No se ha podido conectar a la DB`, error);
  }
};

module.exports = { connect };
