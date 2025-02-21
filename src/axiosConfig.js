import axios from "axios";

// Set up global Axios defaults for authentication
axios.defaults.baseURL = "https://goals-app-production-49b0.up.railway.app";
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
axios.defaults.withCredentials = true;
