// ResultadosConsulta.js
import React from "react";
import "./ResultadosConsulta.css";

function ResultadosConsulta({ resultadosConsulta }) {
  return (
    <div className="results-table">
      <h2>Resultados de la Consulta</h2>
      {resultadosConsulta.length > 0 ? (
        <div className="table-container">
          {" "}
          {/* Contenedor para la tabla */}
          <table>
            <thead>
              <tr>
                {Object.keys(resultadosConsulta[0]).map((columna, index) => (
                  <th key={index}>{columna}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {resultadosConsulta.map((fila, index) => (
                <tr key={index}>
                  {Object.values(fila).map((valor, indexValor) => (
                    <td key={indexValor}>{valor}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No hay resultados para mostrar.</p>
      )}
    </div>
  );
}

export default ResultadosConsulta;
