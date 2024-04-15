const sql = require("mssql");

async function consultaSQL(config, consulta) {
  try {
    // Crear un pool de conexiones
    const pool = await sql.connect(config);

    // Crear una solicitud de consulta SQL
    const result = await pool.request().query(consulta);

    // Devolver los resultados
    return result.recordset;
  } catch (error) {
    // Manejar errores
    console.error("Error al ejecutar la consulta SQL:", error);
    throw error; // Propagar el error para que sea manejado por el llamador
  } finally {
    await sql.close();
  }
}

module.exports = {
  consultaSQL: consultaSQL,
};
