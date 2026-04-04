const nodemailer = require('nodemailer');

// Create transporter once
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email to university admin about a new announcement
 * @param {Object} announcement - populated announcement object
 * @param {string} adminEmail - university admin's email
 */
exports.sendAnnouncementNotification = async (announcement, adminEmail) => {
  const mailOptions = {
    from: `"EthioInternAI" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `New Internship Announcement from ${announcement.fullName}`,
    html: `
      <h2>New Internship Secured</h2>
      <p><strong>Student:</strong> ${announcement.fullName}</p>
      <p><strong>Department:</strong> ${announcement.department}</p>
      <p><strong>Year:</strong> ${announcement.year}</p>
      <p><strong>Internship at:</strong> ${announcement.internship.companyName}</p>
      <p><strong>Bank Account:</strong> ${announcement.bankAccount}</p>
      <p><strong>Acceptance Letter:</strong> <a href="${announcement.acceptanceLetterUrl}">View</a></p>
      <hr />
      <p>Please log in to the admin dashboard to verify and process the stipend.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

/**
 * Send confirmation email to student after announcement submission
 */
exports.sendStudentConfirmation = async (studentEmail, studentName, companyName) => {
  const mailOptions = {
    from: `"EthioInternAI" <${process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: 'Your internship announcement has been received',
    html: `
      <h2>Thank you, ${studentName}!</h2>
      <p>Your announcement for <strong>${companyName}</strong> has been submitted.</p>
      <p>The university admin has been notified. You will receive an update once the stipend process begins.</p>
      <p>Best of luck with your internship!</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};
// new
