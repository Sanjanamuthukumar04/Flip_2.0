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
  if (!username.trim()) {
    alert("Username cannot be empty");
    return;
  }
  if (!user || !user.email) return;

  setUpdating(true);
  try {
    // Update using email as the matching condition
    const { data, error } = await supabase
      .from("users")
      .update({ username })
      .eq("email", user.email)  // Changed from id to email
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      alert("Username updated successfully!");
      setUsername(data.username);
      console.log("Updated user:", data);
    } else {
      throw new Error("Update completed but no data returned");
    }
  } catch (error) {
    console.error("Update error:", error);
    alert(`Failed to update username: ${error.message}`);
  } finally {
    setUpdating(false);
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteReviews = async () => {
    const confirm = window.confirm(
      "Are you sure? This will permanently delete all your reviews."
    );
    if (!confirm) return;

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
        <button
          onClick={() => navigate("/home")}
          style={{ ...styles.button, backgroundColor: "#28a745" }}
        >
          Return Home
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
        />
        <button 
          onClick={handleUpdateUsername} 
          style={styles.button}
          disabled={updating}
        >
          {updating ? "Updating..." : "Update"}
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
