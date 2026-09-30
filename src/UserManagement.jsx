
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://clouddesk-brcybrctf6grejfq.eastasia-01.azurewebsites.net";

function UserManagement({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================
  // GET TOKEN
  // =========================

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  // =========================
  // GET USERS
  // =========================

  const getUsers = async () => {
    try {
      const token = getToken();

      const response = await axios.get(
        `${API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      setError(
        error.response?.data?.detail ||
          "Could not load users."
      );
    }
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
  // LOAD DATA
  // =========================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      await Promise.all([
        getUsers(),
        getRoles(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRoleId("");
  };

  // =========================
  // EDIT USER
  // =========================

  const handleEdit = (user) => {
    setEditingUser(user);

    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRoleId(String(user.role?.id || ""));

    setError("");
    setSuccess("");
  };

  // =========================
  // CREATE / UPDATE USER
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (editingUser) {
        // UPDATE USER

        const userData = {
          name: name.trim(),
          email: email.trim(),
          role_id: Number(roleId),
        };

        await axios.put(
          `${API_URL}/users/${editingUser.id}`,
          userData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSuccess(
          "User updated successfully!"
        );
      } else {
        // CREATE USER

        const userData = {
          name: name.trim(),
          email: email.trim(),
          password: password,
          role_id: Number(roleId),
        };

        await axios.post(
          `${API_URL}/users`,
          userData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setSuccess(
          "User created successfully!"
        );
      }

      resetForm();

      await getUsers();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      setError(
        error.response?.data?.detail ||
          "Could not save user."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================
  // DELETE USER
  // =========================

  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const token = getToken();

      await axios.delete(
        `${API_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        "User deleted successfully!"
      );

      await getUsers();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      setError(
        error.response?.data?.detail ||
          "Could not delete user."
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
          Admin User Management
        </h2>

        <p>
          Loading users...
        </p>
      </div>
    );
  }

  return (
    <div className="profile-card">

      <h2>
        Admin User Management
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
          {editingUser
            ? "Edit User"
            : "Create User"}
        </h3>

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Name
            </label>

            <input
              type="text"
              placeholder="Enter user name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          {!editingUser && (
            <div className="form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>
          )}

          <div className="form-group">

            <label>
              Role
            </label>

            <select
              value={roleId}
              onChange={(e) =>
                setRoleId(e.target.value)
              }
              required
            >

              <option value="">
                Select Role
              </option>

              {roles.map((role) => (
                <option
                  key={role.id}
                  value={role.id}
                >
                  {role.name}
                </option>
              ))}

            </select>

          </div>

          <button
            type="submit"
            disabled={formLoading}
          >
            {formLoading
              ? "Saving..."
              : editingUser
              ? "Update User"
              : "Create User"}
          </button>

          {editingUser && (
            <button
              type="button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </form>

      </div>

      {/* ================= USER LIST ================= */}

      <div className="tickets-card">

        <h3>
          Users
        </h3>

        {users.length === 0 ? (
          <p>
            No users found.
          </p>
        ) : (
          <div className="ticket-list">

            {users.map((user) => (
              <div
                className="ticket-item"
                key={user.id}
              >

                <h3>
                  #{user.id} - {user.name}
                </h3>

                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {user.email}
                </p>

                <p>
                  <strong>
                    Role:
                  </strong>{" "}
                  {user.role?.name ||
                    "No role"}
                </p>

                <div className="ticket-info">

                  <button
                    onClick={() =>
                      handleEdit(user)
                    }
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(user.id)
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

export default UserManagement;

