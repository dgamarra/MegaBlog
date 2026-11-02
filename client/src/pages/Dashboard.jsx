import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, BarChart3, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const { data } = await api.get('/posts');
        // Filter in frontend for now as we use JSON DB and simple search
        const myPosts = data.filter(p => p.authorId === user.id);
        setPosts(myPosts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyPosts();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${id}`);
        setPosts(posts.filter(p => p.id !== id));
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Your Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your stories and analyze their performance.</p>
        </div>
        <Link to="/create" className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-900/20">
          <Plus className="w-5 h-5" />
          <span>New Story</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Stories</h3>
            <Edit3 className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-4xl font-display font-bold text-white">{posts.length}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Av. Sentiment</h3>
            <BarChart3 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-4xl font-display font-bold text-white">Positive</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Sentiment</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-white font-medium">{post.title}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    post.sentiment === 'positive' ? 'bg-green-500/10 text-green-400' :
                    post.sentiment === 'negative' ? 'bg-red-500/10 text-red-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {post.sentiment || 'Neutral'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link to={`/edit/${post.id}`} className="p-2 text-slate-400 hover:text-white transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {posts.length === 0 && (
          <div className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">You haven't published any stories yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
