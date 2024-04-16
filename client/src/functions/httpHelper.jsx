const createConectionSQL = async ({
  serverName,
  serverUser,
  serverPassword,
}) => {
  try {
    const config = {
      user: serverUser,
      server: serverName,
      password: serverPassword,
    };

    const response = await fetch("http://localhost:3001/conection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json(); // Esperar la respuesta JSON
    const serverData = {
      serverName,
      databases: data.resultSQL,
      config: config,
    };

    return serverData;

    // setConection((prevDatabases) => [...prevDatabases, serverData]);
  } catch (error) {
    return `There was a problem with your fetch operation: ${error}`;
  }
};

const tablesSQL = async ({ database, configServer }) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    database: database,
  };

  const response = await fetch("http://localhost:3001/tables", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

const CreateTableSQL = async ({ configServer, name, columns, database }) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    database: database,
    table: name,
    columns: columns,
  };

  const response = await fetch("http://localhost:3001/createtable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

const UpdateTableSQL = async ({
  configServer,
  name,
  columns,
  database,
  table,
  oldcolumns,
}) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    database: database,
    newName: name,
    table: table,
    columns: columns,
    oldcolumns: oldcolumns,
  };

  const response = await fetch("http://localhost:3001/updatetable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

const InsertTableSQL = async ({
  database,
  configServer,
  table,
  dataToInsert,
}) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    database: database,
    table: table,
    data: dataToInsert,
  };

  const response = await fetch("http://localhost:3001/insertcolumns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

const columnsSQL = async ({ database, configServer, table }) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    database: database,
    table: table,
  };

  const response = await fetch("http://localhost:3001/columns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

const deleteColumnSQL = async ({
  database,
  configServer,
  table,
  dataColumn,
}) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    database: database,
    table: table,
    data: dataColumn,
  };

  const response = await fetch("http://localhost:3001/deletecolumn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

const datasSQL = async ({ database, configServer, table }) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    database: database,
    table: table,
  };

  const response = await fetch("http://localhost:3001/datas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

const updateData = async ({ configServer, database, table, datatoupdate }) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    database: database,
    table: table,
    data: datatoupdate,
  };

  const response = await fetch("http://localhost:3001/updatedatas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};
const deleteTableSQL = async ({ configServer, database, table }) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    database: database,
    table: table,
  };

  const response = await fetch("http://localhost:3001/droptable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

const createDBSQL = async ({ configServer, namedb }) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    db: namedb,
  };

  const response = await fetch("http://localhost:3001/createdb", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

const deleteDBSQL = async ({ configServer, namedb }) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    db: namedb,
  };
  const response = await fetch("http://localhost:3001/deletedb", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

const querySQL = async ({ configServer, query }) => {
  const config = {
    user: configServer.user,
    server: configServer.server,
    password: configServer.password,
    query: query,
  };
  const response = await fetch("http://localhost:3001/querysql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config), // Convertir el objeto a una cadena JSON
  });

  const data = await response.json(); // Esperar la respuesta JSON

  return data;
};

export {
  createConectionSQL,
  tablesSQL,
  columnsSQL,
  datasSQL,
  createDBSQL,
  deleteDBSQL,
  CreateTableSQL,
  UpdateTableSQL,
  InsertTableSQL,
  deleteColumnSQL,
  updateData,
  deleteTableSQL,
  querySQL,
};
