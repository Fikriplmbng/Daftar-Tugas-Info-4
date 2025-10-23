// Simple To-Do app for students using localStorage
    (function(){
      // Dom refs
      const app = document.getElementById('app');
      const listEl = document.getElementById('list');
      const btnAdd = document.getElementById('btnAdd');
      const qInput = document.getElementById('q');
      const fAll = document.getElementById('fAll');
      const fDone = document.getElementById('fDone');
      const fPending = document.getElementById('fPending');
      const countInfo = document.getElementById('countInfo');
      const sortBtn = document.getElementById('sortBtn');
      const resetBtn = document.getElementById('resetBtn');
      const btnSettings = document.getElementById('btnSettings');

      const modalTpl = document.getElementById('modalTpl');
      const settingsTpl = document.getElementById('settingsTpl');

      // State
      let tasks = [];
      let filter = 'all';
      let sortBy = localStorage.getItem('todolist_sort') || 'deadline';
      let theme = localStorage.getItem('todolist_theme') || 'light';
      app.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');

      // Load tasks from storage
      function load(){
        const raw = localStorage.getItem('todolist_tasks');
        tasks = raw ? JSON.parse(raw) : [];
        render();
      }
      function save(){
        localStorage.setItem('todolist_tasks', JSON.stringify(tasks));
      }

      // Utility
      function uid(){ return 't'+Math.random().toString(36).slice(2,9) }

      // Render functions
      function render(){
        // apply search and filter
        const q = qInput.value.trim().toLowerCase();
        let visible = tasks.slice();

        // search
        if(q){
          visible = visible.filter(t => (t.name + ' ' + t.course + ' ' + (t.notes||'')).toLowerCase().includes(q));
        }

        // filter
        if(filter === 'done') visible = visible.filter(t => t.done);
        else if(filter === 'pending') visible = visible.filter(t => !t.done);

        // sort
        if(sortBy === 'deadline'){
          visible.sort((a,b) => {
            if(!a.deadline) return 1;
            if(!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
          });
          sortBtn.textContent = 'Urut: Deadline ⌄';
        } else if(sortBy === 'name'){
          visible.sort((a,b)=> a.name.localeCompare(b.name));
          sortBtn.textContent = 'Urut: Nama ⌄';
        } else if(sortBy === 'status'){
          visible.sort((a,b)=> (a.done === b.done) ? 0 : (a.done ? 1 : -1));
          sortBtn.textContent = 'Urut: Status ⌄';
        }

        listEl.innerHTML = '';
        if(visible.length === 0){
          const empty = document.createElement('div');
          empty.style.color = 'var(--muted)';
          empty.textContent = 'Tidak ada tugas yang sesuai.';
          listEl.appendChild(empty);
        } else {
          visible.forEach(renderTask);
        }

        // update count
        countInfo.textContent = tasks.length + ' tugas • ' + tasks.filter(t=>t.done).length + ' selesai';
      }

      function renderTask(task){
        const el = document.createElement('article');
        el.className = 'task';
        el.dataset.id = task.id;

        const title = document.createElement('h3');
        title.textContent = task.name;

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.innerHTML = `<strong>${escapeHTML(task.course || 'Umum')}</strong> • Deadline: ${task.deadline ? formatDate(task.deadline) : '—'}`;

        const notes = document.createElement('div');
        notes.style.color = 'var(--muted)';
        notes.style.fontSize = '14px';
        notes.textContent = task.notes || '';

        const actions = document.createElement('div');
        actions.className = 'actions';

        const doneBtn = document.createElement('button');
        doneBtn.className = 'chip ' + (task.done ? 'done' : '');
        doneBtn.textContent = task.done ? '✔️ Selesai' : '⬜ Tandai Selesai';
        doneBtn.title = 'Tandai selesai';
        doneBtn.addEventListener('click', ()=> toggleDone(task.id));

        const editBtn = document.createElement('button');
        editBtn.className = 'chip';
        editBtn.textContent = '✏️ Edit';
        editBtn.addEventListener('click', ()=> openModal(task.id));

        const delBtn = document.createElement('button');
        delBtn.className = 'chip danger';
        delBtn.textContent = '🗑️ Hapus';
        delBtn.addEventListener('click', ()=> {
          if(confirm('Hapus tugas "'+task.name+'" ?')) {
            tasks = tasks.filter(t=>t.id !== task.id);
            save(); render();
            notify('Tugas dihapus');
          }
        });

        actions.appendChild(doneBtn);
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        el.appendChild(title);
        el.appendChild(meta);
        if(task.notes) el.appendChild(notes);
        el.appendChild(actions);

        // visual for priority
        if(task.priority === 'high'){
          const p = document.createElement('div');
          p.style.marginTop = '6px';
          p.innerHTML = '<span style="color:var(--danger);font-weight:700">⚠️ Prioritas Tinggi</span>';
          el.appendChild(p);
        }

        listEl.appendChild(el);
      }

      // Formatting
      function formatDate(d){
        try{
          const dt = new Date(d);
          if(isNaN(dt)) return d;
          const opt = { day:'2-digit', month:'long', year:'numeric' };
          return dt.toLocaleDateString('id-ID', opt);
        } catch(e){ return d }
      }

      function escapeHTML(s){
        return s ? s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : '';
      }

      // Actions
      function toggleDone(id){
        const t = tasks.find(x=>x.id===id);
        if(!t) return;
        t.done = !t.done;
        save(); render();
        notify(t.done ? 'Tugas ditandai selesai' : 'Tugas dibuka kembali');
      }

      // Quick notify (temporary)
      function notify(msg){
        const el = document.createElement('div');
        el.textContent = msg;
        el.style.position = 'fixed';
        el.style.right = '18px';
        el.style.bottom = '18px';
        el.style.background = 'var(--card)';
        el.style.color = 'var(--text)';
        el.style.padding = '10px 14px';
        el.style.borderRadius = '10px';
        el.style.border = '1px solid var(--glass)';
        el.style.boxShadow = '0 6px 18px rgba(2,6,23,0.18)';
        document.body.appendChild(el);
        setTimeout(()=> el.style.opacity = '0', 2200);
        setTimeout(()=> el.remove(), 2600);
      }

      // Modal: add/edit
      function openModal(editId){
        const tpl = modalTpl.content.cloneNode(true);
        const backdrop = tpl.querySelector('.modal-backdrop');
        const titleEl = tpl.getElementById('modalTitle');
        const taskName = tpl.getElementById('taskName');
        const courseName = tpl.getElementById('courseName');
        const deadline = tpl.getElementById('deadline');
        const priority = tpl.getElementById('priority');
        const notes = tpl.getElementById('notes');
        const btnCancel = tpl.getElementById('btnCancel');
        const btnSave = tpl.getElementById('btnSave');

        let editing = null;
        if(editId){
          editing = tasks.find(t => t.id === editId);
          if(editing){
            titleEl.textContent = 'Edit Tugas';
            taskName.value = editing.name;
            courseName.value = editing.course;
            deadline.value = editing.deadline || '';
            priority.value = editing.priority || 'normal';
            notes.value = editing.notes || '';
          }
        } else {
          titleEl.textContent = 'Tambah Tugas Baru';
        }

        function close(){
          backdrop.remove();
        }

        btnCancel.addEventListener('click', close);

        backdrop.addEventListener('click', (ev)=>{
          if(ev.target === backdrop) close();
        });

        btnSave.addEventListener('click', ()=>{
          const name = taskName.value.trim();
          if(!name){
            alert('Nama tugas tidak boleh kosong');
            taskName.focus();
            return;
          }
          const obj = {
            id: editing ? editing.id : uid(),
            name,
            course: courseName.value.trim(),
            deadline: deadline.value || '',
            priority: priority.value,
            notes: notes.value.trim(),
            done: editing ? editing.done : false,
            createdAt: editing ? editing.createdAt : new Date().toISOString()
          };

          if(editing){
            tasks = tasks.map(t => t.id === editing.id ? obj : t);
            notify('Tugas diperbarui');
          } else {
            tasks.unshift(obj); // newest first
            notify('Tugas ditambahkan');
          }

          save();
          close();
          render();
        });

        document.body.appendChild(backdrop);
        taskName.focus();
      }

      // Settings modal
      function openSettings(){
        const tpl = settingsTpl.content.cloneNode(true);
        const backdrop = tpl.querySelector('.modal-backdrop');

        const themeLight = tpl.getElementById('themeLight');
        const themeDark = tpl.getElementById('themeDark');

        const sDeadline = tpl.getElementById('sortDeadline');
        const sName = tpl.getElementById('sortName');
        const sStatus = tpl.getElementById('sortStatus');
        const closeSettings = tpl.getElementById('closeSettings');

        function close(){ backdrop.remove(); }

        themeLight.addEventListener('click', ()=> setTheme('light'));
        themeDark.addEventListener('click', ()=> setTheme('dark'));

        sDeadline.addEventListener('click', ()=> { sortBy='deadline'; localStorage.setItem('todolist_sort','deadline'); render(); close(); });
        sName.addEventListener('click', ()=> { sortBy='name'; localStorage.setItem('todolist_sort','name'); render(); close(); });
        sStatus.addEventListener('click', ()=> { sortBy='status'; localStorage.setItem('todolist_sort','status'); render(); close(); });

        closeSettings.addEventListener('click', close);

        backdrop.addEventListener('click', (ev)=>{
          if(ev.target === backdrop) close();
        });

        document.body.appendChild(backdrop);
      }

      function setTheme(t){
        theme = t;
        app.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
        localStorage.setItem('todolist_theme', t);
        notify('Tema diubah: ' + (t==='dark' ? 'Gelap' : 'Terang'));
      }

      // Events
      btnAdd.addEventListener('click', ()=> openModal());
      qInput.addEventListener('input', ()=> render());

      fAll.addEventListener('click', ()=> { filter='all'; setFilterButtons(); render(); });
      fDone.addEventListener('click', ()=> { filter='done'; setFilterButtons(); render(); });
      fPending.addEventListener('click', ()=> { filter='pending'; setFilterButtons(); render(); });

      sortBtn.addEventListener('click', ()=> {
        // cycle through sort options
        if(sortBy === 'deadline') { sortBy = 'name'; }
        else if(sortBy === 'name') { sortBy = 'status'; }
        else { sortBy = 'deadline'; }
        localStorage.setItem('todolist_sort', sortBy);
        render();
      });

      resetBtn.addEventListener('click', ()=> {
        if(confirm('Reset semua data tugas? (tidak bisa dibatalkan)')){
          tasks = [];
          save();
          render();
          notify('Semua data dihapus');
        }
      });

      btnSettings.addEventListener('click', openSettings);

      // filter UI
      function setFilterButtons(){
        [fAll,fDone,fPending].forEach(b => b.classList.remove('active'));
        if(filter === 'all') fAll.classList.add('active');
        if(filter === 'done') fDone.classList.add('active');
        if(filter === 'pending') fPending.classList.add('active');
      }

      // initial sample if empty (for demo)
      function seedIfEmpty(){
        if(localStorage.getItem('todolist_tasks')) return;
        tasks = [
          { id: uid(), name:'Laporan IMK', course:'Interaksi Manusia dan Komputer', deadline: nextDate(2), priority:'high', notes:'Sertakan evaluasi heuristik', done:false, createdAt: new Date().toISOString()},
          { id: uid(), name:'Makalah AI', course:'Kecerdasan Buatan', deadline: nextDate(5), priority:'normal', notes:'Gunakan referensi terbaru', done:true, createdAt: new Date().toISOString()}
        ];
        save();
      }
      function nextDate(addDays){
        const d = new Date(); d.setDate(d.getDate()+addDays);
        return d.toISOString().slice(0,10);
      }

      // boot
      seedIfEmpty();
      load();
      setFilterButtons();

      // accessibility: keyboard 'n' to add
      window.addEventListener('keydown', (e)=>{
        if(e.key === '`' && !e.metaKey && !e.ctrlKey && !e.altKey){
          e.preventDefault(); openModal();
        }
      });

      // expose some helpers for debugging (optional)
      window._todolist = {
        get tasks(){ return tasks },
        save, load
      };
    })();