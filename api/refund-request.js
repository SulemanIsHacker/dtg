// API endpoint to handle refund requests
// This would typically be in your backend (Node.js/Express, Next.js API route, etc.)

import multer from 'multer';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Configure file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// Initialize Supabase client (replace with your credentials)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle file uploads
    upload.array('proof')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { name, email, orderId, reason, description } = req.body;
      const proofFiles = req.files || [];

      // Validate required fields
      if (!name || !email || !orderId || !reason || !description) {
        return res.status(400).json({ 
          error: 'Missing required fields' 
        });
      }

      // Generate unique ticket ID
      const ticketId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Save to database
      const { data: refundRequest, error: dbError } = await supabase
        .from('refund_requests')
        .insert([
          {
            ticket_id: ticketId,
            name,
            email,
            order_id: orderId,
            reason,
            description,
            status: 'pending',
            created_at: new Date().toISOString(),
            proof_files: proofFiles.map(file => ({
              filename: file.originalname,
              size: file.size,
              mimetype: file.mimetype
            }))
          }
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ error: 'Failed to save refund request' });
      }

      // Upload proof files to storage (if any)
      const uploadedFiles = [];
      if (proofFiles && proofFiles.length > 0) {
        for (const file of proofFiles) {
          const fileName = `${ticketId}/${file.originalname}`;
          const { error: uploadError } = await supabase.storage
            .from('refund-proofs')
            .upload(fileName, file.buffer, {
              contentType: file.mimetype
            });

          if (!uploadError) {
            uploadedFiles.push(fileName);
          } else {
            console.error('Error uploading file:', uploadError);
          }
        }
      }

      // Send confirmation email to customer
      await sendConfirmationEmail(email, name, ticketId);

      // Send notification email to support team
      await sendSupportNotification(refundRequest, uploadedFiles);

      // Log the request
      console.log('Refund request received:', {
        ticketId,
        name,
        email,
        orderId,
        reason,
        filesCount: proofFiles.length
      });

      res.status(200).json({
        success: true,
        ticketId,
        message: 'Refund request submitted successfully'
      });
    });

  } catch (error) {
    console.error('Refund request error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process refund request'
    });
  }
}

// Send confirmation email to customer
async function sendConfirmationEmail(email, name, ticketId) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Refund Request Received - Toolsy Store',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #22c55e, #10b981); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Refund Request Received</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Hello ${name},</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            We have received your refund request and it's being reviewed by our support team.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <h3 style="color: #1f2937; margin-top: 0;">Request Details:</h3>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Status:</strong> Under Review</p>
            <p><strong>Expected Response:</strong> 24-48 hours</p>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Our team will carefully review your request and the provided proof. You will receive an update via email once the review is complete.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:support@toolsy.store" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Contact Support
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions, please don't hesitate to contact our support team.
          </p>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p>© 2024 Toolsy Store. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', email);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}

// Send notification to support team
async function sendSupportNotification(refundRequest, uploadedFiles) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'support@toolsy.store', // Your support email
    subject: `New Refund Request - ${refundRequest.ticket_id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Refund Request</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937;">Refund Request Details</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Ticket ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${refundRequest.ticket_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Customer:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${refundRequest.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${refundRequest.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Order ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${refundRequest.order_id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Reason:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${refundRequest.reason}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Description:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${refundRequest.description}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Proof Files:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${uploadedFiles.length} files uploaded</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Submitted:</strong></td>
                <td style="padding: 8px 0;">${new Date(refundRequest.created_at).toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.ADMIN_DASHBOARD_URL}/refund-requests/${refundRequest.ticket_id}" 
               style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Request
            </a>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Support notification sent');
  } catch (error) {
    console.error('Failed to send support notification:', error);
  }
}
