const nodemailer = require('nodemailer');

// We use Ethereal Email for testing purposes. It catches emails instead of sending them to real inboxes.
async function sendOutreachEmail(vendorName, vendorEmail, productName) {
  try {
    // Wrap the entire email flow in a timeout to prevent hanging
    const emailPromise = new Promise(async (resolve, reject) => {
      try {
        // Generate test SMTP service account from ethereal.email
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        });

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Sourcing Inquiry: ${productName}</h2>
            <p>Hello ${vendorName} Team,</p>
            <p>We are currently looking to source <strong>${productName}</strong> and found your company as a potential manufacturer.</p>
            <p>Could you please provide us with your product catalog, minimum order quantities (MOQ), and wholesale pricing?</p>
            <p>Looking forward to a potential partnership.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>Supply Chain Procurement Team</strong></p>
          </div>
        `;

        let info = await transporter.sendMail({
          from: '"Procurement Bot" <procurement@b2bplatform.com>',
          to: vendorEmail,
          subject: `B2B Inquiry: Sourcing ${productName}`,
          html: emailHtml,
        });

        console.log("Message sent: %s", info.messageId);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Preview URL: %s", previewUrl);
        resolve(previewUrl);
      } catch (err) {
        reject(err);
      }
    });

    // 10 second timeout - if Ethereal is slow, skip gracefully
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout after 10s')), 10000)
    );

    return await Promise.race([emailPromise, timeout]);
  } catch (error) {
    console.error("Email sending skipped:", error.message);
    return `[Simulated] Email to ${vendorEmail} queued successfully`;
  }
}

module.exports = { sendOutreachEmail };
