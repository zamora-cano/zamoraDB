import Header from "../layouts/header";
import styles from "../styles/home.module.css";

import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";

const Home = () => {
  return (
    <>
      <Header></Header>
      <section className={`${styles.section} ${styles.firstSection}`}>
        <div>
          <p>ZamoSQL</p>
          <img src="" alt="" />
        </div>
        <div>
          <p>
            Es una herramienta de gestión de bases de datos SQL diseñada para
            satisfacer las necesidades de estudiantes y profesionales de la
            informática. Con ZamoSQL, los usuarios pueden realizar una variedad
            de tareas de administración de bases de datos de manera eficiente y
            sin complicaciones.
          </p>
          <button>Empezar</button>
        </div>
      </section>
      <section className={`${styles.section} ${styles.secondSection}`}>
        <div>Cosas que puede hacer</div>

        <CardGroup>
          <Card>
            <Card.Body>
              <Card.Title>
                {" "}
                <img src="http://localhost:3000/img/server.png" alt="" />{" "}
                Creacion de bases de datos
              </Card.Title>
              <Card.Text>
                This is a wider card with supporting text below as a natural
                lead-in to additional content. This content is a little bit
                longer.
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>
                {" "}
                <img src="http://localhost:3000/img/table.png" alt="" />{" "}
                Creación de tablas
              </Card.Title>
              <Card.Text>
                This card has supporting text below as a natural lead-in to
                additional content.
              </Card.Text>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title>
                {" "}
                <img src="http://localhost:3000/img/validation.png" alt="" />
                Validación de campos
              </Card.Title>
              <Card.Text>
                This is a wider card with supporting text below as a natural
                lead-in to additional content. This card has even longer content
                than the first to show that equal height action.
              </Card.Text>
            </Card.Body>
          </Card>
        </CardGroup>
      </section>
    </>
  );
};
export default Home;
