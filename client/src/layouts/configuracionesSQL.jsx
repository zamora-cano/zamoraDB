import React, { useEffect, useState } from "react";
import {
  Tab,
  Tabs,
  Form,
  Dropdown,
  DropdownButton,
  Table,
} from "react-bootstrap";
import { columnsSQL } from "../functions/httpHelper";

const ConfiguracionesSQL = ({ database, table, config }) => {
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await columnsSQL({
          database: database,
          configServer: config,
          table: table,
        });
        console.log(result);
        setColumns(result);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [table, config, database]);

  return (
    <>
      <Tabs id="uncontrolled-tab-example" className="mb-3">
        <Tab
          eventKey="basico"
          title="Basico"
          disabled={database !== "" ? false : true}
        >
          <Table border>
            <thead>
              <tr>
                <td>#</td>
                <td>Nombre</td>
                <td>Tipo de dato</td>
                <td>Longitud</td>
                <td>Llave Primaria</td>
                <td>Nullable</td>
                <td>Collation</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {columns && columns.length > 0 ? (
                columns.map((column, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <Form.Control
                        placeholder={column.COLUMN_NAME}
                        type="text"
                        value={column.COLUMN_NAME}
                      />
                    </td>
                    <td>
                      <Form.Select>
                        <optgroup label="Enteros">
                          <option
                            value="int"
                            selected={column.DATA_TYPE === "int"}
                          >
                            Int
                          </option>
                          <option
                            value="bigint"
                            selected={column.DATA_TYPE === "bigint"}
                          >
                            Bigint
                          </option>
                          <option
                            value="smallint"
                            selected={column.DATA_TYPE === "smallint"}
                          >
                            Smallint
                          </option>
                        </optgroup>
                        <optgroup label="Decimales">
                          <option
                            value="decimal"
                            selected={column.DATA_TYPE === "decimal"}
                          >
                            Decimal
                          </option>
                          <option
                            value="numeric"
                            selected={column.DATA_TYPE === "numeric"}
                          >
                            Numeric
                          </option>
                          <option
                            value="float"
                            selected={column.DATA_TYPE === "float"}
                          >
                            Float
                          </option>
                          <option
                            value="real"
                            selected={column.DATA_TYPE === "real"}
                          >
                            Real
                          </option>
                        </optgroup>
                        <optgroup label="Caracteres">
                          <option
                            value="char"
                            selected={column.DATA_TYPE === "char"}
                          >
                            Char
                          </option>
                          <option
                            value="varchar"
                            selected={column.DATA_TYPE === "varchar"}
                          >
                            Varchar
                          </option>
                          <option
                            value="text"
                            selected={column.DATA_TYPE === "text"}
                          >
                            Text
                          </option>
                          <option
                            value="nvarchar"
                            selected={column.DATA_TYPE === "nvarchar"}
                          >
                            Nvarchar
                          </option>
                          <option
                            value="ntext"
                            selected={column.DATA_TYPE === "ntext"}
                          >
                            Ntext
                          </option>
                        </optgroup>
                        <optgroup label="Fecha y Hora">
                          <option
                            value="date"
                            selected={column.DATA_TYPE === "date"}
                          >
                            Date
                          </option>
                          <option
                            value="time"
                            selected={column.DATA_TYPE === "time"}
                          >
                            Time
                          </option>
                          <option
                            value="datetime"
                            selected={column.DATA_TYPE === "datetime"}
                          >
                            Datetime
                          </option>
                          <option
                            value="timestamp"
                            selected={column.DATA_TYPE === "timestamp"}
                          >
                            Timestamp
                          </option>
                        </optgroup>
                        <optgroup label="Otros">
                          <option
                            value="bit"
                            selected={column.DATA_TYPE === "bit"}
                          >
                            Bit
                          </option>
                          <option
                            value="boolean"
                            selected={column.DATA_TYPE === "boolean"}
                          >
                            Boolean
                          </option>
                          <option
                            value="binary"
                            selected={column.DATA_TYPE === "binary"}
                          >
                            Binary
                          </option>
                          <option
                            value="varbinary"
                            selected={column.DATA_TYPE === "varbinary"}
                          >
                            Varbinary
                          </option>
                          <option
                            value="image"
                            selected={column.DATA_TYPE === "image"}
                          >
                            Image
                          </option>
                          <option
                            value="xml"
                            selected={column.DATA_TYPE === "xml"}
                          >
                            Xml
                          </option>
                        </optgroup>
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        placeholder={column.CHARACTER_MAXIMUM_LENGTH}
                        type="text"
                        value={column.CHARACTER_MAXIMUM_LENGTH}
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        label=""
                        defaultChecked={
                          column.primary_key_column === column.COLUMN_NAME
                        }
                      />
                    </td>
                    <td>
                      <Form.Check
                        type="checkbox"
                        label=""
                        defaultChecked={column.IS_NULLABLE === "YES"}
                      />
                    </td>
                    <td>
                      <Form.Control
                        placeholder={column.COLLATION_NAME}
                        type="text"
                        value={column.COLLATION_NAME}
                      />
                    </td>
                    <td>
                      <DropdownButton variant="primary" title="Opciones">
                        <Dropdown.Item>Action</Dropdown.Item>
                        <Dropdown.Item>Another action</Dropdown.Item>
                        <Dropdown.Item>Something else here</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item>Borrar</Dropdown.Item>
                      </DropdownButton>
                    </td>

                    {/* <p>Foreign Key Column: {column.foreign_key_column}</p>
                <p>Foreign Key Name: {column.foreign_key_name}</p>
                <p>Referenced Table: {column.referenced_table}</p> */}
                  </tr>
                ))
              ) : (
                <>No se ha seleccionado ninguna tabla</>
              )}{" "}
            </tbody>
          </Table>
        </Tab>
        <Tab
          eventKey="datos"
          title="Datos"
          disabled={database !== "" ? false : true}
        >
          datos de: {database}
        </Tab>
      </Tabs>
    </>
  );
};

export default ConfiguracionesSQL;
