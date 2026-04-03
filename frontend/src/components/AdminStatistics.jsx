import React, { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import './AdminStatistics.css';

export default function AdminStatistics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const result = await apiFetch('/adminRoute/statistics');
                if (result.result === 'success') {
                    setStats(result.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <p className="loadingMsg">Statisztikák betöltése...</p>;
    if (!stats) return <p className="errorMsg">Hiba történt az adatok betöltésekor.</p>;

    return (
        <div className="adminStatsWrapper">
            <h2>Statisztikák</h2>
            
            <div className="statsGrid">
                <div className="statCard revenueCard">
                    <h3>Összes Bevétel</h3>
                    <p className="statValue">{parseInt(stats.totalRevenue).toLocaleString('hu-HU')} Ft</p>
                </div>
                
                <div className="statCard">
                    <h3>Rendelések Száma</h3>
                    <p className="statValue">{stats.totalOrders} db</p>
                </div>
                
                <div className="statCard">
                    <h3>Eladott Termékek</h3>
                    <p className="statValue">{stats.soldProducts} db</p>
                </div>
                
                <div className="statCard">
                    <h3>Regisztrált Felhasználók</h3>
                    <p className="statValue">{stats.totalUsers} fő</p>
                </div>
                
                <div className="statCard">
                    <h3>Sikeres Felvásárlások</h3>
                    <p className="statValue">{stats.successfulBuybacks} db</p>
                </div>
            </div>
        </div>
    );
}