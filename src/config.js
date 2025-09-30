const backendURL = 
  import.meta.env.MODE === "development"
    ? "http://localhost:4000"    // local backend
    : "https://raja-rani-backend-cmbr.onrender.com"; // Render backend

export default backendURL;
