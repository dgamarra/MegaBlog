import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, User, Tag, Activity, Share2, ArrowLeft, Edit3, Trash2 } from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Failed to copy link');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await api.delete(`/posts/${id}`);
        navigate('/dashboard');
      } catch (err) {
        alert('Failed to delete story');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  if (!post) return <div className="text-white text-center">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white mb-8 group transition-colors">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to feed</span>
      </Link>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <header className="space-y-6">
          <div className="flex items-center space-x-3">
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
              post.sentiment === 'positive' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
              post.sentiment === 'negative' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
               Sentiment: {post.sentiment || 'Neutral'}
            </span>
            <div className="h-1 w-1 bg-slate-700 rounded-full"></div>
            <span className="text-slate-500 text-sm">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between py-6 border-y border-slate-800/50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-white font-medium">{post.authorName || 'Unknown'}</p>
                <p className="text-slate-500 text-sm">Author</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
               {user && (user.id === post.authorId || user.role === 'admin') && (
                 <>
                   <Link 
                     to={`/edit/${post.id}`}
                     className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                     title="Edit story"
                   >
                     <Edit3 className="w-5 h-5" />
                   </Link>
                   <button 
                     onClick={handleDelete}
                     className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                     title="Delete story"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                   <div className="h-6 w-px bg-slate-800 mx-2"></div>
                 </>
               )}
               <button
                 onClick={handleShare}
                 className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all relative"
                 title="Copy link"
               >
                 <Share2 className="w-5 h-5" />
                 {copied && (
                   <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-700 text-white text-xs rounded whitespace-nowrap">
                     Copied!
                   </span>
                 )}
               </button>
            </div>
          </div>
        </header>

        <div className="prose prose-invert prose-slate max-w-none">
          <p className="text-xl text-slate-300 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        <div className="pt-12 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center space-x-2">
            <Tag className="w-4 h-4" />
            <span>Keywords identified by AI</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.keywords?.map((keyword) => (
              <span key={keyword} className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:border-primary-500/50 transition-all cursor-default">
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
    </div>
  );
};

export default PostDetail;
