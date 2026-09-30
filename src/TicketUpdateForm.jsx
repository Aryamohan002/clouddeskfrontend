import { useState } from "react";
import axios from "axios";

function TicketUpdateForm({
  ticket,
  onUpdated,
  onLogout,
}) {
  const [title, setTitle] =
    useState(ticket.title);

  const [description, setDescription] =
    useState(ticket.description);

  const [priority, setPriority] =
    useState(ticket.priority);

  const [status, setStatus] =
    useState(ticket.status);

  const [assignedTo, setAssignedTo] =
    useState(
      ticket.assigned_to ?? ""
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      const updateData = {
        title: title.trim(),

        description:
          description.trim(),

        priority: priority,

        status: status,

        assigned_to:
          assignedTo === ""
            ? null
            : Number(assignedTo),
      };

      const response =
        await axios.put(
          `https://clouddesk-brcybrctf6grejfq.eastasia-01.azurewebsites.net/tickets/${ticket.id}`,
          updateData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

      setSuccess(
        "Ticket updated successfully!"
      );

      onUpdated(response.data);

    } catch (error) {
      console.error(error);

      if (
        error.response?.status ===
        401
      ) {
        localStorage.removeItem(
          "access_token"
        );

        onLogout();

        return;
      }

      setError(
        error.response?.data?.detail ||
          "Could not update ticket."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-update-section">

      <h3>
        Update Ticket
      </h3>

      <form
        onSubmit={handleUpdate}
      >

        {/* Title */}

        <div className="form-group">

          <label>
            Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            required
          />

        </div>

        {/* Description */}

        <div className="form-group">

          <label>
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            rows="5"
            required
          />

        </div>

        {/* Priority */}

        <div className="form-group">

          <label>
            Priority
          </label>

          <select
            value={priority}
            onChange={(e) =>
              setPriority(
                e.target.value
              )
            }
          >

            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>

            <option value="Critical">
              Critical
            </option>

          </select>

        </div>

        {/* Status */}

        <div className="form-group">

          <label>
            Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          >

            <option value="Open">
              Open
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Resolved">
              Resolved
            </option>

            <option value="Closed">
              Closed
            </option>

          </select>

        </div>

        {/* Assigned To */}

        <div className="form-group">

          <label>
            Assigned To
          </label>

          <input
            type="number"
            placeholder="IT Support User ID"
            value={assignedTo}
            onChange={(e) =>
              setAssignedTo(
                e.target.value
              )
            }
          />

        </div>

        {/* Submit */}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Update Ticket"}
        </button>

      </form>

      {success && (
        <p className="success-message">
          {success}
        </p>
      )}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

    </div>
  );
}

export default TicketUpdateForm;