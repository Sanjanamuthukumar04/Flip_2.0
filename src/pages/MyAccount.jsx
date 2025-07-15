import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function MyAccount() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      navigate("/login");
      return;
    }
    setUser(data.user);
    await ensureUserInDB(data.user);
    fetchUsername(data.user.id);
    fetchReviews(data.user.email);
  };

  const ensureUserInDB = async (user) => {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id);

    if (error) {
      console.error("Error checking user:", error);
      return;
    }

    if (!data || data.length === 0) {
      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        username: user.email.split("@")[0],
      });
      if (insertError) {
        console.error("Error creating user:", insertError);
      }
    }
  };

  const fetchUsername = async (id) => {
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching username:", error);
      return;
    }
    if (data) setUsername(data.username);
  };

  const fetchReviews = async (email) => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
    } else {
      setReviews(data);
    }
    setLoading(false);
  };

  const handleUpdateUsername = async () => {
    const newUsername = username.trim();
    if (!newUsername) {
      alert("Username cannot be empty.");
      return;
    }
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ username: newUsername })
        .eq("id", user.id);

      if (error) {
        if (
          error.message.includes("duplicate key value") ||
          error.message.toLowerCase().includes("unique")
        ) {
          alert("Username already taken. Please choose another.");
        } else {
          alert(`Failed to update username: ${error.message}`);
        }
        return;
      }

      alert("Username updated successfully!");
    } catch (err) {
      alert(`Unexpected error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteReviews = async () => {
    const confirmDelete = window.confirm(
      "Are you sure? This will permanently delete all your reviews."
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("user_email", user.email);

    if (error) {
      alert("Failed to delete reviews.");
      console.error("Delete error:", error);
      return;
    }

    alert("All your reviews have been deleted.");
    fetchReviews(user.email);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>My Account</h1>
        <button onClick={() => navigate("/home")} style={styles.iconButton}>
          <img
            src="/pics/home.webp"
            alt="home"
            style={{ width: "55px", height: "50px" }}
          />
        </button>
      </div>

      <div style={styles.section}>
        <h2>Username</h2>
        <p>Current username: {username}</p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          placeholder="Enter new username"
          maxLength={20}
        />
        <button
          onClick={handleUpdateUsername}
          style={styles.button}
          disabled={updating}
        >
          {updating ? "Updating..." : "Update Username"}
        </button>
      </div>

      <div style={styles.section}>
        <h2>My Reviews</h2>
        {reviews.length === 0 ? (
          <p>You haven't left any reviews yet.</p>
        ) : (
          <ul>
            {reviews.map((review) => (
              <li key={review.id} style={styles.reviewItem}>
                <span
                  style={{ cursor: "pointer", color: "blue" }}
                  onClick={() => navigate(`/book/${review.book_id}`)}
                >
                  {review.content.slice(0, 50)}...
                </span>{" "}
                <small>({review.created_at.split("T")[0]})</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.buttonGroup}>
          <button onClick={handleLogout} style={styles.button}>
            Log Out
          </button>
          <button
            onClick={handleDeleteReviews}
            style={{ ...styles.button, backgroundColor: "red" }}
          >
            Delete All Reviews
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    fontFamily: "sans-serif",
  },
  iconButton: {
    backgroundColor: "white",
    borderRadius: "50px",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "30px",
  },
  input: {
    padding: "8px",
    fontSize: "1rem",
    width: "100%",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    marginTop: "10px",
  },
  reviewItem: {
    marginBottom: "10px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
};
