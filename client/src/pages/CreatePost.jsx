import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Send, Type, AlignLeft, AlertCircle, Sparkles } from 'lucide-react';

const CreatePost = () => {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/posts', formData);
      navigate('/');
    } catch (err) {
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-white">Create Story</h1>
            <p className="text-slate-400 mt-2">Share your thoughts and let our AI analyze them</p>
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
                  <span>Publish Story</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePost;
