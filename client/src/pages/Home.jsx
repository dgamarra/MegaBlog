import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Activity, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await api.get('/posts');
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
  );

  return (
    <div className="space-y-12">
      <header className="max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-display font-bold text-white mb-6 leading-tight"
        >
          Discover stories, <span className="text-primary-500">ideas</span>, and expertise from writers on any topic.
        </motion.h1>
        <p className="text-slate-400 text-xl max-w-2xl leading-relaxed">
          The MegaBlog is a platform where high-quality content meets AI analysis to provide you with the best insights.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all shadow-xl hover:shadow-primary-500/10"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  post.sentiment === 'positive' ? 'bg-green-500/10 text-green-400' :
                  post.sentiment === 'negative' ? 'bg-red-500/10 text-red-400' :
                  'bg-slate-800 text-slate-400'
                }`}>
                   {post.sentiment || 'Neutral'}
                </span>
                <div className="flex space-x-1">
                  {post.keywords?.slice(0, 2).map((k) => (
                    <span key={k} className="text-[10px] text-slate-500 font-medium">#{k}</span>
                  ))}
                </div>
              </div>
              
              <Link to={`/post/${post.id}`}>
                <h2 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-2">
                  {post.title}
                </h2>
              </Link>
              
              <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                {post.content}
              </p>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800/50">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <User className="w-3 h-3" />
                  <span>{post.authorName || 'Unknown'}</span>
                </div>
                <Link to={`/post/${post.id}`} className="flex items-center space-x-1 text-xs font-bold text-primary-500 group-hover:translate-x-1 transition-transform">
                  <span>Read more</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {posts.length === 0 && (
        <div className="text-center py-24 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
          <p className="text-slate-500">No stories found. Start by creating the first one!</p>
        </div>
      )}
    </div>
  );
};

export default Home;
