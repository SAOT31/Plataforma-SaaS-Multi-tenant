import React, { useState } from 'react';
import { X, Sparkles, Plus } from 'lucide-react';

interface NewArticleModalProps {
  onClose: () => void;
  onCreated: (data: { title: string; category: string; content: string; isPublished: boolean }) => Promise<void>;
}

export const NewArticleModal: React.FC<NewArticleModalProps> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !content) return;

    setLoading(true);
    try {
      await onCreated({ title, category, content, isPublished: true });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>New Knowledge Base Article</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Empower the RAG AI assistant with company documentation.</p>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '12px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>
            Vector embeddings (768-dim) will be generated and indexed in PostgreSQL automatically upon saving.
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>ARTICLE TITLE / FAQ QUESTION</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How do I update my payment method?"
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>CATEGORY</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Billing, Technical, Accounts"
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>CONTENT / ANSWER</label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed instructions or answer that the AI will use to answer user queries..."
              style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Plus size={16} />
              <span>{loading ? 'Vectorizing & Saving...' : 'Save & Vectorize'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
