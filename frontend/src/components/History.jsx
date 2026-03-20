import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/history');
        const data = await res.json();
        if (Array.isArray(data)) {
            setHistory(data);
        } else {
            console.error('History data is not an array:', data);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleViewDetailed = (auditResult) => {
    // Navigate to dashboard viewing the selected audit result from history
    navigate('/dashboard', { state: { auditResult } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Audit History</h2>
        <Link to="/" className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
          + New Audit
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white/50 backdrop-blur rounded-2xl border border-dashed border-slate-300">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">No Audits Found</h3>
          <p className="mt-1 text-sm text-slate-500">Your past audits will appear here once you run them.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history.map((record) => (
            <div key={record._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-full h-1 ${record.auditResult.efficiency_score >= 80 ? 'bg-emerald-500' : record.auditResult.efficiency_score >= 50 ? 'bg-amber-400' : 'bg-rose-500'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{record.facilityType}</h3>
                  <p className="text-xs text-slate-500">{new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-slate-50 border border-slate-100 font-black text-slate-700">
                  {record.auditResult.efficiency_score}
                </div>
              </div>

              <div className="flex-grow">
                <p className="text-sm text-slate-600 line-clamp-2">{record.auditResult.summary}</p>
                
                <div className="mt-4 flex gap-2 flex-wrap">
                  {record.auditResult.flagged_areas?.slice(0, 2).map((area, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                      {area} Flagged
                    </span>
                  ))}
                  {record.auditResult.flagged_areas?.length === 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Optimal
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleViewDetailed(record.auditResult)}
                  className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-800 transition-colors flex items-center"
                >
                  View Full Report <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
