import { useState } from "react";
import { Table, Form } from "react-bootstrap";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";

import AceEditor from "react-ace";

const ConsultaSQL = () => {
  const [consulta, setConsulta] = useState(
    "use database name_database; \n select * from name_table"
  );
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>
              Query <button>enviar</button>
            </th>
          </tr>
          <tr>
            <th>
              <AceEditor
                mode="sql"
                theme="crimson_editor"
                value={consulta}
                fontSize={14}
                showPrintMargin
                highlightActiveLine
                onChange={(newValue) => {
                  setConsulta(newValue);
                }}
                setOptions={{
                  enableBasicAutocompletion: true,
                }}
              ></AceEditor>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Resultado</td>
          </tr>
          <tr>
            <td>
              <SyntaxHighlighter language="sql" style={darcula}>
                {consulta}
              </SyntaxHighlighter>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};
export default ConsultaSQL;
