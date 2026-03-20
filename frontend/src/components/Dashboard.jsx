import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const location = useLocation();
  const auditResult = location.state?.auditResult;
  const inputData = location.state?.inputData;

  if (!auditResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">No Audit Data Found</h2>
        <p className="text-slate-500 mb-8">Please run an energy audit first to view results.</p>
        <Link to="/" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-200">
          Run New Audit
        </Link>
      </div>
    );
  }

  const { summary, efficiency_score, flagged_areas, recommendations, estimated_total_saving, carbon_reduction } = auditResult;

  const scoreColor = efficiency_score >= 80 ? 'text-emerald-500' : efficiency_score >= 50 ? 'text-amber-500' : 'text-rose-500';
  const scoreBg = efficiency_score >= 80 ? 'bg-emerald-50' : efficiency_score >= 50 ? 'bg-amber-50' : 'bg-rose-50';

  const chartData = {
    labels: ['Electricity', 'Gas', 'HVAC', 'Machinery', 'Lighting'],
    datasets: [
      {
        label: 'Energy Consumption (Units)',
        data: inputData ? [inputData.electricity, inputData.gas, inputData.hvac, inputData.machinery, inputData.lighting] : [0,0,0,0,0],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(244, 63, 94, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
        ],
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Energy Audit Report", 14, 22);

    doc.setFontSize(12);
    doc.text(`Facility Type: ${inputData?.facilityType || 'Unknown'}`, 14, 32);
    doc.text(`Efficiency Score: ${efficiency_score} / 100`, 14, 40);
    doc.text(`Estimated Savings: ${estimated_total_saving}`, 14, 48);
    doc.text(`Carbon Reduction: ${carbon_reduction}`, 14, 56);

    doc.setFontSize(16);
    doc.text("Consumption Breakdown", 14, 70);

    const tableData = [
      ['Electricity', inputData?.electricity || 0],
      ['Gas', inputData?.gas || 0],
      ['HVAC', inputData?.hvac || 0],
      ['Machinery', inputData?.machinery || 0],
      ['Lighting', inputData?.lighting || 0],
    ];

    doc.autoTable({
      startY: 75,
      head: [['Category', 'Consumption']],
      body: tableData,
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.text("Recommendations:", 14, finalY);

    const recData = recommendations?.map(rec => [rec.area, rec.issue, rec.suggestion, rec.estimated_saving]) || [];
    doc.autoTable({
      startY: finalY + 5,
      head: [['Area', 'Issue', 'Suggestion', 'Savings']],
      body: recData,
    });

    doc.save('energy_audit_report.pdf');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Audit Results</h2>
            <p className="text-slate-600 font-medium leading-relaxed">{summary}</p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full ${scoreBg} border-4 ${scoreColor.replace('text', 'border')} shadow-inner`}>
              <span className={`text-4xl font-extrabold ${scoreColor}`}>{efficiency_score}</span>
            </div>
            <p className="mt-3 text-sm font-bold text-slate-500 uppercase tracking-widest">Efficiency Score</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl shadow-teal-500/20 p-8 text-white relative overflow-hidden transform transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <p className="text-emerald-100 font-medium tracking-wide mb-1">Estimated Yearly Savings</p>
          <h3 className="text-4xl font-black tracking-tight">{estimated_total_saving}</h3>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/20 p-8 text-white relative overflow-hidden transform transition-all hover:scale-[1.02]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10"></div>
          <p className="text-blue-100 font-medium tracking-wide mb-1">Potential Carbon Reduction</p>
          <h3 className="text-4xl font-black tracking-tight">{carbon_reduction}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 p-6">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
              Consumption Profile
            </h3>
            {inputData && (
              <div className="mt-4">
                <Bar data={chartData} options={chartOptions} />
              </div>
            )}
            {!inputData && (
               <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl text-slate-500 border border-slate-100 text-sm">
                  <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  Chart data unavailable. <br/> Run directly from the Audits Form to see visuals.
               </div>
            )}
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Flagged Areas
            </h3>
            {flagged_areas && flagged_areas.length > 0 ? (
              <ul className="space-y-3">
                {flagged_areas.map((area, idx) => (
                  <li key={idx} className="flex items-center px-4 py-3 bg-rose-50 text-rose-700 rounded-xl font-medium border border-rose-100">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-3"></span>
                    {area} High Consumption
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium border border-emerald-100">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                No critical areas flagged!
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                Smart Recommendations
                </h3>
                <button 
                  onClick={generatePDF}
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition flex items-center cursor-pointer">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Export PDF
                </button>
            </div>
            
            <div className="space-y-4">
              {recommendations && recommendations.map((rec, idx) => (
                <div key={idx} className="p-5 border border-slate-100 rounded-xl hover:shadow-md transition-shadow bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-lg">{rec.area} Optimization</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      Save {rec.estimated_saving}
                    </span>
                  </div>
                  <p className="text-rose-600 text-sm font-medium mb-1">Issue: {rec.issue}</p>
                  <p className="text-slate-600 text-sm">{rec.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center pt-8">
        <Link to="/" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
          ← Start Another Audit
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
