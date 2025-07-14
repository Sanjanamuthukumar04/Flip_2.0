export const mockAuth = (username, password) => {
  // Simple mock validation (no backend)
  return username.trim() !== "" && password.trim() !== "";
};