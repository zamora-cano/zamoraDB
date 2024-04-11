import React, { useState } from "react";
import styles from "../styles/manager.module.css";
import ModalMiddle from "../layouts/modals";

import ConsultaSQL from "../layouts/consultaSQL";

import {
  Form,
  InputGroup,
  Accordion,
  Table,
  Image,
  Tab,
  Tabs,
  Modal,
  Button,
} from "react-bootstrap";

import { createConectionSQL, tablesSQL } from "../functions/httpHelper";
import TableOptions from "../layouts/tableOptions";

const Manager = () => {
  const reservedKeywords = [
    "ADD",
    "ALL",
    "ALTER",
    "AND",
    "ANY",
    "AS",
    "ASC",
    "AUTHORIZATION",
    "BACKUP",
    "BEGIN",
    "BETWEEN",
    "BREAK",
    "BROWSE",
    "BULK",
    "BY",
    "CASCADE",
    "CASE",
    "CHECK",
    "CHECKPOINT",
    "CLOSE",
    "CLUSTERED",
    "COALESCE",
    "COLLATE",
    "COLUMN",
    "COMMIT",
    "COMPUTE",
    "CONSTRAINT",
    "CONTAINS",
    "CONTAINSTABLE",
    "CONTINUE",
    "CONVERT",
    "CREATE",
    "CROSS",
    "CURRENT",
    "CURRENT_DATE",
    "CURRENT_TIME",
    "CURRENT_TIMESTAMP",
    "CURRENT_USER",
    "CURSOR",
    "DATABASE",
    "DBCC",
    "DEALLOCATE",
    "DECLARE",
    "DEFAULT",
    "DELETE",
    "DENY",
    "DESC",
    "DISK",
    "DISTINCT",
    "DISTRIBUTED",
    "DOUBLE",
    "DROP",
    "DUMP",
    "ELSE",
    "END",
    "ERRLVL",
    "ESCAPE",
    "EXCEPT",
    "EXEC",
    "EXECUTE",
    "EXISTS",
    "EXIT",
    "EXTERNAL",
    "FETCH",
    "FILE",
    "FILLFACTOR",
    "FOR",
    "FOREIGN",
    "FREETEXT",
    "FREETEXTTABLE",
    "FROM",
    "FULL",
    "FUNCTION",
    "GOTO",
    "GRANT",
    "GROUP",
    "HAVING",
    "HOLDLOCK",
    "IDENTITY",
    "IDENTITY_INSERT",
    "IDENTITYCOL",
    "IF",
    "IN",
    "INDEX",
    "INNER",
    "INSERT",
    "INTERSECT",
    "INTO",
    "IS",
    "JOIN",
    "KEY",
    "KILL",
    "LEFT",
    "LIKE",
    "LINENO",
    "LOAD",
    "MERGE",
    "NATIONAL",
    "NOCHECK",
    "NONCLUSTERED",
    "NOT",
    "NULL",
    "NULLIF",
    "OF",
    "OFF",
    "OFFSETS",
    "ON",
    "OPEN",
    "OPENDATASOURCE",
    "OPENQUERY",
    "OPENROWSET",
    "OPENXML",
    "OPTION",
    "OR",
    "ORDER",
    "OUTER",
    "OVER",
    "PERCENT",
    "PIVOT",
    "PLAN",
    "PRECISION",
    "PRIMARY",
    "PRINT",
    "PROC",
    "PROCEDURE",
    "PUBLIC",
    "RAISERROR",
    "READ",
    "READTEXT",
    "RECONFIGURE",
    "REFERENCES",
    "REPLICATION",
    "RESTORE",
    "RESTRICT",
    "RETURN",
    "REVERT",
    "REVOKE",
    "RIGHT",
    "ROLLBACK",
    "ROWCOUNT",
    "ROWGUIDCOL",
    "RULE",
    "SAVE",
    "SCHEMA",
    "SELECT",
    "SESSION_USER",
    "SET",
    "SETUSER",
    "SHUTDOWN",
    "SOME",
    "STATISTICS",
    "SYSTEM_USER",
    "TABLE",
    "TABLESAMPLE",
    "TEXTSIZE",
    "THEN",
    "TO",
    "TOP",
    "TRAN",
    "TRANSACTION",
    "TRIGGER",
    "TRUNCATE",
    "TRY_CONVERT",
    "TSEQUAL",
    "UNION",
    "UNIQUE",
    "UNPIVOT",
    "UPDATE",
    "UPDATETEXT",
    "USE",
    "USER",
    "VALUES",
    "VARYING",
    "VIEW",
    "WAITFOR",
    "WHEN",
    "WHERE",
    "WHILE",
    "WITH",
    "WITHIN GROUP",
    "WRITETEXT" /* Agrega más palabras reservadas si es necesario */,
  ];
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

  const [showModalCreateDatabase, setShowModalCreateDatabase] = useState(false);
  const [nameDBCreate, setNameDBCreate] = useState("");
  const [nameDBCreateError, setNameDBCreateError] = useState("");

  const conectar = async (event) => {
    event.preventDefault();

    setConecting(true);

    const result = await createConectionSQL({
      setConection: setConections,
      serverName: serverConection,
      serverUser: userConection,
      serverPassword: passwordConection,
    });

    setConections((prevConnections) => {
      return [...prevConnections, result];
    });
    setConecting(false);
  };

  const desconectar = (index) => {
    const updatedConnections = [...conections];
    updatedConnections.splice(index, 1);
    setConections(updatedConnections); // Actualizar el estado 'conections'
  };

  const GetTablesSQL = async (databaseName, config) => {
    try {
      const result = await tablesSQL({
        database: databaseName,
        configServer: config,
      });

      setConections((prevServers) => {
        const updatedServers = prevServers.map((server) => {
          if (server.serverName === config.server) {
            const updatedDatabases = server.databases.map((database) => {
              if (database.name === databaseName) {
                return {
                  ...database,
                  tables: result,
                };
              }
              return database;
            });
            return {
              ...server,
              databases: updatedDatabases,
            };
          }
          return server;
        });
        return updatedServers;
      });
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  const handleClose = () => setShowModalCreateDatabase(false);
  const handleShow = () => setShowModalCreateDatabase(true);

  const createDataBase = () => {
    if (nameDBCreate === "") {
      setNameDBCreateError("El campo no debe estar vacío");
      return;
    }

    const invalidCharsRegex = /[^a-zA-Z0-9$_]/;

    if (invalidCharsRegex.test(nameDBCreate)) {
      setNameDBCreateError(
        "El nombre de la base de datos contiene caracteres inválidos"
      );
      return;
    }

    // Verificar si el nombre de la base de datos es una palabra reservada

    if (reservedKeywords.includes(nameDBCreate.toUpperCase())) {
      setNameDBCreateError(
        "El nombre de la base de datos es una palabra reservada"
      );
      return;
    }
    setNameDBCreateError("");
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
                <Tabs
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
                    eventKey="tableOptions"
                    title={selectedTable ? selectedTable : "Tabla"}
                    disabled={!selectedTable || !selectedServer}
                  >
                    {selectedTable && selectedConfig && selectedDataBase && (
                      <TableOptions
                        table={selectedTable}
                        config={selectedConfig}
                        database={selectedDataBase}
                      />
                    )}
                  </Tab>
                  <Tab eventKey="create" title="Creación">
                    Tab content for Profile
                  </Tab>
                </Tabs>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div className={styles.sectionConections}>
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
                            <Image src="http://localhost:3000/img/server.png" />
                            {server.serverName}
                          </Accordion.Header>
                          <Accordion.Body eventKey="0">
                            <Table>
                              <tbody>
                                <tr>
                                  <td>
                                    {/* boton crear bases de datos */}
                                    <Image
                                      src="http://localhost:3000/img/addDatabase.png"
                                      onClick={handleShow}
                                    />
                                    <Modal
                                      show={showModalCreateDatabase}
                                      onHide={handleClose}
                                      centered
                                    >
                                      <Modal.Header closeButton>
                                        <Modal.Title>
                                          Crear base de datos
                                        </Modal.Title>
                                      </Modal.Header>
                                      <Modal.Body>
                                        <Form.Control
                                          placeholder="Nombre_de_base_de_datos"
                                          value={nameDBCreate}
                                          onChange={(e) => {
                                            setNameDBCreate(e.target.value);
                                          }}
                                          required
                                          isInvalid={
                                            nameDBCreateError ? true : false
                                          }
                                        />
                                        <Form.Control.Feedback type="invalid">
                                          {nameDBCreateError}
                                        </Form.Control.Feedback>
                                      </Modal.Body>
                                      <Modal.Footer>
                                        <Button
                                          variant="secondary"
                                          onClick={handleClose}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          variant="primary"
                                          onClick={createDataBase}
                                        >
                                          Crear
                                        </Button>
                                      </Modal.Footer>
                                    </Modal>{" "}
                                    {/* boton actualizar */}
                                    <Image src="http://localhost:3000/img/actualizar.png" />
                                  </td>

                                  <td>
                                    {" "}
                                    <Image
                                      src="http://localhost:3000/img/cerrarSesion.png"
                                      onClick={() =>
                                        desconectar(indexConection)
                                      }
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
                                  <Image src="http://localhost:3000/img/database.png" />
                                  {database.name}
                                </Accordion.Header>
                                <Accordion.Body eventKey="0">
                                  <Table>
                                    <tbody>
                                      <tr>
                                        <td>
                                          <Image src="http://localhost:3000/img/addTable.webp" />
                                        </td>
                                      </tr>
                                    </tbody>
                                  </Table>
                                  <Table striped hover>
                                    <tbody>
                                      {database.tables &&
                                      database.tables.length > 0 ? (
                                        database.tables.map((table, index) => (
                                          <tr
                                            key={index}
                                            onClick={() => {
                                              setSelectedTable(table.name);
                                            }}
                                          >
                                            <td>
                                              <Image src="http://localhost:3000/img/table.png" />{" "}
                                              {table.name}
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="2">
                                            Esta base de datos no tiene tablas
                                          </td>
                                        </tr>
                                      )}
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
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};
export default Manager;
