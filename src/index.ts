import app from "./app";

const PORT = parseInt(process.env.PORT || "3000", 10);

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is not set");
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;
