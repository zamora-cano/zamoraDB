import React, { useState } from "react";
import styles from "../styles/manager.module.css";
import ModalMiddle from "../layouts/modals";
import { MagicMotion } from "react-magic-motion";

import {
  Form,
  InputGroup,
  Accordion,
  Table,
  Image,
  Tab,
  Tabs,
} from "react-bootstrap";

import { createConectionSQL, tablesSQL } from "../functions/httpHelper";
import TablesSQL from "../layouts/TablesSQL";
import ConsultaSQL from "../layouts/consultaSQL";

const Manager = () => {
  const [conections, setConections] = useState([]);
  const [conecting, setConecting] = useState(false);
  const [userConection, setUserConection] = useState("");
  const [serverConection, setServerConection] = useState("");
  const [passwordConection, setPasswordConection] = useState("");

  const [selectedServer, setSelectedServer] = useState("");
  const [selectedDataBase, setSelectedDataBase] = useState("");
  const [selectedTable, setSelectedTable] = useState("");

  const [selectedConfig, setSelectedConfig] = useState([]);

  const [key, setKey] = useState("query");

  const conectar = async (event) => {
    event.preventDefault();

    const result = await createConectionSQL({
      setConection: setConections,
      serverName: serverConection,
      serverUser: userConection,
      serverPassword: passwordConection,
    });

    setConections((prevConnections) => {
      // Verificar si el resultado ya existe en prevConnections
      const isDuplicate = prevConnections.some(
        (connection) =>
          connection.serverName === result.serverName &&
          connection.databases === result.databases
      );

      // Si no es un duplicado, agregarlo al arreglo prevConnections
      if (!isDuplicate) {
        return [...prevConnections, result];
      }

      // Si es un duplicado, devolver el arreglo prevConnections sin cambios
      return prevConnections;
    });

    console.log(conections);
  };

  const GetTablesSQL = async (database, config, connections) => {
    try {
      const result = await tablesSQL({
        database: database,
        configServer: config,
      });
      console.log(conections);

      const connectionsWithTables = connections.map((connection) => {
        const databasesWithTables = connection.databases.map((database) => {
          const tables = result.map((table) => table.name);
          if (
            database.name ===
            database /* O cualquier otra base de datos a la que deseas agregar tablas */
          ) {
            return { ...database, tables };
          }
          return database;
        });
        return { ...connection, databases: databasesWithTables };
      });

      console.log(connectionsWithTables);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  return (
    <>
      <Table bordered>
        <thead>
          <tr>
            <th colSpan={2}>Salir Opcion configuración</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className={styles.conections}>
                <form onSubmit={conectar}>
                  <ModalMiddle
                    title="Crear conexión"
                    button="conectar"
                    secondButtonTxt="conectar"
                    secondButton={(e) => {
                      if (!conecting) {
                        conectar(e);
                      }
                    }}
                    loading={conecting}
                  >
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="basic-addon1">
                        Servidor
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="172.0.0.1"
                        aria-label="server"
                        aria-describedby="basic-addon1"
                        onChange={(event) => {
                          setServerConection(event.target.value);
                        }}
                      />
                    </InputGroup>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="basic-addon2">
                        Usuario
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Sa"
                        aria-label="Usuario"
                        aria-describedby="basic-addon2"
                        onChange={(event) => {
                          setUserConection(event.target.value);
                        }}
                      />
                    </InputGroup>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="basic-addon3">
                        Contraseña
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="*****"
                        aria-label="Password"
                        aria-describedby="basic-addon3"
                        type="password"
                        onChange={(event) => {
                          setPasswordConection(event.target.value);
                        }}
                      />
                    </InputGroup>
                  </ModalMiddle>
                </form>
              </div>
            </td>
            <td rowSpan={2}>
              <div className={styles.sectionQueries}>
                {/* <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={(k) => setKey(k)}
                  className="mb-3"
                  // fill
                >
                  <Tab eventKey="query" title="Consultas">
                    {selectedServer ? (
                      <ConsultaSQL></ConsultaSQL>
                    ) : (
                      <>No se ha seleccionado un servidor</>
                    )}
                  </Tab>
                  <Tab
                    eventKey="profile"
                    title={selectedTable ? selectedTable : "Profile"}
                    disabled={!selectedTable || !selectedServer}
                  >
                    <TablesSQL
                      server={selectedServer}
                      table={selectedTable}
                      config={selectedConfig}
                    />
                  </Tab>
                </Tabs> */}
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div className={styles.sectionConections}>
                <MagicMotion>
                  {conections.length > 0 ? (
                    <>
                      {conections.map((server, indexConection) => (
                        <>
                          <Accordion key={indexConection} defaultActiveKey="0">
                            <Accordion.Header
                              eventKey="0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedServer(server.serverName);
                              }}
                            >
                              <Image
                                src="http://localhost:3000/img/server.png"
                                rounded
                              />
                              {server.serverName}
                            </Accordion.Header>
                            <Accordion.Body eventKey="0">
                              <Table>
                                <tbody>
                                  <tr>
                                    <td>
                                      <Image
                                        src="http://localhost:3000/img/addDatabase.png"
                                        rounded
                                      />{" "}
                                      <Image
                                        src="http://localhost:3000/img/actualizar.png"
                                        rounded
                                      />
                                    </td>

                                    <td>
                                      {" "}
                                      <Image
                                        src="http://localhost:3000/img/cerrarSesion.png"
                                        rounded
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </Table>

                              {server.databases.map((database, index) => (
                                <Accordion
                                  key={index}
                                  defaultActiveKey="0"
                                  onClick={() => {
                                    setSelectedServer(server.serverName);
                                    setSelectedDataBase(database.name);
                                    setSelectedConfig(server.config);
                                    GetTablesSQL(
                                      database.name,
                                      server.config,
                                      conecting[indexConection]
                                    );
                                  }}
                                >
                                  <Accordion.Header
                                    eventKey="0"
                                    onClick={() => {}}
                                  >
                                    <Image
                                      src="http://localhost:3000/img/database.png"
                                      rounded
                                    />
                                    {database.name}{" "}
                                  </Accordion.Header>
                                  <Accordion.Body eventKey="0">
                                    <Table>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <Image
                                              src="http://localhost:3000/img/addTable.webp"
                                              rounded
                                            />{" "}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </Table>
                                    <Table>
                                      <tbody>
                                        <tr>
                                          <td>tabla</td>
                                        </tr>
                                      </tbody>
                                    </Table>
                                  </Accordion.Body>
                                </Accordion>
                              ))}
                            </Accordion.Body>
                          </Accordion>
                        </>
                      ))}
                    </>
                  ) : (
                    <>
                      <p>No hay servidor seleccionado.</p>
                    </>
                  )}
                </MagicMotion>
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};
export default Manager;
