// ManualEntry.js - PERFECT FIXED VERSION
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManualEntry({ onExpenseCreated, onExpenseUpdated, categories, sources, editingExpense, onCancelEdit }) {
    const [formData, setFormData] = useState({
        merchant_name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        source: '',
        note: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (editingExpense) {
            setFormData({
                merchant_name: editingExpense.merchant_name,
                amount: editingExpense.amount.toString(),
                date: editingExpense.date,
                category: editingExpense.category,
                source: editingExpense.source || '',
                note: editingExpense.note || ''
            });
        } else {
            resetForm();
        }
    }, [editingExpense]);

    const resetForm = () => {
        setFormData({
            merchant_name: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            category: '',
            source: '',
            note: ''
        });
        setError(null);
        setSuccess(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user types
        if (error) setError(null);
    };

    const validateForm = () => {
        if (!formData.merchant_name.trim()) {
            setError('Please enter merchant/description');
            return false;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Please enter a valid amount greater than 0');
            return false;
        }
        if (!formData.date) {
            setError('Please select a date');
            return false;
        }
        if (!formData.category) {
            setError('Please select a category');
            return false;
        }
        if (!formData.source) {
            setError('Please select a payment source');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validate form
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            // Prepare data
            const submitData = {
                merchant_name: formData.merchant_name.trim(),
                amount: parseFloat(formData.amount),
                date: formData.date,
                category: formData.category,
                source: formData.source,
                note: formData.note.trim()
            };

            console.log('Submitting expense:', submitData);

            if (editingExpense) {
                // Update existing expense
                const response = await axios.put(`/api/expenses/${editingExpense.id}`, submitData);
                console.log('Update response:', response.data);

                if (response.data.success) {
                    setSuccess(true);
                    onExpenseUpdated(response.data.data);
                    setTimeout(() => {
                        resetForm();
                    }, 1500);
                } else {
                    setError(response.data.error || 'Failed to update expense');
                }
            } else {
                // Create new expense
                const response = await axios.post('/api/expenses', submitData);
                console.log('Create response:', response.data);

                if (response.data.success) {
                    setSuccess(true);
                    onExpenseCreated(response.data.data);
                    setTimeout(() => {
                        resetForm();
                    }, 1500);
                } else {
                    setError(response.data.error || 'Failed to create expense');
                }
            }
        } catch (err) {
            console.error('Submission error:', err);

            // Better error messages
            if (err.response) {
                // Server responded with error
                setError(err.response.data.error || 'Server error. Please try again.');
            } else if (err.request) {
                // Request made but no response
                setError('Cannot connect to server. Make sure backend is running.');
            } else {
                // Something else happened
                setError('Failed to save expense. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="manual-entry">
            <h2>{editingExpense ? '✏️ Edit Expense' : '✍️ Add Expense Manually'}</h2>
            <p className="section-desc">
                {editingExpense ? 'Update expense details below' : 'Enter expense details manually without a receipt'}
            </p>

            <form onSubmit={handleSubmit} className="manual-form">
                {/* Merchant/Description */}
                <div className="form-group">
                    <label htmlFor="merchant_name">
                        <span className="label-icon">🏪</span>
                        <span className="label-text">Merchant / Description *</span>
                    </label>
                    <input
                        type="text"
                        id="merchant_name"
                        name="merchant_name"
                        value={formData.merchant_name}
                        onChange={handleChange}
                        placeholder="e.g., Walmart, Coffee Shop, Taxi"
                        className="form-input"
                        required
                        disabled={submitting}
                    />
                </div>

                {/* Amount and Date Row */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="amount">
                            <span className="label-icon">💵</span>
                            <span className="label-text">Amount *</span>
                        </label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            className="form-input"
                            required
                            disabled={submitting}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">
                            <span className="label-icon">📅</span>
                            <span className="label-text">Date *</span>
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            className="form-input"
                            required
                            disabled={submitting}
                        />
                    </div>
                </div>

                {/* Category and Source Row */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category">
                            <span className="label-icon">🏷️</span>
                            <span className="label-text">Category *</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="form-select"
                            required
                            disabled={submitting}
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="source">
                            <span className="label-icon">💳</span>
                            <span className="label-text">Payment Source *</span>
                        </label>
                        <select
                            id="source"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            className="form-select"
                            required
                            disabled={submitting}
                        >
                            <option value="">Select source</option>
                            {sources && sources.length > 0 ? (
                                sources.map(src => (
                                    <option key={src.id} value={src.name}>
                                        {src.icon} {src.name}
                                    </option>
                                ))
                            ) : (
                                <>
                                    <option value="Bank Account">🏦 Bank Account</option>
                                    <option value="Cash">💵 Cash</option>
                                    <option value="UPI">📱 UPI</option>
                                    <option value="Credit Card">💳 Credit Card</option>
                                    <option value="Debit Card">💳 Debit Card</option>
                                    <option value="Digital Wallet">👛 Digital Wallet</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {/* Note */}
                <div className="form-group">
                    <label htmlFor="note">
                        <span className="label-icon">📝</span>
                        <span className="label-text">Note (Optional)</span>
                    </label>
                    <textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Add any additional notes about this expense..."
                        className="form-textarea"
                        rows="3"
                        disabled={submitting}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="form-error">
                        ❌ {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="form-success">
                        ✅ {editingExpense ? 'Expense updated successfully!' : 'Expense added successfully!'}
                    </div>
                )}

                {/* Buttons */}
                <div className="form-actions">
                    {editingExpense && (
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="btn-secondary"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? '⏳ Saving...' : editingExpense ? '💾 Update Expense' : '➕ Add Expense'}
                    </button>
                </div>
            </form>

            {/* Help Text */}
            <div className="form-help">
                <p className="help-title">💡 Quick Tips:</p>
                <ul className="help-list">
                    <li>✅ All fields marked with * are required</li>
                    <li>📅 Date can be today or any past date</li>
                    <li>💵 Amount should be greater than 0</li>
                    <li>🏷️ Choose the category that best matches your expense</li>
                    <li>💳 Select how you paid for this expense</li>
                    <li>📝 Notes are optional but helpful for tracking details</li>
                </ul>
            </div>
        </div>
    );
}

export default ManualEntry;