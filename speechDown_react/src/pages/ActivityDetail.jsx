import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import TextToSpeech2 from "../components/TextToSpeech2";

export default function ActivityDetail() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [progress, setProgress] = useState({
    notes: "",
    completed: false,
  });

  // Cargar información de la actividad
  useEffect(() => {
    api
      .get(`/activities/${id}`)
      .then((res) => setActivity(res.data))
      .catch((err) => console.error("Error cargando actividad:", err));
  }, [id]);

  const handleChange = (e) => {
    setProgress({ ...progress, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .post(`/activities/${id}/progress`, progress)
      .then(() => alert("¡Progreso guardado!"))
      .catch((err) => alert("Error al guardar: " + err.message));
  };

  if (!activity) return <p>Cargando actividad...</p>;

  return (
    <div className="container py-4">
      <h2>{activity.title}</h2>
      <p>
        <strong>Terapeuta:</strong> {activity.created_by}
      </p>
      <div className="border p-3 mb-4">
        <p>{activity.content}</p>
        <TextToSpeech2 content={activity.content} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Notas de progreso</label>
          <textarea
            name="notes"
            className="form-control"
            rows={4}
            value={progress.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="completed"
            className="form-check-input"
            checked={progress.completed}
            onChange={(e) =>
              setProgress({ ...progress, completed: e.target.checked })
            }
          />
          <label className="form-check-label">Actividad completada</label>
        </div>

        <button type="submit" className="btn btn-success">
          Guardar progreso
        </button>
      </form>
    </div>
  );
}
