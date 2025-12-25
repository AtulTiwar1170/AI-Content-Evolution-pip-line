import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, Database, RefreshCw, ExternalLink, 
  CheckCircle2, LayoutDashboard, FileText, Loader2 
} from 'lucide-react';

// Accessing Environment Variables
const LARAVEL_API = import.meta.env.VITE_LARAVEL_API_URL;
const NODE_API = import.meta.env.VITE_NODE_API_URL;

const App = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evolvingId, setEvolvingId] = useState(null); 
  const [status, setStatus] = useState({ message: '', type: '' });

  // 1. Fetch Articles from Laravel
  const fetchArticles = async () => {
    try {
      // Updated to use Env Variable
      const res = await axios.get(`${LARAVEL_API}/articles`);
      const data = res.data.data || res.data;
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // 2. Phase 1: Ingest
  const handleIngest = async () => {
    setLoading(true);
    setStatus({ message: 'Scraping original blogs...', type: 'info' });
    try {
      // Updated to use Env Variable
      await axios.post(`${NODE_API}/ingest`);
      await fetchArticles();
      setStatus({ message: 'Ingestion complete!', type: 'success' });
    } catch (err) {
      setStatus({ message: 'Ingestion failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Phase 2: Evolve Single Article
  const handleEvolve = async (id) => {
    setEvolvingId(id);
    try {
      // Updated to use Env Variable
      const res = await axios.post(`${NODE_API}/evolve`, { id });
      
      if (res.data.alreadyEvolved) {
        alert("This article is already optimized!");
      }

      await fetchArticles(); 
      setStatus({ message: `Article #${id} evolved successfully!`, type: 'success' });
    } catch (err) {
      const errorMsg = err.response?.data?.details || "Evolution failed.";
      alert(errorMsg);
    } finally {
      setEvolvingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">AI Content Pipeline</span>
        </div>
        
        <button 
          onClick={handleIngest} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
          Ingest Fresh Blogs
        </button>
      </nav>

      <main className="max-w-4xl mx-auto py-10 px-6">
        {status.message && (
          <div className={`mb-8 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-blue-50 border-blue-100 text-blue-700'
          }`}>
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">{status.message}</span>
          </div>
        )}

        <div className="space-y-6">
          {articles.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-[32px]">
              <FileText className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-medium">No articles yet. Click Ingest to start.</p>
            </div>
          ) : (
            articles.map((article) => (
              <div key={article.id} className="bg-white border border-slate-200 rounded-[24px] p-8 transition-all hover:shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase ${
                    article.author === 'Gemini AI' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {article.author === 'Gemini AI' ? '✨ Evolved' : 'Original Content'}
                  </span>
                  
                  {article.author !== 'Gemini AI' && (
                    <button 
                      onClick={() => handleEvolve(article.id)}
                      disabled={evolvingId !== null}
                      className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-30"
                    >
                      {evolvingId === article.id ? (
                        <><Loader2 size={14} className="animate-spin" /> Optimizing...</>
                      ) : (
                        <><RefreshCw size={14} /> Evolve This</>
                      )}
                    </button>
                  )}
                </div>

                <h2 className="text-2xl font-extrabold text-slate-800 mb-4 leading-tight">
                  {article.title}
                </h2>

                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base">
                  {article.content}
                </div>

                {article.references && (
                  <div className="mt-8 pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Verified Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {(typeof article.references === 'string' ? JSON.parse(article.references) : article.references).map((ref, i) => (
                        <a 
                          key={i} 
                          href={ref.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                          {ref.title.substring(0, 25)}... <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default App;