import { columnsSQL, datasSQL } from "../functions/httpHelper";
import React, { useEffect, useState } from "react";
import {
  Form,
  Table,
  Button,
  Tab,
  Tabs,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";

const TableOptions = ({ table, config, database }) => {
  const [columns, setColumns] = useState([]);
  const [datas, setDatas] = useState([]);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const result = await columnsSQL({
          database,
          configServer: config,
          table,
        });
        setColumns(result);
      } catch (error) {
        console.error("Error fetching columns:", error);
      }
    };

    fetchColumns();
  }, [table, config, database]); // El arreglo de dependencias está vacío

  const handleSelect = async (key) => {
    if (key === "datos") {
      const result = await datasSQL({
        database: database,
        configServer: config,
        table: table,
      });
      setDatas(result);
    }
  };

  return (
    <>
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
                  <Form.Control placeholder={table} value={table || ""} />
                </th>
                <td>
                  <Dropdown as={ButtonGroup}>
                    <Button variant="primary">Guardar</Button>
                    <Dropdown.Toggle split variant="primary" />
                    <Dropdown.Menu>
                      <Dropdown.Item>Borrar Tabla</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
              <tr>
                <th>Columnas</th>
                <th colSpan={6}>Agregar</th>
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
              {columns.map((column, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {/* nombre */}
                    <Form.Control
                      placeholder={column.COLUMN_NAME}
                      value={column.COLUMN_NAME || ""}
                    />
                  </td>
                  <td>
                    {/* tipo de datos */}
                    <Form.Select
                      aria-label="SQL Data Types"
                      defaultValue={column.DATA_TYPE}
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
                      placeholder={column.CHARACTER_MAXIMUM_LENGTH}
                      value={column.CHARACTER_MAXIMUM_LENGTH}
                    />
                  </td>
                  <td>
                    <Form.Check
                      type="checkbox"
                      label="Primary key"
                      checked={column.COLUMN_NAME === column.primary_key_column}
                    />
                  </td>
                  <td>
                    <Form.Check
                      type="checkbox"
                      label="Null"
                      checked={column.IS_NULLABLE === "YES"}
                    />
                  </td>
                  <td>
                    <Button variant="danger">Borrar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="datos" title="Datos">
          <Table striped>
            <thead>
              <tr>
                <th>#</th>
                {columns.map((column, index) => (
                  <th>{column.COLUMN_NAME}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datas.map((data, index) => (
                <>
                  <tr>
                    <td>{index + 1}</td>
                    {columns.map((column, index) => (
                      <td>{data[column.COLUMN_NAME]}</td>
                    ))}
                  </tr>
                </>
              ))}
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
