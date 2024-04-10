const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const bodyParser = require("body-parser");

const { consultaSQL } = require("./consulta");

const app = express();
app.use(bodyParser.json());

// Middleware para permitir CORS desde http://localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.post("/conection", async (req, res) => {
  try {
    console.log("\n--- Creando Conexión ---- ");
    const user = req.body.user;
    const password = req.body.password;
    const server = req.body.server;

    const config = {
      server: server,
      user: user,
      password: password,
      options: {
        trustedConnection: true,
        encrypt: true, // Habilita la encriptación
        validateBulkLoadParameters: false, // Desactiva la validación de parámetros de carga masiva
        trustServerCertificate: true, // Ignora la validación del certificado (NO RECOMENDADO para producción)
      },
    };

    console.log("- Estableciendo conexión");
    // Establecer la conexión
    const pool = await sql.connect(config);

    console.log("- haciendo la consulta");
    const consulta =
      "SELECT name FROM sys.databases WHERE database_id > 4 order by name asc; ";
    const result = await pool.request().query(consulta);

    console.log("- Enviando datos");
    res.json({ error: "None", resultSQL: result.recordset });
    // Cerrar la conexión
    await sql.close();
  } catch (error) {
    if (error.code === "ELOGIN") {
      res.status(401).json({ error: "Error de autenticación" });
    } else if (error.code === "ETIMEOUT") {
      res.status(408).json({ error: "Error de tiempo de espera" });
    } else if (error.code === "ECONNREFUSED") {
      res.status(503).json({ error: "Conexión rechazada" });
    } else if (error.code === "ESOCKET") {
      res.status(500).json({ error: "Error de conexión" });
    } else {
      console.error("Error desconocido:", error);
      res.status(500).json({ error: "Error desconocido", mensaje: error });
    }
  }
});

app.post("/tables", async (req, res) => {
  console.log("--- obtener tablas ---");
  const config = {
    server: req.body.server,
    user: req.body.user,
    password: req.body.password,
    database: req.body.database,

    options: {
      trustedConnection: true,
      encrypt: true, // Habilita la encriptación
      validateBulkLoadParameters: false, // Desactiva la validación de parámetros de carga masiva
      trustServerCertificate: true, // Ignora la validación del certificado (NO RECOMENDADO para producción)
    },
  };

  const consulta = `SELECT name FROM ${req.body.database}.sys.tables ORDER BY name ASC;`;

  try {
    console.log("- Haciendo la consulta");
    const result = await consultaSQL(config, consulta);
    console.log("- Enviando resultado");
    res.json(result);
    await sql.close();
  } catch (error) {
    res.status(500).json({ error: "Error al ejecutar la consulta SQL" });
    await sql.close();
  }
});
app.post("/columns", async (req, res) => {
  console.log("--- Columnas ---");
  console.log("- obteniendo datos");
  const table = req.body.table;

  const config = {
    server: req.body.server,
    user: req.body.user,
    password: req.body.password,
    database: req.body.database,

    options: {
      trustedConnection: true,
      encrypt: true, // Habilita la encriptación
      validateBulkLoadParameters: false, // Desactiva la validación de parámetros de carga masiva
      trustServerCertificate: true, // Ignora la validación del certificado (NO RECOMENDADO para producción)
    },
  };

  const consulta = `SELECT c.COLUMN_NAME, c.DATA_TYPE, c.IS_NULLABLE, c.CHARACTER_MAXIMUM_LENGTH, c.COLLATION_NAME, k.COLUMN_NAME AS primary_key_column, fk.COLUMN_NAME AS foreign_key_column, fk.CONSTRAINT_NAME AS foreign_key_name, fk.TABLE_NAME AS referenced_table FROM INFORMATION_SCHEMA.COLUMNS c LEFT JOIN (SELECT COLUMN_NAME, TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = '${table}' AND CONSTRAINT_NAME LIKE 'PK_%') k ON c.TABLE_NAME = k.TABLE_NAME AND c.COLUMN_NAME = k.COLUMN_NAME LEFT JOIN (SELECT ccu.TABLE_NAME, ccu.COLUMN_NAME, ccu.CONSTRAINT_NAME, tc.TABLE_NAME AS referenced_table FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS ccu JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc ON ccu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME WHERE ccu.TABLE_NAME = '${table}' AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY') AS fk ON c.TABLE_NAME = fk.TABLE_NAME AND c.COLUMN_NAME = fk.COLUMN_NAME WHERE c.TABLE_NAME = '${table}';`;
  try {
    console.log("- Haciendo la consulta");
    const result = await consultaSQL(config, consulta);
    console.log("- Enviando resultado");
    res.json(result);
    await sql.close();
  } catch (error) {
    res.status(500).json({ error: "Error al ejecutar la consulta SQL" });
    await sql.close();
  }
});

app.listen(3001, () => {
  console.log(
    `----- \x1b[1m Corriendo servidor en el puerto: \x1b \x1b[33m 3001\x1b[0m -----`
  );
});
