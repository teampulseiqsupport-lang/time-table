import { useState } from "react";
import api from "../../services/api";

export default function AddAdmin() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/admin/create-admin", form);
    alert("Admin Created");
  };

  return (
    <div className="p-6">
      <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})} />
      <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
      <input placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
      <button onClick={handleSubmit}>Create Admin</button>
    </div>
  );
}