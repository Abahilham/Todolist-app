const db = require("../config/db");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Didapat dari token JWT
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nama tidak boleh kosong!" });
    }

    // Update nama di database Aiven
    await db.query("UPDATE users SET name = ? WHERE id = ?", [name, userId]);

    res.json({
      message: "Nama profil berhasil diperbarui!",
      newName: name,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui profil: " + error.message });
  }
};
