import { useState } from "react";
import { Table, Button } from "react-bootstrap";

import AceEditor from "react-ace";
import { querySQL } from "../functions/httpHelper";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-crimson_editor";
import "ace-builds/src-noconflict/ext-language_tools";

const ConsultaSQL = ({ config }) => {
  const [consulta, setConsulta] = useState("");
  const [Resultado, setResultado] = useState([]);
  const enviarQuery = async () => {
    const result = await querySQL({ configServer: config, query: consulta });

    if (result.length === 0) {
      setResultado({ message: "Se ha ejecutado correctamente" });
    }
    setResultado(result);
  };
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>
              Query{" "}
              <Button variant="primary" onClick={enviarQuery}>
                enviar
              </Button>
            </th>
          </tr>
          <tr>
            <th>
              <AceEditor
                mode="sql"
                theme="crimson_editor"
                name="sql_editor"
                value={consulta}
                onChange={(newValue) => setConsulta(newValue)}
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: false,
                  showLineNumbers: true,
                  tabSize: 2,
                }}
                style={{ width: "100%", height: "400px" }}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ fontSize: "20px" }}>Resultado</td>
          </tr>
          {Resultado && Resultado.error && (
            <>
              <tr>
                <td>{Resultado.error}</td>
              </tr>
              <tr>
                {Resultado.messageError.lineNumber && (
                  <td>Error en la fila: {Resultado.messageError.lineNumber}</td>
                )}
              </tr>
              <tr>
                <td>
                  {Resultado.messageError.originalError.info.message && (
                    <>
                      Error: {Resultado.messageError.originalError.info.message}
                    </>
                  )}
                </td>
              </tr>
            </>
          )}

          {Resultado && Resultado.message && (
            <div className="results-table">
              {Resultado.message.length > 0 ? (
                <div className="table-container">
                  <Table>
                    <thead>
                      <tr>
                        {Object.keys(Resultado.message[0]).map(
                          (columna, index) => (
                            <th key={index}>{columna}</th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {Resultado.message.map((fila, index) => (
                        <tr key={index}>
                          {Object.values(fila).map((valor, indexValor) => (
                            <td key={indexValor}>{valor}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p>No hay resultados para mostrar.</p>
              )}
            </div>
          )}
        </tbody>
      </Table>
    </>
  );
};
export default ConsultaSQL;
