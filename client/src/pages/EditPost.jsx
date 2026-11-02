import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Send, Type, AlignLeft, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EditPost = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setFormData({ title: data.title, content: data.content });
      } catch (err) {
        setError('Failed to fetch story details.');
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put(`/posts/${id}`, formData);
      navigate(`/post/${id}`);
    } catch (err) {
      setError('Failed to update story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-8 group transition-colors">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to dashboard</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-white">Edit Story</h1>
            <p className="text-slate-400 mt-2">Refine your thoughts and let our AI re-analyze them</p>
          </div>
          <div className="p-3 bg-primary-500/10 rounded-2xl">
            <Sparkles className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Post Title</label>
              <div className="relative">
                <Type className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  className="w-full bg-slate-800 border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-xl font-bold"
                  placeholder="Enter a catchy title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Content</label>
              <div className="relative">
                <AlignLeft className="w-5 h-5 text-slate-500 absolute left-3 top-3" />
                <textarea
                  required
                  rows="12"
                  className="w-full bg-slate-800 border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none leading-relaxed"
                  placeholder="Tell your story..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4">
             <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-900/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Update Story</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditPost;
