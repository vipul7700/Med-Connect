const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const twilio = require('twilio');
const authRoutes = require('./routes/auth.js');

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const twilioClient = require('twilio')(accountSid, authToken);

// Middleware
const corsOptions = {
    origin: 'http://localhost:3000', // Update to production URL when deployed
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/', (req, res) => {
    const { message, user: sender, type, members } = req.body;

    if (type === 'message.new') {
        members
            .filter((member) => member.user_id !== sender.id)
            .forEach(({ user }) => {
                if (!user.online) {
                    twilioClient.messages.create({
                        body: `You have a new message from ${message.user.fullName} - ${message.text}`,
                        messagingServiceSid: messagingServiceSid,
                        to: user.phoneNumber
                    })
                    .then(() => console.log('Message sent!'))
                    .catch((err) => console.error('Error sending message:', err));
                }
            });

        return res.status(200).send('Message sent!');
    }

    return res.status(200).send('Not a new message request');
});

app.use('/auth', authRoutes);

// ❌ REMOVE THIS FOR VERCEL DEPLOYMENT
 app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


