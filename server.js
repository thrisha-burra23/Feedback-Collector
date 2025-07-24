const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Routes

// Serve public pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/user-dashboard', (req, res) => {
  if (!req.session.username || req.session.role !== 'user') {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'user-dashboard.html'));
});

app.get('/get-username', (req, res) => {
  if (req.session.username) {
    res.json({ username: req.session.username });
  } else {
    res.json({ username: 'Guest' });
  }
});

//forgot-password
app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgot-password.html'));
});

// Fetch user feedbacks
app.get('/api/user-feedbacks', (req, res) => {
  if (!req.session.username || req.session.role !== 'user') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const username = req.session.username;

  db.query('SELECT id FROM users WHERE username = ?', [username], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.status(500).json({ error: 'User lookup failed' });
    }

    const userId = userResult[0].id;
    const sql = 'SELECT * FROM feedback WHERE user_id = ?';

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching feedbacks:', err);
        return res.status(500).json({ error: 'Failed to fetch feedbacks' });
      }

      res.json(results);
    });
  });
});
//admin route
app.get('/admin-dashboard', (req, res) => {
  if (!req.session.username || req.session.role !== 'admin') {
    return res.status(403).send('Access denied');
  }

  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});



// Submit feedback
app.post('/submit-feedback', (req, res) => {
  const { email, message } = req.body;
  const username = req.session.username;

  db.query('SELECT id FROM users WHERE username = ?', [username], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.send('User not found.');
    }

    const userId = userResult[0].id;

    const sql = 'INSERT INTO feedback (name, email, message, user_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, email, message, userId], (err, result) => {
      if (err) {
        console.error('❌ Error saving feedback:', err);
        res.send('There was a problem saving your feedback.');
      } else {
        console.log('✅ Feedback saved:', result.insertId);
        res.send('Thank you for your feedback!');
      }
    });
  });
});

// Register
app.post('/register', async (req, res) => {
  const { username, password, recovery_hint, recovery_answer } = req.body;

  if (!username || !password || !recovery_hint || !recovery_answer) {
    return res.json({ success: false, message: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (username, password, recovery_hint, recovery_answer)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [username, hashedPassword, recovery_hint, recovery_answer], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.json({ success: false, message: '⚠️ Username already exists. Please choose another.' });
        }
        console.error('❌ Registration error:', err);
        return res.json({ success: false, message: 'Registration failed. Please try again.' });
      }

      console.log(`✅ Registered new user: ${username}`);
      res.json({ success: true });
    });
  } catch (error) {
    console.error('❌ Bcrypt error:', error);
    res.json({ success: false, message: 'Error processing registration.' });
  }
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error('❌ Login error:', err);
      return res.send('Something went wrong. Try again.');
    }

    if (results.length === 0) {
      console.log('🔍 User not found, redirecting to register...');
      return res.redirect('/register');
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.username = user.username;
      req.session.role = user.role;
      console.log(`✅ ${user.username} logged in as ${user.role}`);

      if (user.role === 'admin') {
        res.redirect('/admin-dashboard');
      } else {
        res.redirect('/user-dashboard');
      }
    } else {
      res.send('Incorrect password. Try again.');
    }
  });
});

// Edit feedback
app.post('/edit/:id', (req, res) => {
  const feedbackId = req.params.id;
  const { message } = req.body;
  const username = req.session.username;

  const sql = 'UPDATE feedback SET message = ? WHERE id = ? AND name = ?';
  db.query(sql, [message, feedbackId, username], (err, result) => {
    if (err) {
      console.error('❌ Edit failed:', err);
      return res.send('Could not update feedback.');
    }
    res.redirect('/user-dashboard');
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

//delete
app.get('/delete/:id', (req, res) => {
  const feedbackId = req.params.id;
  const username = req.session.username;

  // Get user ID from username first
  db.query('SELECT id FROM users WHERE username = ?', [username], (err, userResult) => {
    if (err || userResult.length === 0) {
      console.error('❌ User lookup failed for delete');
      return res.send('User not found. Cannot delete.');
    }

    const userId = userResult[0].id;

    const sql = 'DELETE FROM feedback WHERE id = ? AND user_id = ?';
    db.query(sql, [feedbackId, userId], (err, result) => {
      if (err) {
        console.error('❌ Delete failed:', err);
        return res.send('Could not delete feedback.');
      }

      console.log(`🗑️ Deleted feedback ${feedbackId} for user ${username}`);
      res.redirect('/user-dashboard');
    });
  });
});




//api to fetch feedbacks
app.get('/api/all-feedbacks', (req, res) => {
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  db.query('SELECT * FROM feedback', (err, results) => {
    if (err) {
      console.error('Error loading feedbacks:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(results);
  });
});

//adding admin reply
app.post('/admin-reply/:id', (req, res) => {
  const feedbackId = req.params.id;
  const { reply } = req.body;

  if (req.session.role !== 'admin') return res.status(403).send('Not authorized');

  const sql = 'UPDATE feedback SET admin_reply = ? WHERE id = ?';
  db.query(sql, [reply, feedbackId], (err, result) => {
    if (err) {
      console.error('Reply failed:', err);
      return res.send('Failed to save reply');
    }
    res.redirect('/admin-dashboard');
  });
});

//admin delete route
app.get('/admin-delete/:id', (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).send('Unauthorized');

  db.query('DELETE FROM feedback WHERE id = ?', [req.params.id], (err, result) => {
    if (err) {
      console.error('Admin delete failed:', err);
      return res.send('Failed to delete feedback');
    }
    res.redirect('/admin-dashboard');
  });
});


//forgot-password
app.post('/forgot-password', async (req, res) => {
  const { username, recovery_answer, new_password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND recovery_answer = ?',
    [username, recovery_answer],
    async (err, results) => {
      if (err || results.length === 0) {
        console.error('❌ Recovery validation failed:', err);
        return res.json({ success: false, message: 'Recovery failed. Check username or answer.' });
      }

      try {
        const hashedPassword = await bcrypt.hash(new_password, 10);
        db.query(
          'UPDATE users SET password = ? WHERE username = ?',
          [hashedPassword, username],
          (err2) => {
            if (err2) {
              console.error('❌ Password reset failed:', err2);
              return res.json({ success: false, message: 'Could not update password.' });
            }
            console.log(`🔐 Password reset for user ${username}`);
            res.json({ success: true });
          }
        );
      } catch (hashErr) {
        console.error('❌ Hashing error:', hashErr);
        res.json({ success: false, message: 'Something went wrong. Try again.' });
      }
    }
  );
});


// Start server
app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
