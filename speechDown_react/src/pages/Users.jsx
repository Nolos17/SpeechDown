import { useEffect, useState } from "react";
import api from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formUser, setFormUser] = useState({ name: "", email: "", role: "" });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const roles = ["parent", "therapist"];

  // Carga usuarios
  const fetchUsers = () => {
    api
      .get("/users/")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Abrir modal para nuevo usuario
  const openNewModal = () => {
    setFormUser({ name: "", email: "", role: "" });
    setSelectedUserId(null);
    setEditMode(false);
    setShowModal(true);
  };

  // Abrir modal para editar usuario
  const openEditModal = (user) => {
    setFormUser({ name: user.name, email: user.email, role: user.role });
    setSelectedUserId(user._id);
    setEditMode(true);
    setShowModal(true);
  };

  // Manejar input formulario
  const handleInputChange = (e) => {
    setFormUser({ ...formUser, [e.target.name]: e.target.value });
  };

  // Guardar usuario (crear o actualizar)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      // Actualizar usuario
      api
        .put(`/users/${selectedUserId}`, formUser)
        .then(() => {
          fetchUsers();
          setShowModal(false);
        })
        .catch((err) => alert("Error al actualizar: " + err.message));
    } else {
      // Crear usuario
      api
        .post("/users", formUser)
        .then(() => {
          fetchUsers();
          setShowModal(false);
        })
        .catch((err) =>
          alert("Error al crear: " + (err.response?.data?.error || err.message))
        );
    }
  };

  // Eliminar usuario
  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este usuario?")) {
      api
        .delete(`/users/${id}`)
        .then(() => fetchUsers())
        .catch((err) => alert("Error al eliminar: " + err.message));
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Usuarios</h2>
        <button className="btn btn-success" onClick={openNewModal}>
          Nuevo usuario
        </button>
      </div>

      <table className="table table-striped table-hover table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th style={{ width: "180px" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No hay usuarios disponibles.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => openEditModal(u)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(u._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? "Editar usuario" : "Nuevo usuario"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={formUser.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formUser.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">
                      Rol
                    </label>
                    <select
                      id="role"
                      name="role"
                      className="form-select"
                      value={formUser.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona un rol</option>
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
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
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
