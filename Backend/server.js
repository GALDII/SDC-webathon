require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection().then(() => console.log('✅ Connected to MySQL Database')).catch(err => console.error('❌ MySQL connection error:', err));

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token.' });
        req.user = decoded;
        next();
    });
};

const restrictToAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'This action is restricted to admins.' });
    }
    next();
};

app.get('/', (req, res) => res.send('✅ Green City Connect API is running.'));

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required.' });
        const [existing] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ message: 'User with this email already exists.' });
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });
        const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: 'Login successful', token, user });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/events', async (req, res) => {
    try {
        const query = `
            SELECT e.*, (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) as participants
            FROM events e
            WHERE e.status = 'approved'
            ORDER BY e.date ASC`;
        const [events] = await db.query(query);

        let registrations = [];
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, JWT_SECRET, async (err, decoded) => {
                if (err) {
                    return res.json({ events, registrations });
                }
                const [myRegs] = await db.query('SELECT event_id FROM event_registrations WHERE user_id = ?', [decoded.id]);
                registrations = myRegs.map(r => r.event_id);
                res.json({ events, registrations });
            });
        } else {
             res.json({ events, registrations });
        }
    } catch (error) { res.status(500).json({ message: 'Failed to fetch events.' }); }
});

app.post('/api/events', verifyToken, restrictToAdmin, async (req, res) => {
    const { title, date, description, limit } = req.body;
    if (!title || !date || !description || !limit) {
        return res.status(400).json({ message: 'All event fields are required.' });
    }

    try {
        const query = "INSERT INTO events (title, date, description, `limit`, status) VALUES (?, ?, ?, ?, 'approved')";
        await db.query(query, [title, date, description, parseInt(limit, 10)]);
        res.status(201).json({ message: 'Event created successfully!' });
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: 'Database error during event creation.' });
    }
});

app.post('/api/events/:id/register', verifyToken, async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id: event_id } = req.params;
        const { id: user_id } = req.user;

        await connection.beginTransaction();
        const [eventRows] = await connection.query('SELECT `limit`, (SELECT COUNT(*) FROM event_registrations WHERE event_id = ?) as participants FROM events WHERE id = ? FOR UPDATE', [event_id, event_id]);
        if (eventRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Event not found.' });
        }
        const event = eventRows[0];
        if (event.participants >= event.limit) {
            await connection.rollback();
            return res.status(409).json({ message: 'This event is already full.' });
        }
        await connection.query('INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)', [user_id, event_id]);
        await connection.commit();
        res.status(201).json({ message: 'Registered successfully!' });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'You are already registered for this event.' });
        }
        res.status(500).json({ message: 'Registration failed.' });
    } finally {
        connection.release();
    }
});

app.get('/api/businesses', async (req, res) => {
    try {
        const query = `
            SELECT b.*, AVG(br.rating) as average_rating
            FROM businesses b
            LEFT JOIN business_reviews br ON b.id = br.business_id
            WHERE b.status = 'approved'
            GROUP BY b.id
            ORDER BY b.name ASC`;
        const [businesses] = await db.query(query);
        res.json(businesses);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch businesses.' }); }
});

app.post('/api/businesses', verifyToken, async (req, res) => {
    const { name, category, description } = req.body;
    if (!name || !category || !description) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
        const query = "INSERT INTO businesses (name, category, description, status) VALUES (?, ?, ?, 'pending')";
        await db.query(query, [name, category, description]);
        res.status(201).json({ message: 'Business submitted for approval!' });
    } catch (error) {
        console.error('Business Registration Error:', error);
        res.status(500).json({ message: 'Failed to register business.' });
    }
});


