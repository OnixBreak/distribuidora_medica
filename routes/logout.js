const express = require("express");
const router = express.Router();

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error al cerrar sesión:", err);
      return res.redirect("/");
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});
module.exports = router;
