import { Toast } from "react-bootstrap";

const MakeToast = ({ variant, show, setShow, title, children }) => {
  const toggleShowA = () => setShow(!show);

  return (
    <Toast
      show={show}
      onClose={toggleShowA}
      bg={variant ? variant : ""}
      style={{
        position: "fixed",
        bottom: "20px", // Ajusta la distancia desde la parte inferior de la pantalla
        right: "20px", // Ajusta la distancia desde el lado derecho de la pantalla
        zIndex: "1000", // Ajusta el índice de apilamiento para asegurarse de que el toast esté sobre otros elementos
      }}
      delay={5000}
      autohide
    >
      <Toast.Header>
        <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
        <strong className="me-auto">{title ? title : "Alerta"}</strong>
      </Toast.Header>
      <Toast.Body>{children}</Toast.Body>
    </Toast>
  );
};
export default MakeToast;
