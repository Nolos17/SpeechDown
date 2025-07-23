import { useEffect, useState } from "react";
import axios from "axios";

function Children() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/children/")
      .then((res) => {
        setChildren(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching children:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando niños...</p>;

  return (
    <div>
      <h2>Lista de Niños</h2>
      <ul className="list-group">
        {children.map((child) => (
          <li key={child._id} className="list-group-item">
            {child.name} - Edad: {child.age} - Diagnóstico: {child.diagnosis}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Children;
