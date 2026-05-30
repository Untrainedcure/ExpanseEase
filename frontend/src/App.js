// App.js - FIXED VERSION with Working Sources Dropdown
import React, { useState, useEffect } from 'react';
import axios from 'axios';
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
import Dashboard from './components/Dashboard';
import ManualEntry from './components/ManualEntry';
import './styles/App.css';

function App() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('upload');
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterSource, setFilterSource] = useState('');
    const [categories, setCategories] = useState([]);
    const [sources, setSources] = useState([]);
    const [editingExpense, setEditingExpense] = useState(null);

    // Fetch data on mount
    useEffect(() => {
        fetchExpenses();
        fetchCategories();
        fetchSources();
    }, []);

    // Fetch all expenses
    const fetchExpenses = async (category = '', source = '') => {
        try {
            setLoading(true);
            const params = {};
            if (category) params.category = category;
            if (source) params.source = source;
            const response = await axios.get('/api/expenses', { params });
            setExpenses(response.data.data || []);
        } catch (err) {
            console.error('Error fetching expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            console.log('Categories loaded:', response.data.data);
            setCategories(response.data.data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    // Fetch sources
    const fetchSources = async () => {
        try {
            const response = await axios.get('/api/sources');
            console.log('Sources loaded:', response.data.data);
            setSources(response.data.data || []);
        } catch (err) {
            console.error('Error fetching sources:', err);
            // Fallback to hardcoded sources if API fails
            setSources([
                { id: 1, name: 'Bank Account', icon: '🏦' },
                { id: 2, name: 'Cash', icon: '💵' },
                { id: 3, name: 'UPI', icon: '📱' },
                { id: 4, name: 'Credit Card', icon: '💳' },
                { id: 5, name: 'Debit Card', icon: '💳' },
                { id: 6, name: 'Digital Wallet', icon: '👛' }
            ]);
        }
    };

    // Handle file selection (Receipt Upload)
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);
        setError(null);
        setResult(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    // Handle receipt upload
    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('receipt', selectedFile);

            const response = await axios.post('/api/expenses/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setResult(response.data.data);
            setExpenses([response.data.data, ...expenses]);

            setTimeout(() => {
                setSelectedFile(null);
                setPreview(null);
                setResult(null);
                setActiveTab('expenses');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process receipt');
        } finally {
            setUploading(false);
        }
    };

    // Reset upload
    const handleReset = () => {
        setSelectedFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
    };

    // Handle manual expense creation
    const handleManualExpenseCreated = (newExpense) => {
        setExpenses([newExpense, ...expenses]);
        setActiveTab('expenses');
    };

    // Delete expense
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;

        try {
            await axios.delete(`/api/expenses/${id}`);
            setExpenses(expenses.filter(exp => exp.id !== id));
        } catch (err) {
            alert('Failed to delete expense');
        }
    };

    // Start editing expense
    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setActiveTab('manual');
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingExpense(null);
    };

    // Update expense after edit
    const handleExpenseUpdated = (updatedExpense) => {
        const index = expenses.findIndex(exp => exp.id === updatedExpense.id);
        if (index !== -1) {
            const newExpenses = [...expenses];
            newExpenses[index] = updatedExpense;
            setExpenses(newExpenses);
        }
        setEditingExpense(null);
        setActiveTab('expenses');
    };

    // Filter by category and source
    const handleFilterChange = (category, source) => {
        setFilterCategory(category);
        setFilterSource(source);
        fetchExpenses(category, source);
    };

    // Export to CSV
    const exportToCSV = () => {
        if (expenses.length === 0) {
            alert('No expenses to export');
            return;
        }

        const headers = ['Date', 'Merchant', 'Amount', 'Category', 'Source', 'Note'];
        const rows = expenses.map(exp => [
            exp.date,
            exp.merchant_name,
            exp.amount,
            exp.category,
            exp.source || '',
            exp.note || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="App">
            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <h1>💰 ExpenseEase</h1>
                    <p>Smart Expense Tracking Made Easy</p>
                </div>
            </header>

            {/* Navigation */}
            <nav className="app-nav">
                <button
                    className={activeTab === 'upload' ? 'active' : ''}
                    onClick={() => { setActiveTab('upload'); setEditingExpense(null); }}
                >
                    <span className="nav-icon">📤</span>
                    <span className="nav-text">Upload</span>
                </button>
                <button
                    className={activeTab === 'manual' ? 'active' : ''}
                    onClick={() => setActiveTab('manual')}
                >
                    <span className="nav-icon">✍️</span>
                    <span className="nav-text">Add Manual</span>
                </button>
                <button
                    className={activeTab === 'expenses' ? 'active' : ''}
                    onClick={() => { setActiveTab('expenses'); setEditingExpense(null); }}
                >
                    <span className="nav-icon">📝</span>
                    <span className="nav-text">Expenses</span>
                    <span className="badge">{expenses.length}</span>
                </button>
                <button
                    className={activeTab === 'dashboard' ? 'active' : ''}
                    onClick={() => { setActiveTab('dashboard'); setEditingExpense(null); }}
                >
                    <span className="nav-icon">📊</span>
                    <span className="nav-text">Dashboard</span>
                </button>
            </nav>

            {/* Main Content */}
            <main className="app-main">
                <div className="container">
                    {/* Upload Receipt Tab */}
                    {activeTab === 'upload' && (
                        <div className="upload-section">
                            <h2>📸 Upload Receipt</h2>
                            <p className="section-desc">Take a photo or upload an image of your receipt</p>

                            {!preview && !result && (
                                <div className="upload-area">
                                    <input
                                        type="file"
                                        id="receipt-input"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="receipt-input">
                                        <div className="upload-icon">📤</div>
                                        <p className="upload-text">Click or tap to upload receipt</p>
                                        <p className="hint">PNG, JPG, WebP (Max 10MB)</p>
                                    </label>
                                </div>
                            )}

                            {preview && !result && (
                                <div className="preview">
                                    <img src={preview} alt="Receipt" className="preview-img" />
                                    <div className="actions">
                                        <button onClick={handleReset} disabled={uploading} className="btn-secondary">
                                            ❌ Cancel
                                        </button>
                                        <button onClick={handleUpload} disabled={uploading} className="btn-primary">
                                            {uploading ? '⏳ Processing...' : '🤖 Process'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {uploading && (
                                <div className="processing">
                                    <div className="spinner"></div>
                                    <p>🤖 AI is analyzing your receipt...</p>
                                </div>
                            )}

                            {result && (
                                <div className="result success">
                                    <h3>✅ Receipt Processed!</h3>
                                    <div className="result-grid">
                                        <div className="result-item">
                                            <span className="result-label">Merchant</span>
                                            <span className="result-value">{result.merchant_name}</span>
                                        </div>
                                        <div className="result-item">
                                            <span className="result-label">Amount</span>
                                            <span className="result-value amount">${result.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="result-item">
                                            <span className="result-label">Date</span>
                                            <span className="result-value">{result.date}</span>
                                        </div>
                                        <div className="result-item">
                                            <span className="result-label">Category</span>
                                            <span className="result-value category">{result.category}</span>
                                        </div>
                                    </div>
                                    <button onClick={handleReset} className="btn-primary">
                                        ✨ Upload Another
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="result error">
                                    <h3>❌ Error</h3>
                                    <p>{error}</p>
                                    <button onClick={handleReset} className="btn-secondary">Try Again</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual Entry Tab */}
                    {activeTab === 'manual' && (
                        <ManualEntry
                            onExpenseCreated={handleManualExpenseCreated}
                            onExpenseUpdated={handleExpenseUpdated}
                            categories={categories}
                            sources={sources}
                            editingExpense={editingExpense}
                            onCancelEdit={handleCancelEdit}
                        />
                    )}

                    {/* Expenses List Tab */}
                    {activeTab === 'expenses' && (
                        <div className="expenses-section">
                            <div className="expenses-header">
                                <h2>📝 All Expenses</h2>
                                <div className="expenses-actions">
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => handleFilterChange(e.target.value, filterSource)}
                                        className="filter-select"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={filterSource}
                                        onChange={(e) => handleFilterChange(filterCategory, e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">All Sources</option>
                                        {sources.map(src => (
                                            <option key={src.id} value={src.name}>
                                                {src.icon} {src.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={exportToCSV} className="export-btn">
                                        <span className="btn-icon">📥</span>
                                        <span className="btn-text">Export</span>
                                    </button>
                                </div>
                            </div>

                            {loading && <div className="loading"><div className="spinner"></div></div>}

                            {!loading && expenses.length === 0 && (
                                <div className="empty">
                                    <div className="empty-icon">📭</div>
                                    <h3>No Expenses Yet</h3>
                                    <p>Start by uploading a receipt or adding an expense manually!</p>
                                </div>
                            )}

                            <div className="expense-list">
                                {expenses.map((expense) => (
                                    <div key={expense.id} className="expense-card">
                                        <div className="expense-header-card">
                                            <div className="expense-type-badge">
                                                {expense.type === 'receipt' ? '📸' : '✍️'}
                                            </div>
                                            <div className="expense-info">
                                                <h3>{expense.merchant_name}</h3>
                                                <div className="expense-meta">
                                                    <span className="meta-item">📅 {expense.date}</span>
                                                    <span className="meta-item">🏷️ {expense.category}</span>
                                                    <span className="meta-item">💳 {expense.source}</span>
                                                </div>
                                                {expense.note && (
                                                    <p className="expense-note">📝 {expense.note}</p>
                                                )}
                                            </div>
                                            <div className="expense-amount">
                                                ${expense.amount.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="expense-actions">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => handleEdit(expense)}
                                                title="Edit expense"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(expense.id)}
                                                title="Delete expense"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <Dashboard expenses={expenses} />
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="app-footer">
                <p>Built with ❤️ using React, Node.js & FREE AI</p>
                <p>© 2026 ExpenseEase - Track Smarter, Spend Wiser</p>
            </footer>
        </div>
    );
}

export default App;