app.get('/api/businesses/:id/reviews', async (req, res) => {
    try {
        const [reviews] = await db.query('SELECT * FROM business_reviews WHERE business_id = ? ORDER BY created_at DESC', [req.params.id]);
        res.json(reviews);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch reviews.' }); }
});

app.post('/api/businesses/:id/reviews', verifyToken, async (req, res) => {
    try {
        const { rating, review_text } = req.body;
        const { id: business_id } = req.params;
        const { id: user_id, name: user_name } = req.user;
        await db.query('INSERT INTO business_reviews (business_id, user_id, user_name, rating, review_text) VALUES (?, ?, ?, ?, ?)', [business_id, user_id, user_name, rating, review_text]);
        res.status(201).json({ message: 'Review submitted successfully.' });
    } catch (error) { res.status(500).json({ message: 'Failed to submit review.' }); }
});

app.post('/api/actions/log', verifyToken, async (req, res) => {
    try {
        const { points } = req.body;
        if (!points) return res.status(400).json({ message: 'Points are required.' });
        await db.query('UPDATE users SET points = points + ? WHERE id = ?', [points, req.user.id]);
        res.json({ message: 'Action logged successfully!' });
    } catch (error) { res.status(500).json({ message: 'Failed to log action.' }); }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const [leaderboard] = await db.query('SELECT id, name, points FROM users ORDER BY points DESC LIMIT 10');
        res.json(leaderboard);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch leaderboard.' }); }
});

app.get('/api/forum/posts', async (req, res) => {
    try {
        const { board } = req.query;
        let query = `
            SELECT p.*, 
                   (SELECT COUNT(*) FROM forum_votes WHERE post_id = p.id AND vote_type = 'up') - 
                   (SELECT COUNT(*) FROM forum_votes WHERE post_id = p.id AND vote_type = 'down') as score 
            FROM forum_posts p 
            WHERE p.status = 'approved'`;
        const queryParams = [];

        if (board) {
            query += " AND p.board = ?";
            queryParams.push(board);
        }
        query += " ORDER BY score DESC, p.created_at DESC";
        
        const [posts] = await db.query(query, queryParams);
        
        let userVotes = {};
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, JWT_SECRET, async (err, decoded) => {
                if (decoded) {
                    const [votes] = await db.query('SELECT post_id, vote_type FROM forum_votes WHERE user_id = ?', [decoded.id]);
                    votes.forEach(v => userVotes[v.post_id] = v.vote_type);
                }
                res.json({ posts, userVotes });
            });
        } else {
            res.json({ posts, userVotes });
        }
    } catch (error) { res.status(500).json({ message: 'Failed to fetch posts.' }); }
});

app.post('/api/forum/posts', verifyToken, async (req, res) => {
    try {
        const { title, content, board } = req.body;
        const { id: user_id, name: user_name } = req.user;
        await db.query('INSERT INTO forum_posts (user_id, user_name, title, content, board, status) VALUES (?, ?, ?, ?, ?, "pending")', [user_id, user_name, title, content, board]);
        res.status(201).json({ message: 'Post submitted for approval.' });
    } catch (error) { res.status(500).json({ message: 'Failed to create post.' }); }
});

app.post('/api/posts/:id/vote', verifyToken, async (req, res) => {
    const { vote_type } = req.body;
    const { id: post_id } = req.params;
    const { id: user_id } = req.user;

    if (!['up', 'down'].includes(vote_type)) {
        return res.status(400).json({ message: 'Invalid vote type.' });
    }

    try {
        const query = `
            INSERT INTO forum_votes (user_id, post_id, vote_type) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE vote_type = ?`;
        await db.query(query, [user_id, post_id, vote_type, vote_type]);
        res.json({ message: 'Vote registered successfully.' });
    } catch (error) {
        console.error("Vote Error:", error);
        res.status(500).json({ message: 'Failed to register vote.' });
    }
});

app.get('/api/admin/dashboard-stats', verifyToken, restrictToAdmin, async (req, res) => {
    try {
        const [[{ count: totalUsers }]] = await db.query('SELECT COUNT(*) as count FROM users');
        const [[{ count: totalEvents }]] = await db.query('SELECT COUNT(*) as count FROM events WHERE status="approved"');
        const [[{ count: pendingItems }]] = await db.query(`
            SELECT (SELECT COUNT(*) FROM events WHERE status='pending') + 
                   (SELECT COUNT(*) FROM businesses WHERE status='pending') +
                   (SELECT COUNT(*) FROM forum_posts WHERE status='pending') as count
        `);
        res.json({ totalUsers, totalEvents, pendingItems });
    } catch (error) { res.status(500).json({ message: 'Failed to fetch dashboard stats.' }); }
});

app.get('/api/admin/pending-items', verifyToken, restrictToAdmin, async (req, res) => {
    try {
        const [pendingEvents] = await db.query("SELECT id, title, 'event' as type FROM events WHERE status='pending'");
        const [pendingBusinesses] = await db.query("SELECT id, name as title, 'business' as type FROM businesses WHERE status='pending'");
        const [pendingPosts] = await db.query("SELECT id, title, 'post' as type FROM forum_posts WHERE status='pending'");
        res.json([...pendingEvents, ...pendingBusinesses, ...pendingPosts]);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch pending items.' }); }
});

app.post('/api/admin/approve/:type/:id', verifyToken, restrictToAdmin, async (req, res) => {
    try {
        const { type, id } = req.params;
        const tables = { event: 'events', business: 'businesses', post: 'forum_posts' };
        const tableName = tables[type];
        if (!tableName) return res.status(400).json({ message: 'Invalid item type.' });

        await db.query(`UPDATE ${tableName} SET status = 'approved' WHERE id = ?`, [id]);
        res.json({ message: `${type} approved successfully.` });
    } catch (error) { res.status(500).json({ message: 'Failed to approve item.' }); }
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
