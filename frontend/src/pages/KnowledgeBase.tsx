import React, { useEffect, useState } from 'react';
import { Plus, Sparkles, Trash2, Search } from 'lucide-react';
import { NewArticleModal } from '../components/NewArticleModal';
import { api } from '../services/api';
import type { Article, User } from '../types';

interface KnowledgeBaseProps {
  currentUser?: User;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ currentUser }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const canManageKb = currentUser?.role === 'Admin';

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await api.getArticles();
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleCreated = async (data: { title: string; category: string; content: string; isPublished: boolean }) => {
    await api.createArticle(data);
    await loadArticles();
  };

  const handleDelete = async (id: string) => {
    if (!canManageKb) {
      alert('You do not have permission to delete knowledge base articles.');
      return;
    }
    if (confirm('Are you sure you want to delete this article? The vector embedding will be removed.')) {
      await api.deleteArticle(id);
      await loadArticles();
    }
  };

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>Knowledge Base & RAG Index</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage documentation used by the AI RAG assistant to answer user questions before ticket filing.
          </p>
        </div>
        {canManageKb && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>New Article</span>
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '14px 20px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search FAQs and articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 38px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading articles...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No articles found. Add one to feed the RAG assistant!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filtered.map((a) => (
            <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', padding: '3px 8px', background: 'var(--bg-input)', borderRadius: '6px', color: 'var(--primary)', border: '1px solid var(--border-color)' }}>
                    {a.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                    <Sparkles size={12} />
                    <span>pgvector 768d</span>
                  </div>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>{a.title}</h3>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>{a.content}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {new Date(a.createdAtUtc).toLocaleDateString()}
                </span>
                {canManageKb && (
                  <button onClick={() => handleDelete(a.id)} className="btn btn-secondary" style={{ padding: '6px 10px', color: '#ef4444' }} title="Delete Article">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <NewArticleModal
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};
