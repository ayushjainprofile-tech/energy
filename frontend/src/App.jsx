import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EnergyForm from './components/EnergyForm';
import Dashboard from './components/Dashboard';
import History from './components/History';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl md:mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mr-3 shadow-sm">
                  ⚡
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                  Energy Audit AI
                </h1>
              </div>
              <nav className="flex space-x-8">
                <Link to="/" className="text-slate-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  New Audit
                </Link>
                <Link to="/history" className="text-slate-500 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  History
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<EnergyForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
