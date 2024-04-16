const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const bodyParser = require("body-parser");

const { consultaSQL } = require("./consulta");
const { RequestError } = require("mssql");

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

app.post("/createtable", async (req, res) => {
  console.log("--- CrearTable ---");
  console.log("- obteniendo datos");
  const table = req.body.table;
  const columns = req.body.columns;

  const config = {
    server: req.body.server,
    user: req.body.user,
    password: req.body.password,
    database: req.body.database,

    options: {
      trustedConnection: true,
      encrypt: true,
      validateBulkLoadParameters: false,
      trustServerCertificate: true, // Ignora la validación del certificado (NO RECOMENDADO para producción)
    },
  };

  // Construir la consulta de creación de tabla
  let consulta = `CREATE TABLE ${table} (`;

  columns.forEach((column, index) => {
    consulta += `${column.name} ${column.type}`;

    // Agregar longitud si está definida
    if (column.length !== "") {
      consulta += `(${column.length})`;
    }

    // Marcar como clave primaria si es necesario
    if (column.primaryKeys) {
      consulta += " PRIMARY KEY";
    }

    // Marcar como no nulo si es necesario
    if (!column.nullables) {
      consulta += " NOT NULL";
    }

    // Agregar coma si no es la última columna
    if (index < columns.length - 1) {
      consulta += ", ";
    }
  });

  consulta += ");";

  try {
    console.log("- Haciendo la consulta");
    const result = await consultaSQL(config, consulta);
    console.log("- Enviando resultado");
    res.json({ message: "La tabla se creó correctamente" });
  } catch (error) {
    // Manejar otros errores
    console.error("- Error al ejecutar la consulta SQL:", error);

    // Verificar si el error es debido a que ya existe un objeto con el mismo nombre
    if (
      error instanceof RequestError &&
      error.message.includes("There is already an object named")
    ) {
      res.status(400).json({
        error: "Ya existe una tabla con el mismo nombre en la base de datos",
      });
    } else {
      res.status(500).json({ error: "Error al ejecutar la consulta SQL" });
    }
  }
});

