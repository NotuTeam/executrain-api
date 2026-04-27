/** @format */

const nodemailer = require("nodemailer");
const Socmed = require("../socmed/model");
const {
  SMTP_GMAIL_USER,
  SMTP_GMAIL_APP_PASSWORD,
  SMTP_GMAIL_FROM_NAME,
} = require("../../config/var");

const submit_registration = async (req, res) => {
  const {
    full_name,
    company_name,
    email_address,
    phone_number,
    product_name,
    schedule_date,
    schedule_type,
  } = req.body;

  try {
    if (
      !full_name ||
      !company_name ||
      !email_address ||
      !phone_number ||
      !product_name ||
      !schedule_date
    ) {
      return res.status(400).json({
        status: 400,
        message: "Please complete all required fields",
      });
    }

    const salesEmailEntry = await Socmed.findOne({
      socmed_name: "SALES_EMAIL",
    });


    if (!salesEmailEntry?.socmed_link) {
      return res.status(404).json({
        status: 404,
        message: "Sales email is not configured",
      });
    }

    if (!SMTP_GMAIL_USER || !SMTP_GMAIL_APP_PASSWORD) {
      return res.status(500).json({
        status: 500,
        message: "SMTP Gmail credentials are not configured",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_GMAIL_USER,
        pass: SMTP_GMAIL_APP_PASSWORD,
      },
    });

    const scheduleType = schedule_type || "Regular";
    const submittedAt = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    });

    const html = `
      <div style="font-family: Arial, sans-serif; background:#f7f7fb; padding:24px;">
        <div style="max-width:680px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden;">
          <div style="background:#BE0F34; color:#ffffff; padding:16px 20px;">
            <h2 style="margin:0; font-size:20px;">New Schedule Registration</h2>
            <p style="margin:6px 0 0; font-size:13px; opacity:0.95;">Submitted on ${submittedAt}</p>
          </div>

          <div style="padding:20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:10px; border:1px solid #e5e7eb; width:38%; font-weight:600; background:#fafafa;">Full Name</td>
                <td style="padding:10px; border:1px solid #e5e7eb;">${full_name}</td>
              </tr>
              <tr>
                <td style="padding:10px; border:1px solid #e5e7eb; font-weight:600; background:#fafafa;">Company Name</td>
                <td style="padding:10px; border:1px solid #e5e7eb;">${company_name}</td>
              </tr>
              <tr>
                <td style="padding:10px; border:1px solid #e5e7eb; font-weight:600; background:#fafafa;">Email Address</td>
                <td style="padding:10px; border:1px solid #e5e7eb;">${email_address}</td>
              </tr>
              <tr>
                <td style="padding:10px; border:1px solid #e5e7eb; font-weight:600; background:#fafafa;">Phone Number</td>
                <td style="padding:10px; border:1px solid #e5e7eb;">${phone_number}</td>
              </tr>
              <tr>
                <td style="padding:10px; border:1px solid #e5e7eb; font-weight:600; background:#fafafa;">Product Name</td>
                <td style="padding:10px; border:1px solid #e5e7eb;">${product_name}</td>
              </tr>
              <tr>
                <td style="padding:10px; border:1px solid #e5e7eb; font-weight:600; background:#fafafa;">Schedule Date</td>
                <td style="padding:10px; border:1px solid #e5e7eb;">${schedule_date}</td>
              </tr>
              <tr>
                <td style="padding:10px; border:1px solid #e5e7eb; font-weight:600; background:#fafafa;">Schedule Type</td>
                <td style="padding:10px; border:1px solid #e5e7eb;">${scheduleType}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${SMTP_GMAIL_FROM_NAME || "Executrain Website"}" <${SMTP_GMAIL_USER}>`,
      to: salesEmailEntry.socmed_link,
      subject: `[${scheduleType}] Schedule Registration - ${product_name}`,
      html,
      replyTo: email_address,
    });

    return res.status(201).json({
      status: 201,
      message: "Registration submitted successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      status: 500,
      message: "Failed to submit registration",
    });
  }
};

module.exports = {
  submit_registration,
};
