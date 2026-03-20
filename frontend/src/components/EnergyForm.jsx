import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EnergyForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    facilityType: 'Office',
    electricity: '',
    gas: '',
    hvac: '',
    machinery: '',
    lighting: '',
    location: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Parse to numbers where appropriate
    const payload = { ...formData };
    ['electricity', 'gas', 'hvac', 'machinery', 'lighting'].forEach(key => {
      payload[key] = parseFloat(payload[key]) || 0;
    });

    try {
      const response = await fetch('http://localhost:5000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      setLoading(false);
      if (response.ok) {
        navigate('/dashboard', { state: { auditResult: data, inputData: payload } });
      } else {
        alert('Audit failed. Please ensure the backend and AI service are running.');
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      alert('Failed to connect to the backend server.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all hover:shadow-2xl">
      <div className="p-8 sm:p-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-xl mb-4 text-indigo-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">New Energy Audit</h2>
          <p className="mt-2 text-slate-500">Enter your facility metrics below to generate an AI-driven efficiency report.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Facility Type</label>
            <select
              name="facilityType"
              value={formData.facilityType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-shadow"
            >
              <option value="Office">Office Building</option>
              <option value="Manufacturing">Manufacturing Plant</option>
              <option value="Retail">Retail Store</option>
              <option value="Warehouse">Warehouse</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Electricity (kWh)', name: 'electricity' },
              { label: 'Gas (Therms)', name: 'gas' },
              { label: 'HVAC Energy', name: 'hvac' },
              { label: 'Machinery Energy', name: 'machinery' },
              { label: 'Lighting Energy', name: 'lighting' }
            ].map((field) => (
              <div key={field.name}>
                 <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
                 <input
                    type="number"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="e.g. 500"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-shadow"
                 />
              </div>
            ))}
            
            <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1">Location (Optional)</label>
                 <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. New York, NY"
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-shadow"
                 />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transform transition-all active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Running AI Audit...
                </span>
              ) : 'Generate Audit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnergyForm;
