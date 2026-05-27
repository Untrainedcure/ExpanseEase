// Dashboard.js - Updated Analytics Dashboard with Source Tracking
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function Dashboard({ expenses }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [expenses]);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/expenses/stats/summary');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#a855f7', '#14b8a6'];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (!stats || !stats.overall || expenses.length === 0) {
        return (
            <div className="dashboard-empty">
                <div className="empty-icon">📊</div>
                <h3>No Data Yet</h3>
                <p>Add expenses to see your spending analytics and insights!</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <h2>📊 Spending Analytics</h2>

            {/* Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>Total Spent</h3>
                        <p className="stat-value">{formatCurrency(stats.overall.total_amount)}</p>
                    </div>
                </div>

                <div className="stat-card stat-count">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <h3>Total Expenses</h3>
                        <p className="stat-value">{stats.overall.total_count}</p>
                    </div>
                </div>

                <div className="stat-card stat-average">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>Average Amount</h3>
                        <p className="stat-value">{formatCurrency(stats.overall.average_amount)}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            {stats.byCategory && stats.byCategory.length > 0 && (
                <div className="charts-section">
                    {/* Category Pie Chart */}
                    <div className="chart-card">
                        <h3>💼 Spending by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.byCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.category}: ${formatCurrency(entry.total)}`}
                                    outerRadius={100}
                                    dataKey="total"
                                >
                                    {stats.byCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category Bar Chart */}
                    <div className="chart-card">
                        <h3>📊 Category Breakdown</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.byCategory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="total" fill="#6366f1" name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Payment Source Analysis */}
            {stats.bySource && stats.bySource.length > 0 && (
                <div className="charts-section">
                    <div className="chart-card">
                        <h3>💳 Payment Sources</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={stats.bySource}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.source}: ${formatCurrency(entry.total)}`}
                                    outerRadius={100}
                                    dataKey="total"
                                >
                                    {stats.bySource.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-card">
                        <h3>📱 Source Breakdown</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.bySource}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="source" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="total" fill="#ec4899" name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Tables */}
            <div className="tables-section">
                {/* Category Table */}
                {stats.byCategory && stats.byCategory.length > 0 && (
                    <div className="data-table">
                        <h3>🏷️ Category Details</h3>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Count</th>
                                        <th>Total</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.byCategory.map((cat, idx) => {
                                        const percentage = ((cat.total / stats.overall.total_amount) * 100).toFixed(1);
                                        return (
                                            <tr key={idx}>
                                                <td>
                                                    <span style={{ color: COLORS[idx % COLORS.length], fontWeight: 'bold' }}>●</span>
                                                    {' '}{cat.category}
                                                </td>
                                                <td>{cat.count}</td>
                                                <td>{formatCurrency(cat.total)}</td>
                                                <td>{percentage}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Source Table */}
                {stats.bySource && stats.bySource.length > 0 && (
                    <div className="data-table">
                        <h3>💳 Source Details</h3>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Source</th>
                                        <th>Count</th>
                                        <th>Total</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.bySource.map((src, idx) => {
                                        const percentage = ((src.total / stats.overall.total_amount) * 100).toFixed(1);
                                        return (
                                            <tr key={idx}>
                                                <td>
                                                    <span style={{ color: COLORS[idx % COLORS.length], fontWeight: 'bold' }}>●</span>
                                                    {' '}{src.source}
                                                </td>
                                                <td>{src.count}</td>
                                                <td>{formatCurrency(src.total)}</td>
                                                <td>{percentage}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Expenses */}
            <div className="recent-expenses">
                <h3>🕐 Recent Expenses</h3>
                <div className="recent-list">
                    {expenses.slice(0, 5).map((expense) => (
                        <div key={expense.id} className="recent-item">
                            <div className="recent-info">
                                <strong>{expense.merchant_name}</strong>
                                <span className="recent-meta">
                                    {expense.category} • {expense.source}
                                </span>
                            </div>
                            <div className="recent-amount">
                                {formatCurrency(expense.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;