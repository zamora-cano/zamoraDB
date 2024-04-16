import {
  InsertTableSQL,
  UpdateTableSQL,
  columnsSQL,
  datasSQL,
  deleteColumnSQL,
  deleteTableSQL,
  updateData,
} from "../functions/httpHelper";
import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Table,
  Button,
  Tab,
  Tabs,
  Dropdown,
  ButtonGroup,
  Image,
  Modal,
} from "react-bootstrap";
import MakeToast from "./makeToast";

const TableOptions = ({ table, config, database, reservedKeywords }) => {
  const [nameTable, setNameTable] = useState(table);
  const [nameTableError, setNameTableError] = useState("");
  const [insert, setInsert] = useState([]);

  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("text");
  const [toastTitle, setToastTitle] = useState("title");
  const [toastVariant, setToastVariant] = useState("primary");

  const [enviandoDatos, setEnviandoDatos] = useState(false);
  const [oldcolumns, setOldColums] = useState([]);
  const [columns, setColumns] = useState([
    {
      name: "",
      nameError: "",
      type: "int",
      length: "",
      primaryKeys: false,
      primaryKeyError: false,
      nullables: false,
    },
  ]);

  const [showModal, setShowModal] = useState(false);

  const [datas, setDatas] = useState([]);

  const fetchColumns = useCallback(async () => {
    try {
      const result = await columnsSQL({
        database,
        configServer: config,
        table,
      });
      // Transformar los datos obtenidos al formato deseado
      const transformedColumns = result.map((column) => ({
        name: column.COLUMN_NAME,
        nameError: "",
        type: column.DATA_TYPE,
        length: column.CHARACTER_MAXIMUM_LENGTH
          ? column.CHARACTER_MAXIMUM_LENGTH.toString()
          : "",
        primaryKeys: column.primary_key_column === column.COLUMN_NAME,
        primaryKeyError: false,
        nullables: column.IS_NULLABLE === "YES",
      }));

      setColumns(transformedColumns);
      setOldColums(result);

      setNameTable(table);
    } catch (error) {
      console.error("Error fetching columns:", error);
    }
  }, [database, config, table, setNameTable]);

  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  const handleSelect = async (key) => {
    if (key === "datos") {
      const result = await datasSQL({
        database: database,
        configServer: config,
        table: table,
      });
      setDatas(result);
    }
    if (key === "insert") {
      const newData = columns.map((column) => ({
        name: column.name, // Mantener el nombre existente
        type: column.type, // Mantener el nombre existente
        nullable: column.nullables, // Mantener el nombre existente
        max: column.length, // Mantener el nombre existente
        data: "", // Agregar el campo "dato"
        primaryKeys: column.primaryKeys,
      }));

      // Agregar el nuevo array al estado usando setInsert
      setInsert(newData);
    }
  };

  const AddColums = () => {
    const nuevaColumna = {
      name: "",
      nameError: "",
      type: "int",
      length: "",
      primaryKeys: false,
      primaryKeyError: false,
      nullables: false,
    };

    // Actualiza el estado de columns agregando la nueva columna al arreglo existente
    setColumns([...columns, nuevaColumna]);
  };

  const DropColumn = (index) => {
    // Crea una copia del array de columnas
    const updatedColumns = [...columns];

    // Elimina la columna en el índice dado
    updatedColumns.splice(index, 1);

    // Actualiza el estado con la nueva matriz de columnas
    setColumns(updatedColumns);
  };

  const UpdateColumn = (index, value, type) => {
    const updatedColumns = [...columns]; // Copiar el estado de las columnas
    const columnToUpdate = updatedColumns[index]; // Obtener la columna que se está actualizando

    // Actualizar el valor de la columna según el tipo especificado (nombre, tipo, longitud, etc.)
    columnToUpdate[type] = value;

    // Si se actualiza el tipo de columna, se debe limpiar la longitud
    if (type === "type") {
      columnToUpdate["length"] = ""; // Limpiar la longitud
    }

    // Actualizar el estado 'columns' con la nueva matriz de columnas
    setColumns(updatedColumns);
  };

  const validateName = (e, index) => {
    const name = e.target.value; // Obtener el valor del nombre de la columna

    const updatedColumns = [...columns]; // Copiar el estado de las columnas
    const columnToUpdate = updatedColumns[index]; // Obtener la columna que se está actualizando

    // Validar si el nombre contiene caracteres especiales
    if (/[^a-zA-Z0-9_]/.test(name)) {
      columnToUpdate.nameError =
        "El nombre de la columna no puede contener caracteres especiales.";
    }
    // Validar si el nombre inicia con un número
    else if (/^\d/.test(name)) {
      columnToUpdate.nameError =
        "El nombre de la columna no puede iniciar con un número.";
    } else {
      columnToUpdate.nameError = ""; // Limpiar el mensaje de error si no hay errores
    }

    UpdateColumn(index, name, "name"); // Actualizar el nombre de la columna en el estado
  };

  const validatePrimaryKey = (e, index) => {
    const updatedColumns = [...columns]; // Copiar el estado de las columnas
    const columnToUpdate = updatedColumns[index]; // Obtener la columna que se está actualizando

    const isPrimaryKey = e.target.checked; // Obtener el valor del checkbox antes de la actualización del estado

    UpdateColumn(index, isPrimaryKey, "primaryKeys"); // Actualizar el estado de la columna

    // Verificar si hay más de una columna marcada como clave primaria
    if (updatedColumns.filter((column) => column.primaryKeys).length > 1) {
      // Si hay más de una, marcar todas las columnas como con error de clave primaria
      updatedColumns.forEach((column, i) => {
        if (column.primaryKeys) {
          column.primaryKeyError = true; // Marcar como con error de clave primaria
        }
      });
    } else {
      // Si solo hay una columna marcada como clave primaria, limpiar los errores
      columnToUpdate.primaryKeyError = false; // Limpiar el error de la columna actualizada
      updatedColumns.forEach((column, i) => {
        if (column.primaryKeyError) {
          column.primaryKeyError = false; // Limpiar errores en otras columnas
        }
      });
    }
  };

  const validateTableName = (e) => {
    const newName = e.target.value.trim(); // Eliminar espacios en blanco al principio y al final

    // Validar caracteres inválidos
    const invalidCharacters = /[^\w\d_]/; // Permitido: letras, dígitos y guiones bajos
    if (invalidCharacters.test(newName)) {
      setNameTableError(
        "El nombre de la base de datos solo puede contener letras, dígitos y guiones bajos."
      );
    }

    // Validar longitud
    else if (newName.length > 255) {
      setNameTableError(
        "El nombre de la base de datos no puede tener más de 255 caracteres."
      );
    }

    // Validar palabras reservadas
    else if (reservedKeywords.includes(newName.toUpperCase())) {
      setNameTableError(
        "El nombre de la base de datos no puede ser una palabra reservada."
      );
    } else {
      setNameTableError(""); // No hay errores
    }

    // Si pasa todas las validaciones, establecer el nuevo nombre de la base de datos y limpiar el mensaje de error
    setNameTable(newName);
  };

  const updateTable = async () => {
    setEnviandoDatos(true);

    const updatedColumns = columns.map((column) => {
      let hasError = false;

      // Verificar si el campo 'name' está vacío
      if (column.name === "") {
        // Si está vacío, establecer un mensaje de error en 'nameError'
        column = {
          ...column,
          nameError: "El nombre de la columna no puede estar vacío",
        };
        hasError = true;
      }

      // Verificar si hay error en 'primaryKeyError'
      if (column.primaryKeyError) {
        hasError = true;
      }

      // Si no hay errores, eliminar los campos 'primaryKeyError' y 'nameError'
      if (!hasError && nameTableError === "") {
        const { primaryKeyError, nameError, ...columnWithoutErrors } = column;
        return columnWithoutErrors;
      }

      return column;
    });

    // Verificar si hay errores
    const hasErrors = updatedColumns.some(
      (column) => column.nameError || column.primaryKeyError
    );

    setColumns(updatedColumns);
    // Enviar los datos
    if (!hasErrors && nameTable !== "") {
      const result = await UpdateTableSQL({
        database: database,
        configServer: config,
        name: nameTable,
        columns: columns,
        oldcolumns: oldcolumns,
        table: table,
      });

      if (result.error) {
        setShowToast(true);
        setToastTitle("Error");
        setToastText(result.error);
        setToastVariant("danger");
      }
      if (result.message) {
        setShowToast(true);
        setToastTitle("Mensaje");
        setToastText(result.message);
        setToastVariant("");
      }
    } else {
      setNameTableError("El nombre de la tabla está vacía");
    }
    fetchColumns();

    setEnviandoDatos(false);
  };

  const handleChangeInsert = (e, index) => {
    // Crear una copia del estado insert
    const newInsert = [...insert];

    // Actualizar el objeto en la posición 'index'
    newInsert[index] = {
      ...newInsert[index],
      data: e.target.value, // Agregar datos adicionales aquí
      dataError: "", // Agregar datos adicionales aquí
    };

    // Actualizar el estado insert con el nuevo objeto
    setInsert(newInsert);
  };

  const submitInsert = async () => {
    const hasEmptyNonNullable = insert.some(
      (column) => !column.nullable && column.data === ""
    );

    if (hasEmptyNonNullable) {
      const newData = insert.map((column) => ({
        ...column,
        dataError:
          !column.nullable && column.data === ""
            ? "Este dato no se puede enviar vacío"
            : "",
      }));

      // Actualizar el estado insert con los datos actualizados
      setInsert(newData);

      return;
    }

    const result = await InsertTableSQL({
      database: database,
      configServer: config,
      table: nameTable,
      dataToInsert: insert,
    });

    console.log(result);

    if (result.error) {
      setShowToast(true);
      setToastTitle("Error");
      setToastText(result.error);
      setToastVariant("danger");
    }
    if (result.message) {
      setShowToast(true);
      setToastTitle("Mensaje");
      setToastText(result.message);
      setToastVariant("");
    }

    console.log("Datos enviados correctamente.");
  };

  const deleteData = async (data) => {
    const result = await deleteColumnSQL({
      database: database,
      configServer: config,
      table: table,
      dataColumn: data,
    });

    if (result.error) {
      setShowToast(true);
      setToastTitle("Error");
      setToastText(result.error);
      setToastVariant("danger");
    }
    if (result.message) {
      setShowToast(true);
      setToastTitle("Mensaje");
      setToastText(result.message);
      setToastVariant("");
    }

    const resultData = await datasSQL({
      database: database,
      configServer: config,
      table: table,
    });
    setDatas(resultData);
  };

  const changeUpdate = (index) => {
    const updatedDatas = [...datas]; // Creamos una copia del array datas
    updatedDatas[index] = {
      ...updatedDatas[index],
      modificando: !updatedDatas[index].modificando,
    }; // Actualizamos el objeto en el índice especificado con modificando invertido
    setDatas(updatedDatas); // Actualizamos el estado datas con la nueva copia
  };

  const sendUpdateData = async (data) => {
    const dataToSend = { ...data }; // Copia el objeto para no modificar el original
    delete dataToSend.modificando; // Elimina el campo "modificando"
    const result = await updateData({
      configServer: config,
      database,
      table,
      datatoupdate: dataToSend,
    });

    if (result.error) {
      setShowToast(true);
      setToastTitle("Error");
      setToastText(result.error);
      setToastVariant("danger");
    }
    if (result.message) {
      setShowToast(true);
      setToastTitle("Mensaje");
      setToastText(result.message);
      setToastVariant("");
    }
    const resultData = await datasSQL({
      database: database,
      configServer: config,
      table: table,
    });
    setDatas(resultData);
  };

  const addUpdatedata = (e, index, name) => {
    const updatedDatas = [...datas];
    updatedDatas[index] = {
      ...updatedDatas[index],
      [name]: e.target.value,
    };
    setDatas(updatedDatas); // Actualizamos el estado datas con la nueva copia
  };

  const deleteTable = async () => {
    const result = await deleteTableSQL({
      configServer: config,
      database,
      table,
    });

    if (result.error) {
      setShowToast(true);
      setToastTitle("Error");
      setToastText(result.error);
      setToastVariant("danger");
    }
    if (result.message) {
      setShowToast(true);
      setToastTitle("Mensaje");
      setToastText(result.message);
      setToastVariant("");
      setShowModal(false);
    }
  };

  return (
    <>
      <MakeToast
        title={toastTitle}
        show={showToast}
        setShow={setShowToast}
        variant={toastVariant}
      >
        {toastText}
      </MakeToast>
      <Tabs
        defaultActiveKey="profile"
        id="uncontrolled-tab-example"
        className="mb-3"
        onSelect={handleSelect}
      >
        <Tab eventKey="update" title="Update">
          <Table>
            <thead>
              <tr>
                <th>Nombre:</th>
                <th colSpan={5}>
                  <Form.Control
                    placeholder={table}
                    value={nameTable}
                    onChange={validateTableName}
                    isInvalid={nameTableError ? true : false}
                  />
                  <Form.Control.Feedback type="invalid">
                    {nameTableError ? nameTableError : ""}
                  </Form.Control.Feedback>
                </th>
                <td>
                  <Dropdown as={ButtonGroup}>
                    <Button
                      variant="primary"
                      onClick={updateTable}
                      disabled={enviandoDatos}
                    >
                      Guardar
                    </Button>
                    <Dropdown.Toggle split variant="primary" />
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setShowModal(true)}>
                        Borrar Tabla
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>

                  <Modal
                    show={showModal}
                    onHide={() => {
                      setShowModal(false);
                    }}
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Borrar tabla</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      ¿Está seguro de hacer esto? esta accion no se puede
                      revertir
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowModal(false);
                        }}
                      >
                        Close
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => {
                          deleteTable(false);
                        }}
                      >
                        Borrar
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </td>
              </tr>
              <tr>
                <th>Columnas</th>
                <th colSpan={6}>
                  <Button onClick={AddColums}>Agregar</Button>{" "}
                  <Button variant="secondary" onClick={fetchColumns}>
                    recargar
                  </Button>
                </th>
              </tr>
              <tr>
                <td>#</td>
                <td>Nombre</td>
                <td>Tipo de dato</td>
                <td>Longitud</td>
                <td>Llave primaria</td>
                <td>Nullable</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {columns &&
                columns.length > 0 &&
                columns.map((column, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      {/* nombre */}
                      <Form.Control
                        value={column.name}
                        onChange={(e) => validateName(e, index)}
                        isInvalid={column.nameError ? true : false}
                      />
                      <Form.Control.Feedback type="invalid">
                        {column.nameError ? column.nameError : ""}
                      </Form.Control.Feedback>
                    </td>
                    <td>
                      {/* tipo de datos */}
                      <Form.Select
                        aria-label="SQL Data Types"
                        onChange={(e) =>
                          UpdateColumn(index, e.target.value, "type")
                        }
                        value={column.type}
                      >
                        <optgroup label="Numeric">
                          <option value="int">INT</option>
                          <option value="decimal">DECIMAL</option>
                          <option value="float">FLOAT</option>
                          {/* Agrega más opciones numéricas si es necesario */}
                        </optgroup>
                        <optgroup label="String">
                          <option value="varchar">VARCHAR</option>
                          <option value="char">CHAR</option>
                          <option value="text">TEXT</option>
                          {/* Agrega más opciones de cadenas si es necesario */}
                        </optgroup>
                        <optgroup label="Date/Time">
                          <option value="date">DATE</option>
                          <option value="time">TIME</option>
                          <option value="datetime">DATETIME</option>
                          {/* Agrega más opciones de fecha/hora si es necesario */}
                        </optgroup>
                        {/* Agrega más grupos y opciones según sea necesario */}
                      </Form.Select>
                    </td>
                    <td>
                      {/* longitud */}
                      <Form.Control
                        value={column.length}
                        onChange={(e) => {
                          const value = parseInt(
                            e.target.value.replace(/[+\-e.]/gi, ""), // Se agrega el punto (.) a la expresión regular
                            10
                          );
                          if (value > 255) {
                            UpdateColumn(index, 255, "length");
                          } else if (value >= 0 && value <= 255) {
                            UpdateColumn(index, value, "length");
                          } else {
                            UpdateColumn(index, 0, "length");
                          }
                        }}
                        disabled={
                          column.type !== "varchar" && column.type !== "char"
                        }
                        type="number"
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        label="Primary key"
                        checked={column.primaryKeys}
                        onChange={(e) => {
                          validatePrimaryKey(e, index);
                        }}
                        isInvalid={column.primaryKeyError ? true : false}
                      />
                      <Form.Control.Feedback type="invalid">
                        {column.primaryKeyError ? "Solo puede haber uno" : ""}
                      </Form.Control.Feedback>
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        label="Null"
                        checked={column.nullables}
                        onChange={(e) =>
                          UpdateColumn(index, e.target.checked, "nullables")
                        }
                        disabled={column.primaryKeys}
                      />
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => DropColumn(index)}
                      >
                        Borrar
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="datos" title="Datos">
          <Table bordered striped>
            <thead>
              <tr>
                {columns && columns.length > 0 ? (
                  <>
                    <th>#</th>

                    {columns.map((column, index) => (
                      <th key={index}>{column.name}</th>
                    ))}
                  </>
                ) : (
                  "No hay datos"
                )}
              </tr>
            </thead>
            <tbody>
              {datas &&
                datas.length > 0 &&
                datas.map((data, index) => (
                  <>
                    <tr>
                      <td>{index + 1}</td>
                      {data.modificando
                        ? columns.map((column) => (
                            <td>
                              <Form.Control
                                value={data["new" + column.name]}
                                type={
                                  column.type === "date"
                                    ? "date"
                                    : column.type === "time"
                                    ? "time"
                                    : column.type === "int"
                                    ? "number"
                                    : "text"
                                }
                                onChange={(e) => {
                                  addUpdatedata(e, index, "new" + column.name);
                                }}
                                isInvalid={column.dataError ? true : false}
                                maxLength={column.length}
                              />
                            </td>
                          ))
                        : columns.map((column, index) => (
                            <td key={index}>{data[column.name]}</td>
                          ))}

                      <td>
                        {data.modificando ? (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => changeUpdate(index)}
                            >
                              Cancelar
                            </Button>{" "}
                            <Button
                              variant="primary"
                              onClick={() => sendUpdateData(data)}
                            >
                              Enviar
                            </Button>
                          </>
                        ) : (
                          <Dropdown as={ButtonGroup}>
                            <Button
                              variant="success"
                              onClick={() => {
                                changeUpdate(index);
                              }}
                            >
                              Modificar
                            </Button>

                            <Dropdown.Toggle
                              split
                              variant="success"
                              id="dropdown-split-basic"
                            />

                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => deleteData(data)}>
                                Eliminar
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </td>
                    </tr>
                  </>
                ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="insert" title="Insertar">
          <Table striped bordered>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>datos</th>
              </tr>
            </thead>
            <tbody>
              {columns && columns.length > 0 ? (
                <>
                  {insert.map((column, index) => (
                    <tr key={index}>
                      <td>
                        {column.primaryKeys && (
                          <Image
                            style={{ width: "25px" }}
                            src="./img/clave.png"
                          />
                        )}{" "}
                        {column.name}
                      </td>
                      <td>
                        <Form.Control
                          value={column.data}
                          type={
                            column.type === "date"
                              ? "date"
                              : column.type === "time"
                              ? "time"
                              : column.type === "int"
                              ? "number"
                              : "text"
                          }
                          onChange={(e) => handleChangeInsert(e, index)}
                          isInvalid={column.dataError ? true : false}
                          maxLength={column.max}
                        />
                        <Form.Control.Feedback type="invalid">
                          {column.dataError ? column.dataError : ""}
                        </Form.Control.Feedback>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2}>
                      <Button onClick={submitInsert}>Enviar</Button>
                    </td>
                  </tr>
                </>
              ) : (
                ""
              )}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </>
  );
};

export default TableOptions;

// {
//     "COLUMN_NAME": "cve_aerolineas",
//     "DATA_TYPE": "int",
//     "IS_NULLABLE": "NO",
//     "CHARACTER_MAXIMUM_LENGTH": null,
//     "COLLATION_NAME": null,
//     "primary_key_column": "cve_aerolineas",
// }
