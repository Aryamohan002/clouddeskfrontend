
import { useEffect, useState } from "react";
import axios from "axios";
import TicketUpdateForm from "./TicketUpdateForm";
import UserManagement from "./UserManagement";
import RoleManagement from "./RoleManagement";

const API_URL = "https://clouddesk-brcybrctf6grejfq.eastasia-01.azurewebsites.net";

function Dashboard({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [loading, setLoading] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false);

  const [creatingTicket, setCreatingTicket] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");

  const [error, setError] = useState("");
  const [ticketError, setTicketError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    onLogout();
  };

  const getProfile = async (token) => {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setProfile(response.data);
  };

  const getTickets = async (
    token,
    status = filterStatus,
    priorityValue = filterPriority
  ) => {
    setTicketLoading(true);
    setTicketError("");

    try {
      const response = await axios.get(`${API_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          status: status || undefined,
          priority: priorityValue || undefined,
        },
      });

      setTickets(response.data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      setTicketError(
        error.response?.data?.detail ||
          "Could not load tickets."
      );
    } finally {
      setTicketLoading(false);
    }
  };

  const getComments = async (ticketId) => {
    setCommentLoading(true);
    setCommentError("");

    try {
      const token = getToken();

      const response = await axios.get(
        `${API_URL}/tickets/${ticketId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(response.data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      setCommentError(
        error.response?.data?.detail ||
          "Could not load comments."
      );
    } finally {
      setCommentLoading(false);
    }
  };

  const getTicketDetails = async (ticketId) => {
    setTicketDetailsLoading(true);
    setTicketError("");
    setCommentError("");
    setComments([]);

    try {
      const token = getToken();

      const response = await axios.get(
        `${API_URL}/tickets/${ticketId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedTicket(response.data);

      await getComments(ticketId);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      setTicketError(
        error.response?.data?.detail ||
          "Could not load ticket details."
      );
    } finally {
      setTicketDetailsLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    setTicketError("");
    setSuccessMessage("");
    setCreatingTicket(true);

    try {
      const token = getToken();

      const ticketData = {
        title: title.trim(),
        description: description.trim(),
        priority: priority,
        assigned_to:
          assignedTo === ""
            ? null
            : Number(assignedTo),
      };

      await axios.post(
        `${API_URL}/tickets`,
        ticketData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage(
        "Ticket created successfully!"
      );

      setTitle("");
      setDescription("");
      setPriority("Medium");
      setAssignedTo("");

      await getTickets(
        token,
        filterStatus,
        filterPriority
      );
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      setTicketError(
        error.response?.data?.detail ||
          "Could not create ticket."
      );
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (
      !selectedTicket ||
      !commentText.trim()
    ) {
      return;
    }

    setCommentSubmitting(true);
    setCommentError("");

    try {
      const token = getToken();

      await axios.post(
        `${API_URL}/tickets/${selectedTicket.id}/comments`,
        {
          comment: commentText.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCommentText("");
      setCommentError("");

      await getComments(selectedTicket.id);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        onLogout();
        return;
      }

      if (error.response?.status === 403) {
        setCommentError(
          "You do not have permission to add comments."
        );
        return;
      }

      setCommentError(
        error.response?.data?.detail ||
          "Could not add comment."
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleStatusFilter = (e) => {
    const value = e.target.value;

    setFilterStatus(value);

    const token = getToken();

    getTickets(
      token,
      value,
      filterPriority
    );
  };

  const handlePriorityFilter = (e) => {
    const value = e.target.value;

    setFilterPriority(value);

    const token = getToken();

    getTickets(
      token,
      filterStatus,
      value
    );
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterPriority("");

    const token = getToken();

    getTickets(
      token,
      "",
      ""
    );
  };

  const closeTicketDetails = () => {
    setSelectedTicket(null);
    setComments([]);
    setCommentText("");
    setCommentError("");
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const token = getToken();

        if (!token) {
          onLogout();
          return;
        }

        await getProfile(token);

        await getTickets(
          token,
          "",
          ""
        );
      } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
          localStorage.removeItem(
            "access_token"
          );

          onLogout();
          return;
        }

        setError(
          "Could not load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">
          <p>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-card">

          <h2>
            Error
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </div>
    );
  }

  const userRole =
    profile?.role || "User";

  const canManageTickets =
    userRole === "Admin" ||
    userRole === "IT Support";

  const canAddComment =
    userRole === "Admin" ||
    userRole === "IT Support";

  const isAdmin =
    userRole === "Admin";

  return (
    <div className="dashboard-page">

      {/* Dashboard Header */}

      <div className="dashboard-header">

        <div>
          <h1>
            Clouddesk
          </h1>

          <p>
            Helpdesk Management System
          </p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

      <div className="dashboard-content">

        {/* Welcome */}

        <div className="welcome-card">

          <h2>
            Welcome, {profile?.name}!
          </h2>

          <p>
            You are successfully logged in.
          </p>

        </div>

        {/* Profile */}

        <div className="profile-card">

          <h2>
            My Profile
          </h2>

          <p>
            <strong>
              User ID:
            </strong>{" "}
            {profile?.user_id}
          </p>

          <p>
            <strong>
              Name:
            </strong>{" "}
            {profile?.name}
          </p>

          <p>
            <strong>
              Email:
            </strong>{" "}
            {profile?.email}
          </p>

          <p>
            <strong>
              Role:
            </strong>{" "}
            {profile?.role}
          </p>

        </div>

        {/* Access Information */}

        <div className="profile-card">

          <h2>
            Your Access
          </h2>

          {userRole === "User" && (
            <p>
              You can create tickets,
              view your tickets, view
              ticket details, and view
              comments on your tickets.
            </p>
          )}

          {userRole === "IT Support" && (
            <p>
              You can manage tickets,
              view tickets, update
              tickets, and add comments.
            </p>
          )}

          {userRole === "Admin" && (
            <p>
              You have administrator
              access. You can manage
              tickets, users, roles,
              and comments.
            </p>
          )}

        </div>

        {/* Create Ticket */}

        <div className="create-ticket-card">

          <h2>
            Create Ticket
          </h2>

          <form
            onSubmit={handleCreateTicket}
          >

            <div className="form-group">

              <label htmlFor="ticket-title">
                Title
              </label>

              <input
                id="ticket-title"
                type="text"
                placeholder="Enter ticket title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="ticket-description">
                Description
              </label>

              <textarea
                id="ticket-description"
                placeholder="Describe your issue"
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

            <div className="form-group">

              <label htmlFor="ticket-priority">
                Priority
              </label>

              <select
                id="ticket-priority"
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

            <div className="form-group">

              <label htmlFor="assigned-to">
                Assigned To
              </label>

              <input
                id="assigned-to"
                type="number"
                placeholder="IT Support User ID (optional)"
                value={assignedTo}
                onChange={(e) =>
                  setAssignedTo(
                    e.target.value
                  )
                }
              />

              <small>
                Leave empty if you
                don't want to assign
                the ticket yet.
              </small>

            </div>

            <button
              type="submit"
              disabled={creatingTicket}
            >
              {creatingTicket
                ? "Creating..."
                : "Create Ticket"}
            </button>

          </form>

          {successMessage && (
            <p className="success-message">
              {successMessage}
            </p>
          )}

          {ticketError && (
            <p className="error-message">
              {ticketError}
            </p>
          )}

        </div>

        {/* Admin User Management */}

        {isAdmin && (
          <UserManagement
            onLogout={onLogout}
          />
        )}

        {/* Admin Role Management */}

        {isAdmin && (
          <RoleManagement
            onLogout={onLogout}
          />
        )}

        {/* Ticket Details Loading */}

        {ticketDetailsLoading && (
          <div className="ticket-details-card">

            <p>
              Loading ticket details...
            </p>

          </div>
        )}

        {/* Selected Ticket Details */}

        {selectedTicket && (
          <div className="ticket-details-card">

            <h2>
              Ticket #{selectedTicket.id}
            </h2>

            <h3>
              {selectedTicket.title}
            </h3>

            <p>
              <strong>
                Description:
              </strong>
            </p>

            <p>
              {selectedTicket.description}
            </p>

            <div className="ticket-detail-row">

              <p>
                <strong>
                  Priority:
                </strong>{" "}
                {selectedTicket.priority}
              </p>

              <p>
                <strong>
                  Status:
                </strong>{" "}
                {selectedTicket.status}
              </p>

            </div>

            <div className="ticket-detail-row">

              <p>
                <strong>
                  Created By:
                </strong>{" "}
                {selectedTicket.created_by}
              </p>

              <p>
                <strong>
                  Assigned To:
                </strong>{" "}
                {selectedTicket.assigned_to ??
                  "Not assigned"}
              </p>

            </div>

            <div className="ticket-detail-row">

              <p>
                <strong>
                  Created At:
                </strong>{" "}
                {selectedTicket.created_at
                  ? new Date(
                      selectedTicket.created_at
                    ).toLocaleString()
                  : "N/A"}
              </p>

              <p>
                <strong>
                  Updated At:
                </strong>{" "}
                {selectedTicket.updated_at
                  ? new Date(
                      selectedTicket.updated_at
                    ).toLocaleString()
                  : "N/A"}
              </p>

            </div>

            {/* Ticket Update */}

            {canManageTickets && (
              <TicketUpdateForm
                ticket={selectedTicket}
                onUpdated={(updatedTicket) => {
                  setSelectedTicket(
                    updatedTicket
                  );

                  const token =
                    getToken();

                  getTickets(
                    token,
                    filterStatus,
                    filterPriority
                  );
                }}
                onLogout={onLogout}
              />
            )}

            {/* Comments */}

            <div className="comments-section">

              <h3>
                Comments
              </h3>

              {commentLoading && (
                <p>
                  Loading comments...
                </p>
              )}

              {commentError && (
                <p className="error-message">
                  {commentError}
                </p>
              )}

              {!commentLoading &&
                !commentError &&
                comments.length === 0 && (
                  <p>
                    No comments yet.
                  </p>
                )}

              {!commentLoading &&
                comments.length > 0 && (
                  <div className="comments-list">

                    {comments.map(
                      (comment) => (
                        <div
                          className="comment-item"
                          key={comment.id}
                        >

                          <div className="comment-header">

                            <strong>
                              {comment.user_name}
                            </strong>

                            <span>
                              {comment.created_at
                                ? new Date(
                                    comment.created_at
                                  ).toLocaleString()
                                : ""}
                            </span>

                          </div>

                          <p>
                            {comment.comment}
                          </p>

                        </div>
                      )
                    )}

                  </div>
                )}

              {/* Add Comment */}

              {canAddComment && (
                <div className="add-comment-section">

                  <h3>
                    Add Comment
                  </h3>

                  <form
                    onSubmit={
                      handleAddComment
                    }
                  >

                    <textarea
                      value={commentText}
                      onChange={(e) =>
                        setCommentText(
                          e.target.value
                        )
                      }
                      placeholder="Write your comment..."
                      rows="4"
                      required
                    />

                    <button
                      type="submit"
                      disabled={
                        commentSubmitting ||
                        !commentText.trim()
                      }
                    >
                      {commentSubmitting
                        ? "Adding..."
                        : "Add Comment"}
                    </button>

                  </form>

                </div>
              )}

              {!canAddComment && (
                <p>
                  Only IT Support and
                  Admin users can add
                  comments.
                </p>
              )}

            </div>

            <button
              className="back-button"
              onClick={
                closeTicketDetails
              }
            >
              Back to Tickets
            </button>

          </div>
        )}

        {/* Tickets */}

        <div className="tickets-card">

          <div className="tickets-header">

            <h2>
              My Tickets
            </h2>

            <button
              onClick={() => {
                const token =
                  getToken();

                getTickets(
                  token,
                  filterStatus,
                  filterPriority
                );
              }}
            >
              Refresh
            </button>

          </div>

          {/* Filters */}

          <div className="ticket-filters">

            <div className="filter-group">

              <label htmlFor="status-filter">
                Status
              </label>

              <select
                id="status-filter"
                value={filterStatus}
                onChange={
                  handleStatusFilter
                }
              >

                <option value="">
                  All Statuses
                </option>

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

            <div className="filter-group">

              <label htmlFor="priority-filter">
                Priority
              </label>

              <select
                id="priority-filter"
                value={filterPriority}
                onChange={
                  handlePriorityFilter
                }
              >

                <option value="">
                  All Priorities
                </option>

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

            <div className="filter-group">

              <label>
                &nbsp;
              </label>

              <button
                className="clear-filter-button"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>

            </div>

          </div>

          {/* Ticket Loading */}

          {ticketLoading && (
            <p>
              Loading tickets...
            </p>
          )}

          {/* Ticket Error */}

          {ticketError && (
            <p className="error-message">
              {ticketError}
            </p>
          )}

          {/* No Tickets */}

          {!ticketLoading &&
            !ticketError &&
            tickets.length === 0 && (
              <p>
                No tickets found.
              </p>
            )}

          {/* Ticket List */}

          {!ticketLoading &&
            tickets.length > 0 && (
              <div className="ticket-list">

                {tickets.map(
                  (ticket) => (
                    <div
                      className="ticket-item"
                      key={ticket.id}
                    >

                      <h3>
                        #{ticket.id} -{" "}
                        {ticket.title}
                      </h3>

                      <p>
                        {ticket.description}
                      </p>

                      <div className="ticket-info">

                        <span>
                          <strong>
                            Priority:
                          </strong>{" "}
                          {ticket.priority}
                        </span>

                        <span>
                          <strong>
                            Status:
                          </strong>{" "}
                          {ticket.status}
                        </span>

                      </div>

                      <button
                        className="details-button"
                        onClick={() =>
                          getTicketDetails(
                            ticket.id
                          )
                        }
                      >
                        View Details
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;

