import { useState, useEffect } from "react";
import { Form, Table, Tab, Tabs, Button } from "react-bootstrap";
import MakeToast from "./makeToast";
import { CreateTableSQL } from "../functions/httpHelper";

const CreacionSQL = ({ selectedDatabase, reservedKeywords, config }) => {
  const [database, setDatabase] = useState("");
  const [nameTable, setNameTable] = useState("");
  const [nameTableError, setNameTableError] = useState("");

  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("text");
  const [toastTitle, setToastTitle] = useState("title");
  const [toastVariant, setToastVariant] = useState("primary");

  const [enviandoDatos, setEnviandoDatos] = useState(false);
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

  useEffect(() => {
    setDatabase(selectedDatabase);
  }, [selectedDatabase]);

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

  const createTable = async () => {
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
      const result = await CreateTableSQL({
        database: selectedDatabase,
        configServer: config,
        name: nameTable,
        columns,
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
    } else {
      setNameTableError("El nombre de la tabla está vacía");
    }
    setEnviandoDatos(false);
  };

  return (
    <>
      <MakeToast
        variant={toastVariant}
        show={showToast}
        setShow={setShowToast}
        title={toastTitle}
      >
        {toastText}
      </MakeToast>
      <Tabs>
        <Tab eventKey="table" title="Tabla">
          <Table>
            <thead>
              <tr>
                <th colSpan={6}>
                  {database !== ""
                    ? "Creación de una tabla para: " + database
                    : "No se ha seleccionado una base de datos"}
                </th>
              </tr>
              <tr>
                <th>Nombre:</th>
                <th colSpan={5}>
                  <Form.Control
                    value={nameTable}
                    onChange={validateTableName}
                    isInvalid={nameTableError ? true : false}
                  />
                  <Form.Control.Feedback type="invalid">
                    {nameTableError ? nameTableError : ""}
                  </Form.Control.Feedback>
                </th>
                <td>
                  {enviandoDatos ? (
                    <Button variant="primary" disabled onClick={createTable}>
                      Enviando...
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={createTable}>
                      Crear
                    </Button>
                  )}
                </td>
              </tr>
              <tr>
                <th>Columnas</th>
                <th colSpan={6}>
                  <Button onClick={AddColums}>Agregar</Button>
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
                        value={column.primaryKeys}
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
                        value={column.nullables}
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

        <Tab eventKey="datos" title="datos">
          insertar datos
        </Tab>
      </Tabs>
    </>
  );
};

export default CreacionSQL;
