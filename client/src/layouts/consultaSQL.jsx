import { useState } from "react";
import { Table, Form } from "react-bootstrap";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";

const ConsultaSQL = () => {
  const [consulta, setConsulta] = useState("use database");
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
              <Form.Control
                as="textarea"
                rows={15}
                onChange={(event) => {
                  setConsulta(event.target.value);
                }}
                value={consulta}
              ></Form.Control>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Resultado</td>
          </tr>
          <tr>
            <td>
              {/* <SyntaxHighlighter language="sql" style={darcula}>
                {consulta}
              </SyntaxHighlighter> */}
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};
export default ConsultaSQL;
