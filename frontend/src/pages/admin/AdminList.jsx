import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminList() {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    api.get("/admin/admins").then(res => setAdmins(res.data.admins));
  }, []);

  const deleteAdmin = async (id) => {
    await api.delete(`/admin/delete-admin/${id}`);
    setAdmins(admins.filter(a => a._id !== id));
  };

  return (
    <div>
      {admins.map(admin => (
        <div key={admin._id}>
          <p>{admin.name} ({admin.email})</p>
          <button>Edit</button>
          <button onClick={() => deleteAdmin(admin._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}