app.post("/updatetable", async (req, res) => {
  console.log("--- UpdateTable ---");
  console.log("- obteniendo datos");
  let table = req.body.table;
  const newColumns = req.body.columns;
  const oldColumns = req.body.oldcolumns;
  const newName = req.body.newName;

  const config = {
    server: req.body.server,
    user: req.body.user,
    password: req.body.password,
    database: req.body.database,

    options: {
      trustedConnection: true,
      encrypt: true,
      validateBulkLoadParameters: false,
      trustServerCertificate: true, // Ignora la validación del certificado (NO RECOMENDADO para producción)
    },
  };

  try {
    if (newName !== table) {
      try {
        // Consulta para verificar si ya existe una tabla con el nuevo nombre
        const checkNewNameQuery = `SELECT COUNT(*) AS tableCount FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${newName}'`;

        // Ejecutar la consulta para verificar si ya existe una tabla con el nuevo nombre
        const existingTableResult = await consultaSQL(
          config,
          checkNewNameQuery
        );

        // Verificar si ya existe una tabla con el nuevo nombre
        if (existingTableResult[0].tableCount > 0) {
          console.log(
            `Ya existe una tabla con el nombre '${newName}'. No se puede cambiar el nombre de la tabla.`
          );
          res.status(400).json({
            error: `Ya existe una tabla con el nombre '${newName}'. No se puede cambiar el nombre de la tabla.`,
          });
          return;
        }

        // Consulta para cambiar el nombre de la tabla
        const renameTableQuery = `EXEC sp_rename '${table}', '${newName}'`;

        // Ejecutar la consulta para cambiar el nombre de la tabla
        await consultaSQL(config, renameTableQuery);

        table = newName;
      } catch (error) {
        console.error("Error al cambiar el nombre de la tabla:", error);
        res
          .status(500)
          .json({ error: "Error al cambiar el nombre de la tabla" });
        return;
      }
    }

    // Construi r la consulta para modificar la tabla y sus columnas
    let queries = [];

    for (const oldColumn of oldColumns) {
      const existsInNewColumns = newColumns.some(
        (newColumn) => newColumn.name === oldColumn.COLUMN_NAME
      );
      if (!existsInNewColumns) {
        if (oldColumn.primary_key_column !== null) {
          try {
            // Consulta para obtener el nombre de la restricción de clave primaria de la columna
            const getPrimaryKeyConstraintQuery = `
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_NAME = '${table}' 
            AND CONSTRAINT_TYPE = 'PRIMARY KEY'`;

            // Ejecutar la consulta para obtener el nombre de la restricción de clave primaria
            const primaryKeyConstraintResult = await consultaSQL(
              config,
              getPrimaryKeyConstraintQuery
            );

            if (primaryKeyConstraintResult.length > 0) {
              const primaryKeyConstraintName =
                primaryKeyConstraintResult[0].CONSTRAINT_NAME;

              queries.push({
                description: `Eliminamos la restricción de clave primaria de la columna ${oldColumn.COLUMN_NAME}`,
                sql: `ALTER TABLE ${table} DROP CONSTRAINT ${primaryKeyConstraintName};`,
              });
            } else {
              console.log(
                `No se encontró una restricción de clave primaria para la columna ${oldColumn.COLUMN_NAME}.`
              );
            }
          } catch (error) {
            console.error(
              `Error al obtener el nombre de la restricción de clave primaria para la columna ${oldColumn.COLUMN_NAME}:`,
              error
            );
          }
        }

        queries.push({
          description: ` Después de eliminar la restricción de clave primaria, podemos eliminar la columna ${oldColumn.COLUMN_NAME}`,
          sql: `ALTER TABLE ${table} DROP COLUMN ${oldColumn.COLUMN_NAME};`,
        });
      }
    }

    for (const newColumn of newColumns) {
      // Verificar si la columna ya existe en la tabla
      const oldColumn = oldColumns.find(
        (col) => col.COLUMN_NAME === newColumn.name
      );

      // Si la columna no existe en la tabla o ha cambiado, agregarla o modificarla
      if (!oldColumn) {
        if (newColumn.primaryKeys) {
          queries.push({
            description: ` Después de eliminar las columnas antiguas, podemos agregar la nueva columna ${newColumn.name} como clave primaria`,
            sql: `ALTER TABLE ${table} ADD ${newColumn.name} ${newColumn.type} PRIMARY KEY NOT NULL;`,
          });
        } else {
          queries.push({
            description: `Después de eliminar las columnas antiguas, podemos agregar la nueva columna ${newColumn.name}`,
            sql: `ALTER TABLE ${table} ADD ${newColumn.name} ${newColumn.type}${
              newColumn.length ? "(" + newColumn.length + ")" : ""
            }${newColumn.nullables ? " NULL" : " NOT NULL"};`,
          });
        }
      }
    }

    console.log("- Haciendo la consulta");

    try {
      await consultaSQL(
        config,
        `ALTER TABLE ${table} ADD seelimina2133 INT NULL`
      );
    } catch {}

    for (const query of queries) {
      console.log(query.sql);
      try {
        await consultaSQL(config, query.sql);
        sql.close();
      } catch {}
    }

    try {
      await consultaSQL(
        config,
        `ALTER TABLE ${table} DROP COLUMN seelimina2133`
      );
    } catch {}

    console.log("- Enviando resultado");
    res.json({ message: "La tabla se modificó correctamente" });
  } catch (error) {
    // Manejar otros errores
    console.error("- Error al ejecutar la consulta SQL:", error);

    res.status(500).json({ error: "Error al ejecutar la consulta SQL" });
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

app.post("/insertcolumns", async (req, res) => {
  console.log("--- Insert Columnas ---");
  console.log("- obteniendo datos");
  const table = req.body.table;
  const dataToInsert = req.body.data;

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

  // Validar que se hayan proporcionado datos
  if (!dataToInsert || dataToInsert.length === 0) {
    return res
      .status(400)
      .json({ error: "No se proporcionaron datos para insertar." });
  }

  // Crear la lista de columnas y valores
  const columns = dataToInsert.map((column) => column.name).join(", ");
  const values = dataToInsert
    .map((column) => {
      if (column.type === "date") {
        // Si el tipo es date, convertir el valor a una cadena con el formato adecuado para SQL
        return `'${column.data}'`;
      } else if (column.type === "varchar") {
        // Si el tipo es varchar, envolver el valor entre comillas simples
        return `'${column.data}'`;
      } else {
        // Para otros tipos de valores (int, etc.), no agregar comillas
        return column.data;
      }
    })
    .join(", ");

  const insertQuery = `INSERT INTO ${table} (${columns}) VALUES (${values});`;
  try {
    console.log("- Haciendo la consulta");
    const result = await consultaSQL(config, insertQuery);
    console.log("- Enviando resultado");
    res.json({ message: "Se ha insertado correctamente" });
  } catch (error) {
    console.log(error);
    if (error.message.includes("Violation of PRIMARY KEY constraint")) {
      res
        .status(400)
        .json({ error: "La clave primaria ya existe en la tabla" });
    } else {
      res.status(500).json({ error: "Error al ejecutar la consulta SQL" });
    }
  }
});

app.post("/deletecolumn", async (req, res) => {
  const config = {
    server: req.body.server,
    user: req.body.user,
    password: req.body.password,
    database: req.body.database,
    table: req.body.table,

    options: {
      trustedConnection: true,
      encrypt: true, // Habilita la encriptación
      validateBulkLoadParameters: false, // Desactiva la validación de parámetros de carga masiva
      trustServerCertificate: true, // Ignora la validación del certificado (NO RECOMENDADO para producción)
    },
  };

  const data = req.body.data;

  // Validar que se hayan proporcionado datos
  if (!data || Object.keys(data).length === 0) {
    return res
      .status(400)
      .json({ error: "No se proporcionaron datos para eliminar." });
  }

  // Crear la lista de condiciones WHERE
  const whereConditions = Object.keys(data)
    .map((key) => {
      const value = data[key];
      if (value === null) {
        return `${key} IS NULL`;
      } else if (typeof value === "string") {
        return `${key} = '${value}'`;
      } else {
        return `${key} = ${value}`;
      }
    })
    .join(" AND ");

  // Construir la consulta DELETE
  const deleteQuery = `DELETE FROM ${config.table} WHERE ${whereConditions};`;

  try {
    console.log("- Haciendo la consulta");
    await consultaSQL(config, deleteQuery);
    console.log("- Eliminación exitosa");
    res.status(200).json({ message: "Eliminación exitosa" });
  } catch (error) {
    console.error(
      "- Error al ejecutar la consulta de eliminación:",
      error.message
    );
    res
      .status(500)
      .json({ error: "Error al ejecutar la consulta de eliminación SQL" });
  }
});

app.post("/updatedatas", async (req, res) => {
  console.log("--- Update de un dato ---");
  console.log("- obteniendo datos");
  const data = req.body.data;

  const config = {
    server: req.body.server,
    user: req.body.user,
    password: req.body.password,
    database: req.body.database,
    table: req.body.table,
    options: {
      trustedConnection: true,
      encrypt: true,
      validateBulkLoadParameters: false,
      trustServerCertificate: true, // Ignora la validación del certificado (NO RECOMENDADO para producción)
    },
  };
  try {
    if (!data || typeof data !== "object") {
      throw new Error(
        "Los datos proporcionados para actualizar no son válidos."
      );
    }

    const primaryKey = "id"; // Suponemos que la clave primaria es 'id'
    const primaryKeyValue = data[primaryKey];

    // Creamos la lista de actualizaciones
    const updatesList = [];

    // Recorremos las claves del objeto data
    for (const key in data) {
      // Excluimos el campo de la clave primaria de las actualizaciones
      if (key !== primaryKey && data.hasOwnProperty(key)) {
        // Verificamos si el campo tiene la propiedad 'new'
        if (key.startsWith("new")) {
          // Si es un campo 'new', agregamos la actualización correspondiente
          const originalKey = key.substring(3); // Eliminamos el prefijo 'new' para obtener el nombre original del campo
          updatesList.push(`${originalKey} = '${data[key]}'`);
        }
      }
    }

    // Verificamos si hay campos para actualizar
    if (updatesList.length === 0) {
      throw new Error("No hay campos nuevos para actualizar.");
    }

    const whereConditions = Object.keys(data)
      .filter((key) => !key.startsWith("new")) // Excluimos los datos que tienen "new" al inicio de su nombre
      .map((key) => {
        const value = data[key];
        if (value === null) {
          return `${key} IS NULL`;
        } else if (typeof value === "string") {
          return `${key} = '${value}'`;
        } else {
          return `${key} = ${value}`;
        }
      })
      .join(" AND ");

    // Construimos la consulta UPDATE
    const updateQuery = `UPDATE ${config.table} SET ${updatesList.join(
      ", "
    )} WHERE ${whereConditions}`;

    console.log("- Haciendo la consulta");
    await consultaSQL(config, updateQuery);
    console.log("- Actualización exitosa");
    res.status(200).json({ message: "Actualización exitosa" });
  } catch (error) {
    console.error("- Error al ejecutar la actualización:", error.message);
    res
      .status(500)
      .json({ error: "Error al ejecutar la actualización de datos" });
  }
});

app.post("/datas", async (req, res) => {
  console.log("--- datos ---");
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

  const consulta = `SELECT * FROM ${table};`;

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

app.post("/droptable", async (req, res) => {
  console.log("--- CrearDB ---");
  console.log("- obteniendo datos");
  const table = req.body.table;

  const config = {
    server: req.body.server,
    user: req.body.user,
    password: req.body.password,
    database: req.body.database,
    options: {
      trustedConnection: true,
      encrypt: true,
      validateBulkLoadParameters: false,
      trustServerCertificate: true, // Ignora la validación del certificado (NO RECOMENDADO para producción)
    },
  };

  const consulta = `DROP TABLE ${table};`;
  console.log(config);
  console.log(consulta);
  try {
    console.log("- Haciendo la consulta");
    const result = await consultaSQL(config, consulta);
    console.log(result);
    console.log("- Enviando resultado");
    res.json({ message: "La tabla se eliminó correctamente" });
  } catch (error) {
    // console.error("- Error al ejecutar la consulta SQL:", error);
    if (error.code === "EREQUEST" && error.message.includes("already exists")) {
      res.status(400).json({ error: "La base de datos ya existe" });
    } else {
      console.error("- Error al ejecutar la consulta SQL:", error);
      res.status(500).json({ error: "Error al ejecutar la consulta SQL" });
    }
  }
});

app.post("/createdb", async (req, res) => {
  console.log("--- CrearDB ---");
  console.log("- obteniendo datos");
  const db = req.body.db;

  const config = {
    server: req.body.server,
    user: req.body.user,
    password: req.body.password,
    options: {
      trustedConnection: true,
      encrypt: true,
      validateBulkLoadParameters: false,
      trustServerCertificate: true, // Ignora la validación del certificado (NO RECOMENDADO para producción)
    },
  };

  const consulta = `CREATE DATABASE ${db};`;

  try {
    console.log("- Haciendo la consulta");
    const result = await consultaSQL(config, consulta);
    console.log("- Enviando resultado");
    res.json({ message: "La base de datos se creó correctamente" });
  } catch (error) {
    // console.error("- Error al ejecutar la consulta SQL:", error);
    if (error.code === "EREQUEST" && error.message.includes("already exists")) {
      res.status(400).json({ error: "La base de datos ya existe" });
    } else {
      console.error("- Error al ejecutar la consulta SQL:", error);
      res.status(500).json({ error: "Error al ejecutar la consulta SQL" });
    }
  }
});

app.post("/deletedb", async (req, res) => {
  console.log("--- eliminar base de datos ---");
  console.log("- obteniendo datos");
  const db = req.body.db;

  const config = {
    server: req.body.server,
    user: req.body.user,
    password: req.body.password,
    options: {
      trustedConnection: true,
      encrypt: true,
      validateBulkLoadParameters: false,
      trustServerCertificate: true, // Ignora la validación del certificado (NO RECOMENDADO para producción)
    },
  };

  const consulta = `DROP DATABASE ${db};`;

  try {
    console.log("- Haciendo la consulta");
    const result = await consultaSQL(config, consulta);
    console.log(result);
    console.log("- Enviando resultado");
    res.json({ message: "La base de datos se eliminó correctamente" });
  } catch (error) {
    // console.error("- Error al ejecutar la consulta SQL:", error);
    if (error.code === "EREQUEST" && error.message.includes("already exists")) {
      res.status(400).json({ error: "La base de datos ya existe" });
    } else {
      console.error("- Error al ejecutar la consulta SQL:", error);
      res.status(500).json({ error: "Error al ejecutar la consulta SQL" });
    }
  }
});

app.listen(3001, () => {
  console.log(
    `----- \x1b[1m Corriendo servidor en el puerto: \x1b \x1b[33m 3001\x1b[0m -----`
  );
});
