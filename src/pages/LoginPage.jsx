import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          const username = email.split('@')[0];
          const { error: insertError } = await supabase.from('users').insert([
            {
              id: data.user.id,
              email,
              username,
              created_at: new Date().toISOString(),
            },
          ]);
          if (insertError) console.error(insertError.message);
        }

        alert('Registration successful! Please check your email to verify.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        navigate('/home');
      }
    } catch (err) {
      alert(err.message || 'An error occurred');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Flip</h1>
      <p style={styles.subtitle}>Read, Review, Repeat!</p>

      <div style={styles.message}>
        {isRegister ? 'Register a new account' : 'Welcome! Please login'}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </label>

        <label style={styles.label}>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </label>

        <button type="submit" style={styles.button}>
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <button
        onClick={() => setIsRegister(!isRegister)}
        style={{
          ...styles.button,
          backgroundColor: '#6c757d',
          marginTop: '10px',
        }}
      >
        {isRegister ? 'Switch to Login' : 'Switch to Register'}
      </button>
    </div>
  );
}

const whimsicalFont = `"Gloria Hallelujah", cursive`;

const styles = {
  container: {
    maxWidth: '400px',
    margin: '80px auto',
    padding: '20px',
    textAlign: 'center',
    fontFamily: whimsicalFont,
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '3rem',
    marginBottom: '0',
    fontFamily: whimsicalFont,
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginTop: '4px',
    marginBottom: '20px',
    fontFamily: whimsicalFont,
  },
  message: {
    marginBottom: '20px',
    fontSize: '1rem',
    color: '#333',
    fontFamily: whimsicalFont,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    fontFamily: whimsicalFont,
  },
  label: {
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '1rem',
    color: '#333',
    fontFamily: whimsicalFont,
  },
  input: {
    width: '100%',
    padding: '10px 8px',
    marginTop: '6px',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
    fontFamily: whimsicalFont,
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontFamily: whimsicalFont,
  },
};
