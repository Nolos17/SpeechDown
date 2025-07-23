import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const activityTypes = [
  { key: "lectura", label: "Juegos de Lectura", emoji: "📖" },
  { key: "pronunciacion", label: "Juegos de Pronunciación", emoji: "🎤" },
  { key: "comprension", label: "Juegos de Comprensión", emoji: "🧩" },
];

export default function Activities() {
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState([]);
  const [parents, setParents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("manual");
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  // Form manual
  const [formManual, setFormManual] = useState({
    title: "",
    content: "",
    created_by: "",
  });

  // Formularios IA separados
  const [formReading, setFormReading] = useState({
    age: "",
    therapist_id: "",
    length: 5,
    theme: "",
  });

  const [formPronunciation, setFormPronunciation] = useState({
    age: "",
    therapist_id: "",
    syllable_type: "",
    count: 10,
  });

  const [formComprehension, setFormComprehension] = useState({
    age: "",
    therapist_id: "",
    question_count: 3,
    theme: "",
  });

  // Cargar usuarios
  const fetchUsers = () => {
    api
      .get("/users/")
      .then((res) => {
        const users = res.data;
        setParents(users.filter((u) => u.role === "parent"));
        setTherapists(users.filter((u) => u.role === "therapist"));
      })
      .catch((err) => console.error("Error al cargar usuarios:", err));
  };

  // Cargar actividades filtradas por tipo
  const fetchActivities = (typeKey) => {
    api
      .get("/activities/")
      .then((res) => {
        const filtered = res.data.filter((a) => a.type === typeKey);
        setActivities(filtered);
      })
      .catch((err) => console.error("Error al cargar actividades:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectType = (typeKey) => {
    setSelectedType(typeKey);
    fetchActivities(typeKey);
  };

  // Abrir modales
  const openManualModal = () => {
    setModalMode("manual");
    setFormManual({ title: "", content: "", created_by: "" });
    setSelectedActivityId(null);
    setShowModal(true);
  };

  const openIAModal = () => {
    setModalMode("ia");
    setSelectedActivityId(null);
    setShowModal(true);
  };

  const openEditModal = (activity) => {
    setModalMode("editar");
    setSelectedActivityId(activity._id);
    setFormManual({
      title: activity.title,
      content: activity.content,
      created_by: activity.created_by || "",
    });
    setShowModal(true);
  };

  // Cambios formularios
  const handleManualChange = (e) => {
    setFormManual({ ...formManual, [e.target.name]: e.target.value });
  };

  // Guardar manual
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const dataToSend = { ...formManual, type: selectedType };
    if (modalMode === "editar") {
      api
        .put(`/activities/${selectedActivityId}`, dataToSend)
        .then(() => {
          fetchActivities(selectedType);
          setShowModal(false);
        })
        .catch((err) => alert("Error al actualizar: " + err.message));
    } else {
      api
        .post("/activities", dataToSend)
        .then(() => {
          fetchActivities(selectedType);
          setShowModal(false);
        })
        .catch((err) =>
          alert("Error al crear: " + (err.response?.data?.error || err.message))
        );
    }
  };

  // Crear IA
  const handleIASubmit = (e) => {
    e.preventDefault();
    let endpoint = "";
    let payload = {};
    if (selectedType === "lectura") {
      endpoint = "/activities/generate/reading";
      payload = formReading;
    } else if (selectedType === "pronunciacion") {
      endpoint = "/activities/generate/pronunciation";
      payload = formPronunciation;
    } else if (selectedType === "comprension") {
      endpoint = "/activities/generate/comprehension";
      payload = formComprehension;
    }

    api
      .post(endpoint, payload)
      .then(() => {
        fetchActivities(selectedType);
        setShowModal(false);
      })
      .catch((err) =>
        alert("Error al generar: " + (err.response?.data?.error || err.message))
      );
  };

  // Eliminar
  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que quieres eliminar esta actividad?")) {
      api
        .delete(`/activities/${id}`)
        .then(() => fetchActivities(selectedType))
        .catch((err) => alert("Error al eliminar: " + err.message));
    }
  };

  return (
    <div className="container py-4">
      <h2>Actividades</h2>
      <div className="row mb-4">
        {activityTypes.map(({ key, label, emoji }) => (
          <div
            key={key}
            className="col-12 col-md-4 mb-3"
            style={{ cursor: "pointer" }}
            onClick={() => handleSelectType(key)}
          >
            <div
              className={`card h-100 ${
                selectedType === key ? "border-primary border-2" : ""
              }`}
            >
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <div style={{ fontSize: "3rem" }}>{emoji}</div>
                <h5 className="card-title mt-2">{label}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedType && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>{activityTypes.find((t) => t.key === selectedType)?.label}</h4>
            <div>
              <button
                className="btn btn-primary me-2"
                onClick={openManualModal}
              >
                Crear manual
              </button>
              <button className="btn btn-secondary" onClick={openIAModal}>
                Crear con IA
              </button>
            </div>
          </div>

          <table className="table table-striped table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Título</th>
                <th>Terapeuta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">
                    No hay actividades
                  </td>
                </tr>
              ) : (
                activities.map((a) => (
                  <tr key={a._id}>
                    <td>{a.title}</td>
                    <td>
                      {therapists.find((t) => t._id === a.created_by)?.name ||
                        "Desconocido"}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => navigate(`/activities/${a._id}`)}
                      >
                        Realizar
                      </button>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => openEditModal(a)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(a._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === "manual"
                    ? "Crear manual"
                    : modalMode === "ia"
                    ? "Crear con IA"
                    : "Editar actividad"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              {(modalMode === "manual" || modalMode === "editar") && (
                <form onSubmit={handleManualSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label>Título</label>
                      <input
                        name="title"
                        className="form-control"
                        value={formManual.title}
                        onChange={handleManualChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label>Contenido</label>
                      <textarea
                        name="content"
                        className="form-control"
                        rows={4}
                        value={formManual.content}
                        onChange={handleManualChange}
                        required
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label>Terapeuta</label>
                      <select
                        name="created_by"
                        className="form-select"
                        value={formManual.created_by}
                        onChange={handleManualChange}
                        required
                      >
                        <option value="">Selecciona un terapeuta</option>
                        {therapists.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {modalMode === "editar" ? "Actualizar" : "Crear"}
                    </button>
                  </div>
                </form>
              )}

              {modalMode === "ia" && (
                <form onSubmit={handleIASubmit}>
                  <div className="modal-body">
                    {selectedType === "lectura" && (
                      <>
                        <div className="mb-3">
                          <label>Edad del niño</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formReading.age}
                            onChange={(e) =>
                              setFormReading({
                                ...formReading,
                                age: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label>Longitud (oraciones)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formReading.length}
                            onChange={(e) =>
                              setFormReading({
                                ...formReading,
                                length: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label>Tema</label>
                          <input
                            className="form-control"
                            value={formReading.theme}
                            onChange={(e) =>
                              setFormReading({
                                ...formReading,
                                theme: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label>Terapeuta</label>
                          <select
                            className="form-select"
                            value={formReading.therapist_id}
                            onChange={(e) =>
                              setFormReading({
                                ...formReading,
                                therapist_id: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">Selecciona un terapeuta</option>
                            {therapists.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {selectedType === "pronunciacion" && (
                      <>
                        <div className="mb-3">
                          <label>Edad del niño</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formPronunciation.age}
                            onChange={(e) =>
                              setFormPronunciation({
                                ...formPronunciation,
                                age: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label>Tipo de sílaba</label>
                          <input
                            className="form-control"
                            value={formPronunciation.syllable_type}
                            onChange={(e) =>
                              setFormPronunciation({
                                ...formPronunciation,
                                syllable_type: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label>Cantidad de palabras</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formPronunciation.count}
                            onChange={(e) =>
                              setFormPronunciation({
                                ...formPronunciation,
                                count: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label>Terapeuta</label>
                          <select
                            className="form-select"
                            value={formPronunciation.therapist_id}
                            onChange={(e) =>
                              setFormPronunciation({
                                ...formPronunciation,
                                therapist_id: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">Selecciona un terapeuta</option>
                            {therapists.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {selectedType === "comprension" && (
                      <>
                        <div className="mb-3">
                          <label>Edad del niño</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formComprehension.age}
                            onChange={(e) =>
                              setFormComprehension({
                                ...formComprehension,
                                age: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label>Tema</label>
                          <input
                            className="form-control"
                            value={formComprehension.theme}
                            onChange={(e) =>
                              setFormComprehension({
                                ...formComprehension,
                                theme: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label>Cantidad de preguntas</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formComprehension.question_count}
                            onChange={(e) =>
                              setFormComprehension({
                                ...formComprehension,
                                question_count: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label>Terapeuta</label>
                          <select
                            className="form-select"
                            value={formComprehension.therapist_id}
                            onChange={(e) =>
                              setFormComprehension({
                                ...formComprehension,
                                therapist_id: e.target.value,
                              })
                            }
                            required
                          >
                            <option value="">Selecciona un terapeuta</option>
                            {therapists.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Crear con IA
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
