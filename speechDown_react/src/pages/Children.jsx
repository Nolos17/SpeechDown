import { useEffect, useState } from "react";
import api from "../services/api";

export default function Children() {
  const [children, setChildren] = useState([]);
  const [parents, setParents] = useState([]);
  const [therapists, setTherapists] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [formChild, setFormChild] = useState({
    name: "",
    age: "",
    diagnosis: "",
    parent_id: "",
    therapist_id: "",
    notes: ""
  });
  const [viewChild, setViewChild] = useState(null);

  // Cargar niños
  const fetchChildren = () => {
    api.get("/children/")
      .then((res) => setChildren(res.data))
      .catch((err) => console.error("Error al cargar niños:", err));
  };

  // Cargar usuarios (padres y terapeutas)
  const fetchUsers = () => {
    api.get("/users/")
      .then((res) => {
        const users = res.data;
        setParents(users.filter((u) => u.role === "parent"));
        setTherapists(users.filter((u) => u.role === "therapist"));
      })
      .catch((err) => console.error("Error al cargar usuarios:", err));
  };

  useEffect(() => {
    fetchChildren();
    fetchUsers();
  }, []);

  // Abrir modal nuevo
  const openNewModal = () => {
    setFormChild({
      name: "",
      age: "",
      diagnosis: "",
      parent_id: "",
      therapist_id: "",
      notes: ""
    });
    setSelectedChildId(null);
    setEditMode(false);
    setShowModal(true);
  };

  // Abrir modal editar
  const openEditModal = (child) => {
    setFormChild({
      name: child.name || "",
      age: child.age || "",
      diagnosis: child.diagnosis || "",
      parent_id: child.parent_id || "",
      therapist_id: child.therapist_id || "",
      notes: child.notes || ""
    });
    setSelectedChildId(child._id);
    setEditMode(true);
    setShowModal(true);
  };

  // Abrir modal ver
  const openViewModal = (child) => {
    setViewChild(child);
    setShowViewModal(true);
  };

  // Cambios en formulario
  const handleInputChange = (e) => {
    setFormChild({ ...formChild, [e.target.name]: e.target.value });
  };

  // Guardar
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      api.put(`/children/${selectedChildId}`, formChild)
        .then(() => {
          fetchChildren();
          setShowModal(false);
        })
        .catch((err) =>
          alert("Error al actualizar niño: " + (err.response?.data?.error || err.message))
        );
    } else {
      api.post("/children/", formChild)
        .then(() => {
          fetchChildren();
          setShowModal(false);
        })
        .catch((err) =>
          alert("Error al crear niño: " + (err.response?.data?.error || err.message))
        );
    }
  };

  // Eliminar
  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este niño?")) {
      api.delete(`/children/${id}`)
        .then(() => fetchChildren())
        .catch((err) =>
          alert("Error al eliminar niño: " + (err.response?.data?.error || err.message))
        );
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Niños</h2>
        <button className="btn btn-success" onClick={openNewModal}>
          Nuevo niño
        </button>
      </div>

      <table className="table table-striped table-hover table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Diagnóstico</th>
            <th style={{ width: "220px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {children.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No hay niños registrados.
              </td>
            </tr>
          ) : (
            children.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.age}</td>
                <td>{c.diagnosis}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => openViewModal(c)}
                  >
                    Ver
                  </button>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => openEditModal(c)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(c._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? "Editar niño" : "Nuevo niño"}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formChild.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Edad</label>
                    <input
                      type="number"
                      name="age"
                      className="form-control"
                      value={formChild.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Diagnóstico</label>
                    <input
                      type="text"
                      name="diagnosis"
                      className="form-control"
                      value={formChild.diagnosis}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* SELECT PARENT */}
                  <div className="mb-3">
                    <label className="form-label">Padre</label>
                    <select
                      name="parent_id"
                      className="form-select"
                      value={formChild.parent_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona un padre</option>
                      {parents.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SELECT THERAPIST */}
                  <div className="mb-3">
                    <label className="form-label">Terapeuta</label>
                    <select
                      name="therapist_id"
                      className="form-select"
                      value={formChild.therapist_id}
                      onChange={handleInputChange}
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

                  <div className="mb-3">
                    <label className="form-label">Notas</label>
                    <textarea
                      name="notes"
                      className="form-control"
                      value={formChild.notes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" type="submit">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver */}
      {showViewModal && viewChild && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowViewModal(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Información del niño</h5>
                <button className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Nombre:</strong> {viewChild.name}</p>
                <p><strong>Edad:</strong> {viewChild.age}</p>
                <p><strong>Diagnóstico:</strong> {viewChild.diagnosis}</p>
                <p><strong>Parent ID:</strong> {viewChild.parent_id}</p>
                <p><strong>Therapist ID:</strong> {viewChild.therapist_id}</p>
                <p><strong>Notas:</strong> {viewChild.notes}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
