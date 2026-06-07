import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", success: true });

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  const flash = (t, s = true) => {
    setMsg({ text: t, success: s });
    setTimeout(() => setMsg({ text: "", success: true }), 3000);
  };

  const fetchFAQs = () => {
    setLoading(true);
    API.get("/faq/all")
      .then((res) => setFaqs(res.data))
      .catch(() => flash("❌ Failed to load FAQs", false))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFAQs(); }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim())
      return flash("❌ Title and description are required.", false);
    setSaving(true);
    try {
      if (editId) {
        await API.put(`/faq/${editId}`, { title: title.trim(), description: description.trim() });
        flash("✅ FAQ updated!");
      } else {
        await API.post("/faq", { title: title.trim(), description: description.trim() });
        flash("✅ FAQ created!");
      }
      resetForm();
      fetchFAQs();
    } catch (e) {
      flash("❌ " + (e.response?.data?.message || "Failed."), false);
    }
    setSaving(false);
  };

  const startEdit = (faq) => {
    setEditId(faq._id);
    setTitle(faq.title);
    setDescription(faq.description);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleVisibility = async (faq) => {
    try {
      await API.put(`/faq/${faq._id}`, { isVisible: !faq.isVisible });
      flash(`${!faq.isVisible ? "✅ Shown" : "🔕 Hidden"}`);
      fetchFAQs();
    } catch {
      flash("❌ Failed.", false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await API.delete(`/faq/${id}`);
      flash("✅ Deleted");
      if (editId === id) resetForm();
      fetchFAQs();
    } catch {
      flash("❌ Failed.", false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <i className="fas fa-circle-question text-orange-500 text-lg" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">FAQ Manager</h2>
          <p className="text-xs text-gray-400">Create and manage frequently asked questions for users</p>
        </div>
      </div>

      {/* Flash */}
      {msg.text && (
        <div className={`p-3 rounded-xl text-sm font-semibold text-center ${msg.success ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
          <i className={`fas ${editId ? "fa-pen-to-square text-orange-400" : "fa-plus-circle text-orange-400"}`} />
          {editId ? "Edit FAQ" : "Add New FAQ"}
        </h3>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I withdraw my earnings?"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Description / Answer</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a clear and detailed answer..."
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl py-2.5 text-sm transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <><i className="fas fa-spinner fa-spin" /> Saving...</>
            ) : editId ? (
              <><i className="fas fa-check" /> Update FAQ</>
            ) : (
              <><i className="fas fa-plus" /> Add FAQ</>
            )}
          </button>
          {editId && (
            <button
              onClick={resetForm}
              className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl text-sm transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {loading ? "Loading..." : `${faqs.length} FAQ${faqs.length !== 1 ? "s" : ""}`}
        </p>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <i className="fas fa-spinner fa-spin text-2xl" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
            <i className="fas fa-circle-question text-3xl mb-2 block" />
            <p className="text-sm">No FAQs yet. Add your first one above!</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq._id}
              className={`bg-white rounded-2xl border transition-all shadow-sm ${
                faq.isVisible ? "border-gray-100" : "border-dashed border-gray-200 opacity-60"
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gray-800 text-sm">{faq.title}</h4>
                      {!faq.isVisible && (
                        <span className="text-[10px] bg-gray-100 text-gray-400 font-bold px-2 py-0.5 rounded-full">
                          HIDDEN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{faq.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(faq)}
                      className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center transition"
                      title="Edit"
                    >
                      <i className="fas fa-pen text-xs" />
                    </button>
                    <button
                      onClick={() => toggleVisibility(faq)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                        faq.isVisible
                          ? "bg-yellow-50 hover:bg-yellow-100 text-yellow-500"
                          : "bg-green-50 hover:bg-green-100 text-green-500"
                      }`}
                      title={faq.isVisible ? "Hide from users" : "Show to users"}
                    >
                      <i className={`fas ${faq.isVisible ? "fa-eye-slash" : "fa-eye"} text-xs`} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition"
                      title="Delete"
                    >
                      <i className="fas fa-trash text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFAQ;
