const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'gagik8615@gmail.com',
        pass: process.env.EMAIL_PASSWORD // Use App Password, not your Gmail password
    }
});

// API endpoint to send emails
app.post('/api/send-email', async (req, res) => {
    try {
        const { to_email, data } = req.body;
        
        let subject = '';
        let htmlContent = '';

        // Generate email content based on form type
        switch(data.type) {
            case 'subscribe':
                subject = 'New Newsletter Subscription - Arduino Learning Hub';
                htmlContent = `
                    <h2>New Newsletter Subscription</h2>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Interest Level:</strong> ${data.interest}</p>
                    <p><strong>Timestamp:</strong> ${data.timestamp}</p>
                    <hr>
                    <p>A user has subscribed to the newsletter. Send them updates about Arduino tutorials and projects.</p>
                `;
                break;
                
            case 'feedback':
                subject = 'New Feedback - Arduino Learning Hub';
                htmlContent = `
                    <h2>New Feedback Received</h2>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Feedback:</strong></p>
                    <p>${data.feedback.replace(/\n/g, '<br>')}</p>
                    <p><strong>Timestamp:</strong> ${data.timestamp}</p>
                    <hr>
                    <p>Please review this feedback and consider implementing any improvements.</p>
                `;
                break;
                
            case 'share':
                subject = 'New Project Submission - Arduino Learning Hub';
                htmlContent = `
                    <h2>New Project Shared</h2>
                    <p><strong>Project Name:</strong> ${data.projectName}</p>
                    <p><strong>Description:</strong></p>
                    <p>${data.projectDesc.replace(/\n/g, '<br>')}</p>
                    <p><strong>Code/Link:</strong> ${data.projectCode || 'No link provided'}</p>
                    <p><strong>Timestamp:</strong> ${data.timestamp}</p>
                    <hr>
                    <p>Review this project and consider featuring it on the website.</p>
                `;
                break;
        }

        // Send email to your Gmail
        await transporter.sendMail({
            from: 'Arduino Learning Hub <noreply@arduinolearning.com>',
            to: 'gagik8615@gmail.com',
            subject: subject,
            html: htmlContent
        });

        // Optionally send confirmation email to user (for subscribe only)
        if (data.type === 'subscribe') {
            await transporter.sendMail({
                from: 'Arduino Learning Hub <noreply@arduinolearning.com>',
                to: data.email,
                subject: 'Welcome to Arduino Learning Hub Newsletter!',
                html: `
                    <h2>Welcome!</h2>
                    <p>Thank you for subscribing to our newsletter!</p>
                    <p>We'll send you weekly tips, tutorials, and project ideas right to your inbox.</p>
                    <p>Happy learning!</p>
                    <p>- Arduino Learning Hub Team</p>
                `
            });
        }

        res.json({ success: true, message: 'Email sent successfully' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Make sure you have set EMAIL_USER and EMAIL_PASSWORD environment variables');
});
