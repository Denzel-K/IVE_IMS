const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.js');
const sendEmail = require('../config/emailService.js');
const dotenv = require('dotenv');
dotenv.config();

// Function to generate and store token in cookies
const generateToken = (user, res) => {
    const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, lab: user.lab, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    console.log(token);

    console.log("JWT created successfully :)");
    
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure in production
        sameSite: 'Strict',
        maxAge: 3600000 // 1 hour
    });

    return token;
};

// **Register User**
exports.register = (req, res) => {
    try {
      const { name, email, phone, password, lab, role } = req.body;
      console.log(req.body);
  
      if (!name || !email || !phone || !password || !lab) {
        return res.status(400).json({ message: 'Name, email, phone, lab and password are required' });
      }
  
      const checkUserCount = 'SELECT COUNT(*) AS count FROM users';
      db.query(checkUserCount, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
  
        const userCount = results[0].count;
        let assignedRole = userCount === 0 ? 'admin' : role;
        let isApproved = userCount === 0; // First user auto-approved
  
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) return res.status(500).json({ message: 'Error hashing password' });
  
          const sql = 'INSERT INTO users (name, email, phone, password, role, lab, approved) VALUES (?, ?, ?, ?, ?, ?, ?)';
          db.query(sql, [name, email, phone, hashedPassword, assignedRole, lab, isApproved], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error registering user:', err });
  
            const newUser = {
              id: result.insertId,
              name,
              email,
              phone,
              lab,
              role: assignedRole,
              approved: isApproved
            };
  
            // Generate JWT and store it in cookies
            generateToken(newUser, res);
  
            // Send email notification
            sendEmail(email, 
              'IVE IMS Registration Successful', 
              `Hello ${name},\n\nYour registration was successful. Please wait for admin approval.`,
              `<p>Hello ${name},</p><p>Your registration was successful. Please wait for admin approval.</p>`
            );
  
            // Include the user's role in the response
            res.status(201).json({ 
              message: 'Registration successful, awaiting admin approval.', 
              user: newUser
            });
          });
        });
      });    
    }
    catch (err) {
      console.log(err);
    }
  };

// **Login User**
exports.login = (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
  
      const user = results[0];
  
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  
        if (!user.approved) {
          return res.status(403).json({ message: 'Your account is pending approval from an admin.' });
        }
  
        // Generate token and store in cookie
        generateToken(user, res);
  
        // Include the user's role in the response
        res.json({ 
          message: 'Login successful for user: ', 
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            lab: user.lab
          }
        });
      });
    });
  };

// **Check Authentication Status**
exports.checkAuthStatus = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({
        message: 'User is authenticated',
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
};

// **Logout User**
exports.logout = (req, res) => {
    res.cookie('token', '', { 
        httpOnly: true, 
        expires: new Date(0) // Expire the cookie
    });

    console.log('Logged out successfully');

    res.redirect('/');
};