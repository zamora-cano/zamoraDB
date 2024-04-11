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

export { createConectionSQL, tablesSQL, columnsSQL, datasSQL };
