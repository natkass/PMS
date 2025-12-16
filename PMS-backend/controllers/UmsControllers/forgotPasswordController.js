const db = require("../../config/db");
const User = db.User;
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Use environment variables for email credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  logger: true,
  debug: true,
  secureConnection: false,
  auth: {
    user: "abdie3313@gmail.com",
    pass: "uttn rnrf nnmp rigs",
  },
  tls: {
    rejectUnAuthorized: true,
  },
});
const handleconsole = async (req, res) => {
  console.log("ums api innnn");
}
const handleforgot = async (req, res) => {
  const email = req.body.email;
  const hash = crypto.randomBytes(16).toString("hex");
  console.log(email, hash);

  try {
    // Save the hash in the database
    const user = await User.findOne({ where: { email } });
    if (user) {
      // Update the user's password reset hash
      user.passwordResetHash = hash;
      await user.save();

      // Create a password reset link
      const link = `http://196.189.247.228/resetPasswordcontainer?email=${email}&hash=${hash}`;

      // Create a message object
      const message = {
        from: "abdie3313@gmail.com",
        to: email,
        subject: "Password Reset",
        text: `Click here to reset your password at ums: ${link}`,
      };

      // Send the email
      transporter.sendMail(message, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
          res
            .status(500)
            .json({ message: "Failed to send email. Please try again later." });
        } else {
          console.log("Email sent successfully:", info);
          res.status(200).send();
        }
      });
    } else {
      res
        .status(404)
        .json({ message: "Account with this email address is not available" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

const handleReset = async (req, res) => {
  const email = req.query.email;
  const identifier = req.query.hash;
  const password = req.body.password;
  console.log(email, identifier);

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user);

    if (user.passwordResetHash !== identifier) {
      return res.status(403).json({ message: "Invalid identifier" });
    }

    const hashedPwd = await bcrypt.hash(password, 6);
    user.password = hashedPwd;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

module.exports = { handleforgot, handleReset , handleconsole};
