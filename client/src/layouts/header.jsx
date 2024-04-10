import { Outlet } from "react-router-dom";
import style from "../styles/header.module.css";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

const Header = () => {
  return (
    <>
      <Navbar
        collapseOnSelect
        expand="lg"
        className={style.header}
        data-bs-theme="dark"
      >
        <Container>
          <Navbar.Brand href="/">ZamoSQL</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">Inicio</Nav.Link>
              <Nav.Link href="/acerca">Acerca</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link href="/gestor">Crear conexión</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Outlet />
    </>
  );
};
export default Header;
