
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://clouddesk-brcybrctf6grejfq.eastasia-01.azurewebsites.net";

function RoleManagement({ onLogout }) {
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [editingRole, setEditingRole] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // GET TOKEN
  // =========================

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // =========================
  // GET ROLES
  // =========================

  const getRoles = async () => {
    try {
      const token = getToken();

      const response = await axios.get(
        `${API_URL}/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoles(response.data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      setError(
        error.response?.data?.detail ||
          "Could not load roles."
      );
    }
  };

  // =========================
  // LOAD ROLES
  // =========================

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      setError("");

      await getRoles();

      setLoading(false);
    };

    loadRoles();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setEditingRole(null);
    setName("");
    setDescription("");
  };

  // =========================
  // EDIT ROLE
  // =========================

  const handleEdit = (role) => {
    setEditingRole(role);

    setName(role.name);
    setDescription(role.description || "");

    setError("");
    setSuccess("");
  };

  // =========================
  // CREATE / UPDATE ROLE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      const roleData = {
        name: name.trim(),
        description:
          description.trim() || null,
      };

      if (editingRole) {
        // UPDATE ROLE

        await axios.put(
          `${API_URL}/roles/${editingRole.id}`,
          roleData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSuccess(
          "Role updated successfully!"
        );
      } else {
        // CREATE ROLE

        await axios.post(
          `${API_URL}/roles`,
          roleData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSuccess(
          "Role created successfully!"
        );
      }

      resetForm();

      await getRoles();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      setError(
        error.response?.data?.detail ||
          "Could not save role."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================
  // DELETE ROLE
  // =========================

  const handleDelete = async (roleId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this role?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const token = getToken();

      await axios.delete(
        `${API_URL}/roles/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        "Role deleted successfully!"
      );

      await getRoles();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      setError(
        error.response?.data?.detail ||
          "Could not delete role."
      );
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="profile-card">

        <h2>
          Role Management
        </h2>

        <p>
          Loading roles...
        </p>

      </div>
    );
  }

  return (
    <div className="profile-card">

      <h2>
        Admin Role Management
      </h2>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {success && (
        <p className="success-message">
          {success}
        </p>
      )}

      {/* ================= FORM ================= */}

      <div className="create-ticket-card">

        <h3>
          {editingRole
            ? "Edit Role"
            : "Create Role"}
        </h3>

        <form
          onSubmit={handleSubmit}
        >

          {/* NAME */}

          <div className="form-group">

            <label htmlFor="role-name">
              Role Name
            </label>

            <input
              id="role-name"
              type="text"
              placeholder="Enter role name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

          </div>

          {/* DESCRIPTION */}

          <div className="form-group">

            <label htmlFor="role-description">
              Description
            </label>

            <textarea
              id="role-description"
              placeholder="Enter role description"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows="4"
            />

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={formLoading}
          >
            {formLoading
              ? "Saving..."
              : editingRole
              ? "Update Role"
              : "Create Role"}
          </button>

          {/* CANCEL */}

          {editingRole && (
            <button
              type="button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </form>

      </div>

      {/* ================= ROLE LIST ================= */}

      <div className="tickets-card">

        <h3>
          Roles
        </h3>

        {roles.length === 0 ? (
          <p>
            No roles found.
          </p>
        ) : (
          <div className="ticket-list">

            {roles.map((role) => (
              <div
                className="ticket-item"
                key={role.id}
              >

                <h3>
                  #{role.id} - {role.name}
                </h3>

                <p>
                  <strong>
                    Description:
                  </strong>{" "}
                  {role.description ||
                    "No description"}
                </p>

                {/* ACTIONS */}

                <div className="ticket-info">

                  <button
                    onClick={() =>
                      handleEdit(role)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(role.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default RoleManagement;

