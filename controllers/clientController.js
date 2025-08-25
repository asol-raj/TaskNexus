const pool = require("../config/db");

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM `clients` ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Add new client
exports.addClient = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const [result] = await pool.query(
      "INSERT INTO `clients` (`name`, `email`, `phone`, `address`) VALUES (?, ?, ?, ?)",
      [name, email, phone, address]
    );
    res.status(201).json({ msg: "Client added successfully", client_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM `clients` WHERE `client_id` = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Client not found" });
    }
    res.json({ msg: "Client deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
