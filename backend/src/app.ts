import express from "express";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
export default app;
