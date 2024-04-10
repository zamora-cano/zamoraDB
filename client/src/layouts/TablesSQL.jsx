import React, { useEffect, useState } from "react";

import { Table } from "react-bootstrap";
import { tablesSQL } from "../functions/httpHelper";
import ConfiguracionesSQL from "./configuracionesSQL";

const TablesSQL = ({ table, config }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await tablesSQL({
          database: table,
          configServer: config,
        });
        setTables(result);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [table, config]);

  return (
    <>
      <Table>
        <tbody>
          <tr>
            <td>
              <Table striped bordered hover>
                <tbody>
                  {tables.length > 0 ? (
                    tables.map((table, index) => (
                      <tr
                        key={index}
                        onClick={() => setSelectedTable(table.name)}
                      >
                        <td>{table.name}</td>
                      </tr>
                    ))
                  ) : (
                    <>No hay ninguna tabla</>
                  )}
                </tbody>
              </Table>
            </td>
            <td>
              {/* <ConfiguracionesSQL
                database={table}
                table={selectedTable}
                config={config}
              /> */}
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};

export default TablesSQL;
