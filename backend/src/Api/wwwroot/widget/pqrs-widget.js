(() => {
  if (customElements.get('pqrs-widget')) return;

  const currentScript = document.currentScript || document.querySelector('script[data-tenant]');
  const tenantId = currentScript ? currentScript.getAttribute('data-tenant') : '';
  const apiBaseUrl = (currentScript ? currentScript.getAttribute('data-api') : '') || 'http://localhost:5050';

  if (!tenantId) return;

  class PqrsWidgetElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.isOpen = false;
      this.activeTab = 'chat';
    }

    connectedCallback() {
      this.render();
      this.bindEvents();
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host { --primary: #6366f1; --primary-hover: #4f46e5; --bg: #0f172a; --card: #1e293b; --text: #f8fafc; --muted: #94a3b8; --border: rgba(255,255,255,0.1); font-family: system-ui, -apple-system, sans-serif; }
          .launcher { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; cursor: pointer; box-shadow: 0 10px 25px rgba(99,102,241,0.4); display: flex; align-items: center; justify-content: center; z-index: 999999; transition: transform 0.2s, box-shadow 0.2s; }
          .launcher:hover { transform: scale(1.06); }
          .launcher svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 2; }
          .window { position: fixed; bottom: 92px; right: 24px; width: 380px; height: 560px; max-width: calc(100vw - 32px); max-height: calc(100vh - 110px); background: var(--bg); border: 1px solid var(--border); border-radius: 18px; box-shadow: 0 20px 40px rgba(0,0,0,0.45); display: none; flex-direction: column; overflow: hidden; z-index: 999999; }
          .window.open { display: flex; animation: popup 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes popup { from { opacity: 0; transform: translateY(14px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
          .header { padding: 16px 20px; background: var(--card); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
          .header-title { font-size: 15px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
          .header-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
          .close-btn { background: transparent; border: none; color: var(--muted); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
          .close-btn:hover { color: var(--text); background: rgba(255,255,255,0.05); }
          .nav-tabs { display: flex; padding: 6px; background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border); }
          .tab { flex: 1; padding: 8px; border: none; background: transparent; color: var(--muted); font-size: 12.5px; font-weight: 600; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
          .tab.active { background: var(--primary); color: #fff; }
          .content { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; }
          .messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
          .msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.45; word-wrap: break-word; }
          .msg.bot { background: var(--card); color: var(--text); align-self: flex-start; border: 1px solid var(--border); border-bottom-left-radius: 3px; }
          .msg.user { background: var(--primary); color: #fff; align-self: flex-end; border-bottom-right-radius: 3px; }
          .res-card { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); border-radius: 10px; padding: 10px; margin-top: 6px; font-size: 12px; }
          .res-actions { display: flex; gap: 6px; margin-top: 8px; }
          .res-btn { flex: 1; padding: 6px; border: none; border-radius: 6px; cursor: pointer; font-size: 11.5px; font-weight: 600; }
          .res-yes { background: #10b981; color: #fff; }
          .res-no { background: var(--card); color: var(--text); border: 1px solid var(--border); }
          .chat-input-bar { display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid var(--border); }
          .chat-input { flex: 1; background: var(--card); border: 1px solid var(--border); color: var(--text); padding: 9px 12px; border-radius: 8px; font-size: 13px; outline: none; }
          .chat-input:focus { border-color: var(--primary); }
          .send-btn { background: var(--primary); color: #fff; border: none; border-radius: 8px; width: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
          .form-group { margin-bottom: 12px; }
          .form-group label { display: block; font-size: 11.5px; font-weight: 600; color: var(--muted); margin-bottom: 4px; }
          .form-control { width: 100%; box-sizing: border-box; background: var(--card); border: 1px solid var(--border); color: var(--text); padding: 8px 10px; border-radius: 8px; font-size: 12.5px; outline: none; }
          .form-control:focus { border-color: var(--primary); }
          textarea.form-control { resize: vertical; min-height: 70px; }
          .submit-btn { width: 100%; padding: 10px; background: var(--primary); color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-top: 6px; }
          .submit-btn:hover { background: var(--primary-hover); }
          .success-box { background: rgba(16,185,129,0.1); border: 1px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; display: none; }
          .radicado-badge { font-family: monospace; font-size: 16px; font-weight: 700; color: #60a5fa; background: var(--card); padding: 8px 14px; border-radius: 8px; display: inline-block; margin: 10px 0; }
        </style>

        <button class="launcher" id="btn-launcher" aria-label="Open Support">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>

        <div class="window" id="chat-window">
          <div class="header">
            <div class="header-title">
              <span class="header-dot"></span>
              <span>AI Support & PQRS</span>
            </div>
            <button class="close-btn" id="btn-close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="nav-tabs">
            <button class="tab active" id="tab-chat">AI Assistant</button>
            <button class="tab" id="tab-form">File Ticket</button>
          </div>

          <div class="content" id="view-chat">
            <div class="messages" id="messages-list">
              <div class="msg bot">Hello! I am your AI support assistant. Ask me anything or file a formal PQRS ticket if you need team assistance.</div>
            </div>
            <div class="chat-input-bar">
              <input type="text" class="chat-input" id="chat-input" placeholder="Type your inquiry...">
              <button class="send-btn" id="btn-send">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>

          <div class="content" id="view-form" style="display:none;">
            <form id="ticket-form">
              <div class="form-group">
                <label>FULL NAME</label>
                <input type="text" required class="form-control" id="f-name" placeholder="John Doe">
              </div>
              <div class="form-group">
                <label>EMAIL ADDRESS</label>
                <input type="email" required class="form-control" id="f-email" placeholder="john@example.com">
              </div>
              <div class="form-group">
                <label>SUBJECT</label>
                <input type="text" required class="form-control" id="f-subject" placeholder="Summary of issue">
              </div>
              <div class="form-group">
                <label>DESCRIPTION</label>
                <textarea required class="form-control" id="f-desc" placeholder="Provide full details..."></textarea>
              </div>
              <button type="submit" class="submit-btn" id="btn-submit">Submit Formal PQRS</button>
            </form>

            <div class="success-box" id="form-success">
              <div style="color:#10b981; font-size:22px; margin-bottom:4px;">✓</div>
              <h4 style="margin:0; color:#fff; font-size:15px;">Ticket Submitted!</h4>
              <p style="margin:6px 0; color:var(--muted); font-size:12px;">Your formal tracking radicado number is:</p>
              <div class="radicado-badge" id="radicado-num">RAD-2026-00001</div>
              <button type="button" class="submit-btn" id="btn-new-ticket" style="background:var(--card); border:1px solid var(--border);">New Ticket</button>
            </div>
          </div>
        </div>
      `;
    }

    bindEvents() {
      const root = this.shadowRoot;
      const win = root.getElementById('chat-window');
      const launcher = root.getElementById('btn-launcher');
      const closeBtn = root.getElementById('btn-close');
      const tabChat = root.getElementById('tab-chat');
      const tabForm = root.getElementById('tab-form');
      const viewChat = root.getElementById('view-chat');
      const viewForm = root.getElementById('view-form');
      const msgList = root.getElementById('messages-list');
      const chatInput = root.getElementById('chat-input');
      const sendBtn = root.getElementById('btn-send');
      const form = root.getElementById('ticket-form');
      const formSuccess = root.getElementById('form-success');
      const radicadoText = root.getElementById('radicado-num');
      const btnNewTicket = root.getElementById('btn-new-ticket');

      const toggleOpen = () => {
        this.isOpen = !this.isOpen;
        win.classList.toggle('open', this.isOpen);
        if (this.isOpen && this.activeTab === 'chat') chatInput.focus();
      };

      launcher.addEventListener('click', toggleOpen);
      closeBtn.addEventListener('click', toggleOpen);

      tabChat.addEventListener('click', () => {
        this.activeTab = 'chat';
        tabChat.classList.add('active');
        tabForm.classList.remove('active');
        viewChat.style.display = 'flex';
        viewForm.style.display = 'none';
      });

      tabForm.addEventListener('click', () => {
        this.activeTab = 'form';
        tabForm.classList.add('active');
        tabChat.classList.remove('active');
        viewChat.style.display = 'none';
        viewForm.style.display = 'flex';
      });

      const handleSend = async () => {
        const query = chatInput.value.trim();
        if (!query) return;

        chatInput.value = '';
        const userDiv = document.createElement('div');
        userDiv.className = 'msg user';
        userDiv.textContent = query;
        msgList.appendChild(userDiv);
        msgList.scrollTop = msgList.scrollHeight;

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'msg bot';
        loadingDiv.textContent = 'Analyzing...';
        msgList.appendChild(loadingDiv);
        msgList.scrollTop = msgList.scrollHeight;

        try {
          const res = await fetch(`${apiBaseUrl}/api/v1/widget/rag-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId },
            body: JSON.stringify({ query })
          });
          const data = await res.json();
          loadingDiv.textContent = data.answer || 'Thank you for your question.';

          if (data.foundAnswer) {
            const resCard = document.createElement('div');
            resCard.className = 'res-card';
            resCard.innerHTML = `
              <span>Did this resolve your inquiry?</span>
              <div class="res-actions">
                <button class="res-btn res-yes" id="by">Yes, thanks!</button>
                <button class="res-btn res-no" id="bn">No, file ticket</button>
              </div>
            `;
            msgList.appendChild(resCard);

            resCard.querySelector('#by').addEventListener('click', async () => {
              resCard.innerHTML = '<span style="color:#10b981;">✓ Resolution logged. Glad we could help!</span>';
              await fetch(`${apiBaseUrl}/api/v1/widget/deflect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId },
                body: JSON.stringify({ query, answer: data.answer, confidenceScore: data.confidenceScore || 0.9 })
              });
            });

            resCard.querySelector('#bn').addEventListener('click', () => {
              tabForm.click();
              root.getElementById('f-subject').value = query;
            });
          }
          msgList.scrollTop = msgList.scrollHeight;
        } catch {
          loadingDiv.textContent = 'Connection error. Please try again.';
        }
      };

      sendBtn.addEventListener('click', handleSend);
      chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = root.getElementById('btn-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing with AI...';

        const payload = {
          customerName: root.getElementById('f-name').value,
          customerEmail: root.getElementById('f-email').value,
          subject: root.getElementById('f-subject').value,
          description: root.getElementById('f-desc').value
        };

        try {
          const res = await fetch(`${apiBaseUrl}/api/v1/widget/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          radicadoText.textContent = data.radicadoNumber;
          form.style.display = 'none';
          formSuccess.style.display = 'block';
        } catch {
          alert('Could not submit ticket. Please check connection.');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Formal PQRS';
        }
      });

      btnNewTicket.addEventListener('click', () => {
        form.reset();
        form.style.display = 'block';
        formSuccess.style.display = 'none';
      });
    }
  }

  customElements.define('pqrs-widget', PqrsWidgetElement);

  const mount = () => {
    if (!document.querySelector('pqrs-widget')) {
      document.body.appendChild(document.createElement('pqrs-widget'));
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
