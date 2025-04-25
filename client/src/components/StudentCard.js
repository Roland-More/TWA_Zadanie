import { Card, Button, Badge } from "react-bootstrap";

const getCardStatusLabel = (stav) => {
  switch (stav) {
    case 1: return "Aktívna";
    case 2: return "Stratená";
    case 3: return "Vypršaná";
    case 4: return "Vrátená";
    default: return "Neznámy stav";
  }
};

const getStravaTypLabel = (typ) => {
  switch (typ) {
    case 1: return "Raňajky";
    case 2: return "Večera";
    case 3: return "Celá strava";
    default: return "Neznáme";
  }
};

const StudentCard = ({ student, onShowDetails }) => {
  const karta = student.karta;
  const strava = student.strava?.find(s => s.stav === 1); // only active plan

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>{student.meno} {student.priezvisko}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Izba: {student.izba?.cislo || "Nepriradený"}</Card.Subtitle>

        <Card.Text><strong>Email:</strong> {student.email}</Card.Text>
        <Card.Text><strong>Dátum narodenia:</strong> {new Date(student.datum_narodenia).toLocaleDateString()}</Card.Text>

        {karta && (
          <Card.Text>
            <strong>Karta:</strong> {karta.cislo} ({getCardStatusLabel(karta.stav)})<br />
            Platná do: {new Date(karta.platnost_do).toLocaleDateString()}
          </Card.Text>
        )}

        {strava && (
          <Card.Text>
            <strong>Strava:</strong> {getStravaTypLabel(strava.typ)}<br />
            {new Date(strava.zaciatok).toLocaleDateString()} – {new Date(strava.koniec).toLocaleDateString()}
          </Card.Text>
        )}

        <Button variant="primary" onClick={() => onShowDetails(student)}>
          📄 Zobraziť detaily
        </Button>
      </Card.Body>
    </Card>
  );
};
