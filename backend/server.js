require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

let expenses = [];
let nextId = 1;

// ── CORS fix for Vercel + Render deployment ──────────────────────────────────
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
    require('fs').mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'receipt-' + unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())
            && /jpeg|jpg|png|webp/.test(file.mimetype);
        ok ? cb(null, true) : cb(new Error('Only image files allowed'));
    }
});

// ── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'ExpenseEase API is running!', timestamp: new Date().toISOString() });
});

// ── Get expenses ─────────────────────────────────────────────────────────────
app.get('/api/expenses', (req, res) => {
    try {
        const { category, source } = req.query;
        let data = [...expenses];
        if (category) data = data.filter(e => e.category === category);
        if (source) data = data.filter(e => e.source === source);
        res.json({ success: true, count: data.length, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Create manual expense ────────────────────────────────────────────────────
app.post('/api/expenses', (req, res) => {
    try {
        console.log('📝 Manual expense body:', req.body);

        const { merchant_name, amount, date, category, source, note, receipt_image_path } = req.body;

        if (!merchant_name || String(merchant_name).trim() === '')
            return res.status(400).json({ success: false, error: 'Merchant name is required' });
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
            return res.status(400).json({ success: false, error: 'Valid amount is required' });
        if (!date)
            return res.status(400).json({ success: false, error: 'Date is required' });
        if (!category)
            return res.status(400).json({ success: false, error: 'Category is required' });
        if (!source)
            return res.status(400).json({ success: false, error: 'Payment source is required' });

        const expense = {
            id: nextId++,
            merchant_name: String(merchant_name).trim(),
            amount: parseFloat(parseFloat(amount).toFixed(2)),
            date,
            category,
            source,
            note: note ? String(note).trim() : '',
            receipt_image_path: receipt_image_path || null,
            created_at: new Date().toISOString(),
            type: receipt_image_path ? 'receipt' : 'manual'
        };

        expenses.unshift(expense);
        console.log('✅ Expense saved:', expense);
        res.status(201).json({ success: true, data: expense });
    } catch (err) {
        console.error('❌ Create error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Upload receipt image ─────────────────────────────────────────────────────
app.post('/api/expenses/upload', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        console.log('📤 Receipt saved:', req.file.filename);
        res.json({
            success: true,
            message: 'Receipt uploaded — please fill in the details below.',
            data: {
                receipt_image_path: req.file.path,
                filename: req.file.filename
            }
        });
    } catch (err) {
        console.error('❌ Upload error:', err);
        if (req.file) { try { await fs.unlink(req.file.path); } catch (_) { } }
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Update expense ───────────────────────────────────────────────────────────
app.put('/api/expenses/:id', (req, res) => {
    try {
        const idx = expenses.findIndex(e => e.id === parseInt(req.params.id));
        if (idx === -1) return res.status(404).json({ success: false, error: 'Expense not found' });

        const { merchant_name, amount, date, category, source, note } = req.body;
        if (merchant_name) expenses[idx].merchant_name = String(merchant_name).trim();
        if (amount) expenses[idx].amount = parseFloat(parseFloat(amount).toFixed(2));
        if (date) expenses[idx].date = date;
        if (category) expenses[idx].category = category;
        if (source) expenses[idx].source = source;
        if (note !== undefined) expenses[idx].note = String(note).trim();
        expenses[idx].updated_at = new Date().toISOString();

        res.json({ success: true, data: expenses[idx] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Delete expense ───────────────────────────────────────────────────────────
app.delete('/api/expenses/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const before = expenses.length;
        expenses = expenses.filter(e => e.id !== id);
        if (expenses.length < before) {
            res.json({ success: true, message: 'Deleted' });
        } else {
            res.status(404).json({ success: false, error: 'Expense not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Stats ────────────────────────────────────────────────────────────────────
app.get('/api/expenses/stats/summary', (req, res) => {
    try {
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        const count = expenses.length;
        const byCategory = {};
        const bySource = {};

        expenses.forEach(e => {
            if (!byCategory[e.category])
                byCategory[e.category] = { category: e.category, count: 0, total: 0 };
            byCategory[e.category].count++;
            byCategory[e.category].total = parseFloat((byCategory[e.category].total + e.amount).toFixed(2));

            const s = e.source || 'Unknown';
            if (!bySource[s]) bySource[s] = { source: s, count: 0, total: 0 };
            bySource[s].count++;
            bySource[s].total = parseFloat((bySource[s].total + e.amount).toFixed(2));
        });

        res.json({
            success: true,
            data: {
                overall: {
                    total_count: count,
                    total_amount: parseFloat(total.toFixed(2)),
                    average_amount: count > 0 ? parseFloat((total / count).toFixed(2)) : 0
                },
                byCategory: Object.values(byCategory),
                bySource: Object.values(bySource)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Categories ───────────────────────────────────────────────────────────────
app.get('/api/categories', (_req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: 'Food & Dining', color: '#ef4444', icon: '🍔' },
            { id: 2, name: 'Transportation', color: '#3b82f6', icon: '🚗' },
            { id: 3, name: 'Shopping', color: '#8b5cf6', icon: '🛍️' },
            { id: 4, name: 'Entertainment', color: '#ec4899', icon: '🎬' },
            { id: 5, name: 'Healthcare', color: '#10b981', icon: '⚕️' },
            { id: 6, name: 'Office Supplies', color: '#f59e0b', icon: '📎' },
            { id: 7, name: 'Travel', color: '#06b6d4', icon: '✈️' },
            { id: 8, name: 'Lifestyle', color: '#a855f7', icon: '🌟' },
            { id: 9, name: 'Education', color: '#14b8a6', icon: '📚' },
            { id: 10, name: 'Other', color: '#6b7280', icon: '📋' }
        ]
    });
});

// ── Sources ──────────────────────────────────────────────────────────────────
app.get('/api/sources', (_req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: 'Bank Account', icon: '🏦' },
            { id: 2, name: 'Cash', icon: '💵' },
            { id: 3, name: 'UPI', icon: '📱' },
            { id: 4, name: 'Credit Card', icon: '💳' },
            { id: 5, name: 'Debit Card', icon: '💳' },
            { id: 6, name: 'Digital Wallet', icon: '👛' }
        ]
    });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Global error:', err.message);
    res.status(500).json({ success: false, error: err.message });
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 ExpenseEase API running on port ${PORT}`);
    console.log('✅ CORS: open for all origins');
    console.log('✅ Manual entry: enabled');
    console.log('✅ Receipt upload: enabled\n');
});

module.exports = app;