import React, { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import './AdminStatistics.css';

export default function AdminStatistics() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const result = await apiFetch(`/adminRoute/statistics?period=${period}`);
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
    }, [period]);

    if (loading && !stats) return <p className="loadingMsg">Statisztikák betöltése...</p>;
    if (!stats && !loading) return <p className="errorMsg">Hiba történt az adatok betöltésekor.</p>;

    return (
        <div className="adminStatsWrapper">
            <div className="adminStatsHeader">
                <h2>Statisztikák</h2>
                <div className="statsFilterGroup">
                    <button 
                        className={`statsFilterBtn ${period === '7d' ? 'active' : ''}`}
                        onClick={() => setPeriod('7d')}
                    >
                        Elmúlt 7 nap
                    </button>
                    <button 
                        className={`statsFilterBtn ${period === '1m' ? 'active' : ''}`}
                        onClick={() => setPeriod('1m')}
                    >
                        1 Hónap
                    </button>
                    <button 
                        className={`statsFilterBtn ${period === '1y' ? 'active' : ''}`}
                        onClick={() => setPeriod('1y')}
                    >
                        1 Év
                    </button>
                    <button 
                        className={`statsFilterBtn ${period === 'all' ? 'active' : ''}`}
                        onClick={() => setPeriod('all')}
                    >
                        Minden idő
                    </button>
                </div>
            </div>
            
            <div className={`statsGrid ${loading ? 'updating' : ''}`}>
                <div className="statCard revenueCard">
                    <h3>Bevétel ({period === 'all' ? 'Összes' : 'Időszak'})</h3>
                    <p className="statValue">{parseInt(stats.totalRevenue).toLocaleString('hu-HU')} Ft</p>
                </div>
                
                <div className="statCard">
                    <h3>Rendelések ({period === 'all' ? 'Összes' : 'Időszak'})</h3>
                    <p className="statValue">{stats.totalOrders} db</p>
                </div>
                
                <div className="statCard">
                    <h3>Eladott Termékek ({period === 'all' ? 'Összes' : 'Időszak'})</h3>
                    <p className="statValue">{stats.soldProducts} db</p>
                </div>
                
                <div className="statCard">
                    <h3>Sikeres Felvásárlások ({period === 'all' ? 'Összes' : 'Időszak'})</h3>
                    <p className="statValue">{stats.successfulBuybacks} db</p>
                </div>

                <div className="statCard">
                    <h3>Regisztrált Felhasználók (Összes)</h3>
                    <p className="statValue">{stats.totalUsers} fő</p>
                </div>
            </div>
        </div>
    );
}