import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";

function ModalMiddle({
  children,
  title,
  button,
  secondButtonTxt,
  secondButton,
  loading,
}) {
  const [modalShow, setModalShow] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setModalShow(true)}>
        {button}
      </Button>

      {modalShow && (
        <Modal
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={modalShow} // Agregamos la prop show para controlar la visibilidad del modal
          onHide={() => setModalShow(false)} // Utilizamos la función onHide para manejar el cierre del modal
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              {title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>{children}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalShow(false)}>
              Close
            </Button>
            {secondButtonTxt && secondButton ? (
              loading ? (
                <>cargando</>
              ) : (
                <Button type="submit" onClick={secondButton}>
                  {secondButtonTxt}
                </Button>
              )
            ) : (
              <></>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}

export default ModalMiddle;
