const state = {
    currentStep: 0,
    steps: [
        { key: 'step1', title: 'Step 1', hint: '提案/上稿、產業別、客戶名稱' },
        { key: 'step2', title: 'Step 2', hint: '是否搭配數據包與標籤條件' },
        { key: 'step3', title: 'Step 3', hint: '裝置尺寸與是否同步 DV360' },
        { key: 'step4', title: 'Step 4', hint: '版位選擇與出現順序' },
        { key: 'step5', title: 'Step 5', hint: '各版位進階設定與預覽' },
        { key: 'step6', title: 'Step 6', hint: 'API 條件觸發與進階設定' },
        { key: 'step7', title: 'Step 7', hint: '匯出方式與輸出' },
    ],
    form: {
        step1: { type: '', industry: '', client: '' },
        step2: { withDataPack: '否', tags: '' },
        step3: { device: '', withDV360: '否' },
        step4: { placements: [], order: [] },
        step5: {
            cover: {
                needLead: '否',
                leadVideoFile: null,
                playVideo: '否',
                playVideoSource: '',
                playVideoFile: null,
                playVideoUrl: '',
                playVideoTransform: { scale: 1, x: 0, y: 0 },
                needHold: '否',
                holdType: '',
                holdMode: '',
                holdTemplate: '',
                holdAssets: [],
                holdImage: null,
                holdButton: { enabled: '否', imageFile: null },
                needLanding: '否',
                landingUrl: ''
            },
            bottom: {
                needLead: '否',
                leadVideoFile: null,
                playVideo: '否',
                playVideoSource: '',
                playVideoFile: null,
                playVideoUrl: '',
                playVideoTransform: { scale: 1, x: 0, y: 0 },
                needHold: '否',
                holdType: '',
                holdMode: '',
                holdTemplate: '',
                holdAssets: [],
                holdImage: null,
                holdButton: { enabled: '否', imageFile: null },
                needLanding: '否',
                landingUrl: ''
            },
            inline: {
                needLead: '否',
                leadVideoFile: null,
                playVideo: '否',
                playVideoSource: '',
                playVideoFile: null,
                playVideoUrl: '',
                playVideoTransform: { scale: 1, x: 0, y: 0 },
                needHold: '否',
                holdType: '',
                holdMode: '',
                holdTemplate: '',
                holdAssets: [],
                holdImage: null,
                holdButton: { enabled: '否', imageFile: null },
                needLanding: '否',
                landingUrl: ''
            }
        },
        step6: { triggers: [], settings: {} },
        step7: { export: [] },
    }
};

const industries = [
    '電商', '汽車', '3C/家電', '金融', '旅遊/飯店', '美妝保養', '餐飲', '日用品', '教育', '醫療保健', '娛樂/媒體', '房地產'
];

const deviceSizes = ['手機(600x500px)','手機(640x960px)','手機(600x1200px)','PC(1746x450px)'];
const placements = ['蓋版', '置底', '文中'];
const coverLeadSeconds = ['3秒', '4秒', '5秒', '6秒', '8秒', '10秒'];
const bottomTemplates = ['置底版型A','置底版型B','置底版型C','置底版型D','置底版型E','置底版型F','置底版型G','置底版型H','置底版型I'];
const inlineTemplates = ['文中版型A','文中版型B','文中版型C','文中版型D','文中版型E','文中版型F','文中版型G','文中版型H','文中版型I'];
const apiOptions = ['地圖','中原標準時間','溫度','溼度','下雨機率','紫外線指數','空氣品質'];

// ObjectURL 管理，避免記憶體外洩
const objectUrls = new Set();
function makeUrl(file){
    if (!file) return '';
    const u = URL.createObjectURL(file);
    objectUrls.add(u);
    return u;
}
function revokeAllObjectUrls(){
    objectUrls.forEach(u=>{ try { URL.revokeObjectURL(u); } catch(_){} });
    objectUrls.clear();
}

function renderStepper() {
    const wrap = document.getElementById('stepper');
    wrap.innerHTML = '';
    state.steps.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = 'step' + (i === state.currentStep ? ' active' : '') + (i < state.currentStep ? ' completed' : '');
        const idx = document.createElement('div');
        idx.className = 'step-index';
        idx.textContent = i + 1;
        const titleWrap = document.createElement('div');
        const t = document.createElement('div'); t.className = 'step-title'; t.textContent = s.title;
        const h = document.createElement('div'); h.className = 'step-hint'; h.textContent = s.hint;
        titleWrap.appendChild(t); titleWrap.appendChild(h);
        div.appendChild(idx); div.appendChild(titleWrap); div.appendChild(document.createElement('div'));
        div.addEventListener('click', () => { state.currentStep = i; tick(); });
        wrap.appendChild(div);
    });
}

function setHint(text) {
    document.getElementById('step-hint').textContent = text || '';
}

function tick() {
    renderStepper();
    renderStep();
    document.getElementById('btn-back').disabled = state.currentStep === 0;
    document.getElementById('btn-next').textContent = state.currentStep === state.steps.length - 1 ? '完成' : '下一步';
    setHint(state.steps[state.currentStep].hint);
    renderGlobalPreview();
}

function renderStep() {
    revokeAllObjectUrls();
    const host = document.getElementById('form-panel');
    host.innerHTML = '';
    const stepKey = state.steps[state.currentStep].key;
    const map = {
        step1: renderStep1,
        step2: renderStep2,
        step3: renderStep3,
        step4: renderStep4,
        step5: renderStep5,
        step6: renderStep6,
        step7: renderStep7,
    };
    map[stepKey](host);
}

function createField(labelText, inputEl, hint) {
    const field = document.createElement('div'); field.className = 'field';
    const l = document.createElement('label'); l.textContent = labelText; field.appendChild(l);
    field.appendChild(inputEl);
    if (hint) { const m = document.createElement('div'); m.className = 'muted'; m.textContent = hint; field.appendChild(m); }
    return field;
}

// Step 1
function renderStep1(host) {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<h3>Step 1｜基本資訊</h3>';
    const row = document.createElement('div'); row.className = 'row';

    const typeSelect = document.createElement('select');
    ;['', '提案', '上稿'].forEach(v=>{ const o = document.createElement('option'); o.value=v; o.textContent=v||'請選擇'; typeSelect.appendChild(o); });
    typeSelect.value = state.form.step1.type;
    typeSelect.addEventListener('change', e=> state.form.step1.type = e.target.value);

    const industrySel = document.createElement('select');
    const d0 = document.createElement('option'); d0.value=''; d0.textContent='請選擇產業別'; industrySel.appendChild(d0);
    industries.forEach(v=>{ const o = document.createElement('option'); o.value=v; o.textContent=v; industrySel.appendChild(o); });
    industrySel.value = state.form.step1.industry;
    industrySel.addEventListener('change', e=> state.form.step1.industry = e.target.value);

    const clientInput = document.createElement('input'); clientInput.type='text'; clientInput.placeholder='輸入客戶名稱'; clientInput.value = state.form.step1.client; clientInput.addEventListener('input', e=> state.form.step1.client = e.target.value);

    row.appendChild(createField('用途', typeSelect));
    row.appendChild(createField('產業別', industrySel));
    const row2 = document.createElement('div'); row2.className = 'row';
    row2.appendChild(createField('客戶名稱', clientInput));

    wrap.appendChild(row);
    wrap.appendChild(row2);
    host.appendChild(wrap);
}

// Step 2
function renderStep2(host) {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<h3>Step 2｜數據包</h3>';

    const toggle = document.createElement('div'); toggle.className = 'inline';
    const sel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o); });
    sel.value = state.form.step2.withDataPack; sel.addEventListener('change', e=>{ state.form.step2.withDataPack = e.target.value; renderStep(); });
    toggle.appendChild(createField('是否搭配數據包', sel));
    wrap.appendChild(toggle);

    const adv = document.createElement('div');
    if (state.form.step2.withDataPack === '是') {
        const ta = document.createElement('textarea'); ta.rows=3; ta.placeholder='輸入數據包標籤條件（例：性別=女；年齡=25-44；興趣=旅遊）'; ta.value = state.form.step2.tags; ta.addEventListener('input', e=> state.form.step2.tags = e.target.value);
        adv.appendChild(createField('標籤條件', ta, '使用分號分隔條件。'));        
    } else {
        const info = document.createElement('div'); info.className='muted'; info.textContent='未使用數據包，將直接進入下一步。'; adv.appendChild(info);
    }
    wrap.appendChild(adv);
    host.appendChild(wrap);
}

// Step 3
function renderStep3(host) {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<h3>Step 3｜裝置尺寸與 DV360</h3>';

    const row = document.createElement('div'); row.className='row';
    const devSel = document.createElement('select');
    const d0 = document.createElement('option'); d0.value=''; d0.textContent='請選擇裝置'; devSel.appendChild(d0);
    deviceSizes.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; devSel.appendChild(o); });
    devSel.value = state.form.step3.device; devSel.addEventListener('change', e=> { state.form.step3.device = e.target.value; renderGlobalPreview(); });

    const dvSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; dvSel.appendChild(o); });
    dvSel.value = state.form.step3.withDV360; dvSel.addEventListener('change', e=> state.form.step3.withDV360 = e.target.value);

    row.appendChild(createField('裝置尺寸', devSel, '將影響預覽底圖比例與廣告尺寸'));    
    row.appendChild(createField('是否需要同步製作 DV360', dvSel));
    wrap.appendChild(row);
    host.appendChild(wrap);
}

// 全域預覽：根據 Step 3 的裝置與選擇的廣告版位尺寸，模擬底圖比例與廣告實際尺寸（縮放）
function renderGlobalPreview(){
    const host = document.getElementById('global-preview'); if (!host) return;
    host.innerHTML = '';
    // 決定底圖比例（僅依類別：手機/PC）
    const device = state.form.step3.device || '';
    const isPhone = device.startsWith('手機');
    const bgBase = isPhone ? { w: 360, h: 640 } : { w: 1366, h: 768 }; // 示意比例
    // 決定廣告尺寸（從選項解析）
    let ad = null;
    const m = device.match(/\((\d+)x(\d+)px\)/);
    if (m) { ad = { w: parseInt(m[1],10), h: parseInt(m[2],10) }; }

    const frame = document.createElement('div');
    frame.style.width = '100%'; frame.style.maxWidth = '640px'; frame.style.margin = '0 auto';
    frame.style.border = '1px dashed var(--border)'; frame.style.background = '#0b0e12'; frame.style.borderRadius = '10px';
    frame.style.padding = '8px';

    const stage = document.createElement('div');
    stage.style.position='relative'; stage.style.width='100%';
    const ratio = bgBase.h / bgBase.w; // 高寬比
    stage.style.aspectRatio = `${bgBase.w} / ${bgBase.h}`; // 現代瀏覽器
    stage.style.background = 'linear-gradient(180deg, #12161d 0%, #0e1218 100%)';
    stage.style.overflow='hidden'; stage.style.borderRadius='8px';

    // 模擬新聞底圖
    const article = document.createElement('div'); article.style.position='absolute'; article.style.inset='0'; article.style.padding='12px'; article.style.color='#aab4c2'; article.style.fontSize='12px'; article.style.lineHeight='1.5'; article.style.overflow='hidden';
    article.innerHTML = '<div style="height:14px;background:#263043;border-radius:4px;width:70%;margin:6px 0"></div>'.repeat(8);
    stage.appendChild(article);

    if (ad){
        // 計算廣告在預覽中的實際尺寸，確保不同尺寸有明顯差異
        const stageWidth = 600; // 預覽舞台寬度
        const scale = stageWidth / bgBase.w; // 整體縮放比例
        const adDisplayWidth = ad.w * scale;
        const adDisplayHeight = ad.h * scale;
        
        const adBox = document.createElement('div'); 
        adBox.style.position='absolute'; 
        adBox.style.left='50%'; 
        adBox.style.top='50%'; 
        adBox.style.transform='translate(-50%, -50%)';
        adBox.style.width = Math.min(adDisplayWidth, stageWidth * 0.8) + 'px';
        adBox.style.height = Math.min(adDisplayHeight, stageWidth * 0.6) + 'px';
        adBox.style.border='2px solid var(--accent)'; 
        adBox.style.background='rgba(79,140,255,0.08)'; 
        adBox.style.boxShadow='0 0 0 1px rgba(79,140,255,.2) inset';
        adBox.style.borderRadius='4px';
        
        const label = document.createElement('div'); 
        label.textContent = `廣告 ${ad.w}x${ad.h}`; 
        label.style.position='absolute'; 
        label.style.right='6px'; 
        label.style.bottom='6px'; 
        label.style.background='rgba(0,0,0,.7)'; 
        label.style.padding='2px 6px'; 
        label.style.borderRadius='6px'; 
        label.style.fontSize='10px'; 
        label.style.color='#d7e0ee';
        label.style.whiteSpace='nowrap';
        adBox.appendChild(label); 
        stage.appendChild(adBox);
    }

    frame.appendChild(stage);
    const cap = document.createElement('div'); cap.className='muted'; cap.style.marginTop='6px'; cap.textContent = device ? `預覽底圖比例：${isPhone ? '手機' : 'PC'}，廣告顯示尺寸：${ad? `${ad.w}x${ad.h}`:'未選擇'}` : '請在 Step 3 選擇裝置尺寸';
    host.appendChild(frame); host.appendChild(cap);
}

// Step 4
function renderStep4(host) {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<h3>Step 4｜版位選擇與順序</h3>';
    const chips = document.createElement('div'); chips.className='chips';
    const orderBar = document.createElement('div'); orderBar.className='order-bar';

    function togglePlacement(name) {
        const exists = state.form.step4.placements.includes(name);
        if (exists) {
            state.form.step4.placements = state.form.step4.placements.filter(p=>p!==name);
            state.form.step4.order = state.form.step4.order.filter(p=>p!==name);
        } else {
            state.form.step4.placements.push(name);
            state.form.step4.order.push(name);
        }
        renderStep();
    }

    placements.forEach(p=>{
        const c = document.createElement('div'); c.className = 'chip' + (state.form.step4.placements.includes(p) ? ' active' : ''); c.textContent = p; c.addEventListener('click', ()=> togglePlacement(p)); chips.appendChild(c);
    });

    wrap.appendChild(createField('選擇版位（可複選）', chips, '以點選順序作為出現順序。'));

    if (state.form.step4.order.length) {
        state.form.step4.order.forEach((name, idx)=>{
            const item = document.createElement('div'); item.className='order-item';
            const badge = document.createElement('span'); badge.className='idx'; badge.textContent = idx+1;
            const label = document.createElement('span'); label.textContent = name;
            item.appendChild(badge); item.appendChild(label);
            orderBar.appendChild(item);
        });
        const reset = document.createElement('span'); reset.className='order-reset'; reset.textContent='重置順序'; reset.addEventListener('click', ()=>{ state.form.step4.order = [...state.form.step4.placements]; renderStep(); });
        wrap.appendChild(orderBar);
        wrap.appendChild(reset);
    }

    host.appendChild(wrap);
}

// Step 5
function renderStep5(host) {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<h3>Step 5｜進階設定與預覽</h3>';
    if (!state.form.step4.order.length) {
        wrap.appendChild((()=>{ const d=document.createElement('div'); d.className='muted'; d.textContent='請先在 Step 4 選擇至少一個版位。'; return d; })());
        host.appendChild(wrap); return;
    }
    state.form.step4.order.forEach(name=>{
        if (name === '蓋版') wrap.appendChild(renderCoverSettings());
        if (name === '置底') wrap.appendChild(renderBottomSettings());
        if (name === '文中') wrap.appendChild(renderInlineSettings());
    });
    host.appendChild(wrap);
}

function renderCoverSettings() {
    const box = document.createElement('div'); box.className='panel';
    const title = document.createElement('h3'); title.textContent='蓋版｜四步驟設定'; box.appendChild(title);

    // 第一步：是否需要前導特效
    const leadSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; leadSel.appendChild(o); });
    leadSel.value = state.form.step5.cover.needLead; leadSel.addEventListener('change', e=>{ state.form.step5.cover.needLead = e.target.value; renderStep(); });
    box.appendChild(createField('第一步：是否需要前導特效', leadSel));

    if (state.form.step5.cover.needLead === '是') {
        const v = document.createElement('input'); v.type='file'; v.accept='video/*'; v.addEventListener('change', e=>{ state.form.step5.cover.leadVideoFile = (e.target.files||[])[0] || null; });
        box.appendChild(createField('上傳特效影片檔', v));
    }

    // 第二步：是否要播放影片
    const playVideoSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; playVideoSel.appendChild(o); });
    playVideoSel.value = state.form.step5.cover.playVideo; playVideoSel.addEventListener('change', e=>{ state.form.step5.cover.playVideo = e.target.value; renderStep(); });
    box.appendChild(createField('第二步：是否要播放影片', playVideoSel));

    if (state.form.step5.cover.playVideo === '是') {
        const srcSel = document.createElement('select'); ['','上傳影片檔','輸入url網址'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v||'選擇來源'; srcSel.appendChild(o); });
        srcSel.value = state.form.step5.cover.playVideoSource; srcSel.addEventListener('change', e=>{ state.form.step5.cover.playVideoSource = e.target.value; renderStep(); });
        box.appendChild(createField('影片來源', srcSel));

        if (state.form.step5.cover.playVideoSource === '上傳影片檔') {
            const v = document.createElement('input'); v.type='file'; v.accept='video/*'; v.addEventListener('change', e=>{ state.form.step5.cover.playVideoFile = (e.target.files||[])[0] || null; });
            box.appendChild(createField('上傳影片檔', v));
        }
        if (state.form.step5.cover.playVideoSource === '輸入url網址') {
            const t = document.createElement('input'); t.type='text'; t.placeholder='貼上可嵌入之影片網址'; t.value = state.form.step5.cover.playVideoUrl || '';
            t.addEventListener('input', e=>{ state.form.step5.cover.playVideoUrl = e.target.value; });
            box.appendChild(createField('影片網址（iframe）', t, '例如可嵌入的播放網址。'));
        }
    }

    // 第三步：是否需要停留畫面
    const holdSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; holdSel.appendChild(o); });
    holdSel.value = state.form.step5.cover.needHold; holdSel.addEventListener('change', e=>{ state.form.step5.cover.needHold = e.target.value; renderStep(); });
    box.appendChild(createField('第三步：是否需要停留畫面', holdSel));

    if (state.form.step5.cover.needHold === '是') {
        const typeSel = document.createElement('select'); ['','互動式版型','靜態畫面'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v||'請選擇'; typeSel.appendChild(o); });
        typeSel.value = state.form.step5.cover.holdType; typeSel.addEventListener('change', e=>{ state.form.step5.cover.holdType = e.target.value; renderStep(); });
        box.appendChild(createField('停留畫面類型', typeSel));

        if (state.form.step5.cover.holdType === '互動式版型') {
            const modeSel = document.createElement('select'); ['','系統建議版型','自選版型'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v||'請選擇'; modeSel.appendChild(o); });
            modeSel.value = state.form.step5.cover.holdMode; modeSel.addEventListener('change', e=>{ state.form.step5.cover.holdMode = e.target.value; renderStep(); });
            box.appendChild(createField('版型模式', modeSel));

            if (state.form.step5.cover.holdMode === '自選版型') {
                const grid = document.createElement('div'); grid.className='grid-tiles';
                const coverTemplates = ['蓋版版型A','蓋版版型B','蓋版版型C','蓋版版型D','蓋版版型E','蓋版版型F','蓋版版型G','蓋版版型H','蓋版版型I'];
                coverTemplates.forEach(t=>{
                    const tile = document.createElement('div'); tile.className='tile' + (state.form.step5.cover.holdTemplate===t?' active':'');
                    const ph = document.createElement('div'); ph.className='preview';
                    const name = document.createElement('h4'); name.textContent=t;
                    tile.appendChild(ph); tile.appendChild(name);
                    tile.addEventListener('click', ()=>{ state.form.step5.cover.holdTemplate = t; state.form.step5.cover.holdAssets = []; renderStep(); });
                    grid.appendChild(tile);
                });
                box.appendChild(createField('選擇蓋版版型', grid));

                if (state.form.step5.cover.holdTemplate) {
                    const up = document.createElement('input'); up.type='file'; up.multiple=true; up.accept='image/*,video/*';
                    up.addEventListener('change', e=>{ state.form.step5.cover.holdAssets = Array.from(e.target.files||[]); renderStep(); });
                    box.appendChild(createField('上傳素材（示意：需 2 件）', up));

                    box.appendChild(buildCarouselPreview('蓋版互動式預覽', state.form.step5.cover.holdAssets));
                }
            } else if (state.form.step5.cover.holdMode === '系統建議版型') {
                const info = document.createElement('div'); info.className='muted'; info.textContent='將由系統提供建議版型（此版本僅預留按鈕）。';
                box.appendChild(info);
            }
        } else if (state.form.step5.cover.holdType === '靜態畫面') {
            const img = document.createElement('input'); img.type='file'; img.accept='image/*'; img.addEventListener('change', e=>{ state.form.step5.cover.holdImage = (e.target.files||[])[0] || null; });
            box.appendChild(createField('上傳停留畫面底圖', img));

            const btnSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; btnSel.appendChild(o); });
            btnSel.value = state.form.step5.cover.holdButton.enabled; btnSel.addEventListener('change', e=>{ state.form.step5.cover.holdButton.enabled = e.target.value; renderStep(); });
            box.appendChild(createField('是否置放按鈕', btnSel));

            if (state.form.step5.cover.holdButton.enabled === '是') {
                const btnImg = document.createElement('input'); btnImg.type='file'; btnImg.accept='image/*'; btnImg.addEventListener('change', e=>{ state.form.step5.cover.holdButton.imageFile = (e.target.files||[])[0] || null; });
                box.appendChild(createField('上傳按鈕圖片', btnImg));
            }
        }
    }

    // 第四步：是否需要導連著陸頁
    const landingSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; landingSel.appendChild(o); });
    landingSel.value = state.form.step5.cover.needLanding; landingSel.addEventListener('change', e=>{ state.form.step5.cover.needLanding = e.target.value; renderStep(); });
    box.appendChild(createField('第四步：是否需要導連著陸頁', landingSel));

    if (state.form.step5.cover.needLanding === '是') {
        const t = document.createElement('input'); t.type='text'; t.placeholder='輸入著陸頁網址'; t.value = state.form.step5.cover.landingUrl || '';
        t.addEventListener('input', e=>{ state.form.step5.cover.landingUrl = e.target.value; });
        box.appendChild(createField('著陸頁網址', t));
    }

    // 預覽區域
    const prev = document.createElement('div'); prev.className='preview-box';
    const controls = document.createElement('div'); controls.className='inline';
    const btnPlay = document.createElement('button'); btnPlay.className='btn'; btnPlay.textContent='播放';
    const btnPause = document.createElement('button'); btnPause.className='btn'; btnPause.textContent='暫停';
    const btnStop = document.createElement('button'); btnStop.className='btn ghost'; btnStop.textContent='停止';
    controls.appendChild(btnPlay); controls.appendChild(btnPause); controls.appendChild(btnStop);
    const stage = document.createElement('div'); stage.style.minHeight = '220px'; stage.style.display='grid'; stage.style.placeItems='center'; stage.style.overflow='hidden'; stage.style.position='relative';
    prev.appendChild(controls); prev.appendChild(stage);
    const hint = document.createElement('div'); hint.className='muted'; hint.style.marginTop='6px'; hint.textContent='預覽：前導特效 → 播放影片（可拖曳縮放） → 停留畫面';
    prev.appendChild(hint);
    box.appendChild(prev);

    let videoEl = null; let iframeEl = null; let playing = false;
    let isPanning = false; let lastPos = {x:0,y:0};

    function clearStage(){
        stage.innerHTML = '';
        if (videoEl) { try { videoEl.pause(); } catch(_){}; videoEl.src=''; videoEl.remove(); videoEl=null; }
        if (iframeEl) { iframeEl.src='about:blank'; iframeEl.remove(); iframeEl=null; }
    }

    function attachTransformable(el){
        el.style.position='absolute';
        const t = state.form.step5.cover.playVideoTransform || { scale:1, x:0, y:0 };
        function apply(){ el.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`; }
        apply();
        // 滑鼠拖曳
        el.addEventListener('mousedown', (e)=>{ isPanning=true; lastPos={x:e.clientX - t.x, y:e.clientY - t.y}; });
        window.addEventListener('mouseup', ()=> isPanning=false);
        window.addEventListener('mousemove', (e)=>{ if(!isPanning) return; t.x = e.clientX - lastPos.x; t.y = e.clientY - lastPos.y; state.form.step5.cover.playVideoTransform = t; apply(); });
        // 滾輪縮放
        stage.addEventListener('wheel', (e)=>{ e.preventDefault(); const delta = e.deltaY < 0 ? 0.05 : -0.05; t.scale = Math.max(0.2, Math.min(3, (t.scale||1)+delta)); state.form.step5.cover.playVideoTransform = t; apply(); }, { passive:false });
        // 觸控縮放與拖曳
        let touchStartDist = 0; let touchDragging = false;
        stage.addEventListener('touchstart', (e)=>{
            if (e.touches.length===1){ touchDragging=true; lastPos={x:e.touches[0].clientX - t.x, y:e.touches[0].clientY - t.y}; }
            if (e.touches.length===2){ touchDragging=false; touchStartDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); }
        }, { passive:true });
        stage.addEventListener('touchmove', (e)=>{
            if (e.touches.length===1 && touchDragging){ t.x = e.touches[0].clientX - lastPos.x; t.y = e.touches[0].clientY - lastPos.y; state.form.step5.cover.playVideoTransform = t; apply(); }
            if (e.touches.length===2){ const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); const delta = (dist - touchStartDist)/300; t.scale = Math.max(0.2, Math.min(3, (t.scale||1) + delta)); state.form.step5.cover.playVideoTransform = t; apply(); touchStartDist = dist; }
        }, { passive:true });
        stage.addEventListener('touchend', ()=>{ touchDragging=false; });
    }

    function playLeadVideo(next){
        clearStage();
        if (state.form.step5.cover.leadVideoFile){
            videoEl = document.createElement('video'); videoEl.controls=false; videoEl.muted=true; videoEl.playsInline=true; videoEl.style.maxWidth='100%'; videoEl.style.maxHeight='100%';
            videoEl.src = makeUrl(state.form.step5.cover.leadVideoFile); stage.appendChild(videoEl);
            videoEl.onended = ()=> next(); videoEl.play().catch(()=> next()); return;
        }
        next();
    }

    function playMainVideo(next){
        clearStage();
        const src = state.form.step5.cover.playVideoSource;
        if (src === '上傳影片檔' && state.form.step5.cover.playVideoFile){
            videoEl = document.createElement('video'); videoEl.controls=false; videoEl.muted=true; videoEl.playsInline=true; videoEl.style.maxWidth='100%'; videoEl.style.maxHeight='100%';
            videoEl.src = makeUrl(state.form.step5.cover.playVideoFile); stage.appendChild(videoEl); attachTransformable(videoEl);
            videoEl.onended = ()=> next(); videoEl.play().catch(()=> next()); return;
        }
        if (src === '輸入url網址' && state.form.step5.cover.playVideoUrl){
            iframeEl = document.createElement('iframe'); iframeEl.src = state.form.step5.cover.playVideoUrl; iframeEl.allow='autoplay; encrypted-media'; iframeEl.style.border='0'; iframeEl.style.width='560px'; iframeEl.style.height='315px'; stage.appendChild(iframeEl); attachTransformable(iframeEl);
            setTimeout(()=> next(), 10000); return;
        }
        next();
    }

    function showHold(){
        clearStage();
        if (state.form.step5.cover.holdType === '靜態畫面' && state.form.step5.cover.holdImage) {
            const img = document.createElement('img'); img.style.maxWidth='100%'; img.style.maxHeight='100%';
            img.src = makeUrl(state.form.step5.cover.holdImage); stage.appendChild(img);
            
            if (state.form.step5.cover.holdButton.enabled === '是' && state.form.step5.cover.holdButton.imageFile) {
                const btn = document.createElement('img'); btn.style.position='absolute'; btn.style.bottom='20px'; btn.style.right='20px'; btn.style.maxWidth='80px'; btn.style.maxHeight='40px';
                btn.src = makeUrl(state.form.step5.cover.holdButton.imageFile); stage.appendChild(btn);
            }
        }
    }

    function start(){
        playing = true;
        const needLead = state.form.step5.cover.needLead === '是' && !!state.form.step5.cover.leadVideoFile;
        const needPlayVideo = state.form.step5.cover.playVideo === '是' && (state.form.step5.cover.playVideoSource==='上傳影片檔' ? !!state.form.step5.cover.playVideoFile : !!state.form.step5.cover.playVideoUrl);
        const needHold = state.form.step5.cover.needHold === '是';

        function nextAfterLead(){ needPlayVideo ? playMainVideo(nextAfterPlayVideo) : (needHold ? showHold() : clearStage()); }
        function nextAfterPlayVideo(){ needHold ? showHold() : clearStage(); }

        if (needLead) playLeadVideo(nextAfterLead);
        else if (needPlayVideo) playMainVideo(nextAfterPlayVideo);
        else if (needHold) showHold();
        else { clearStage(); }
    }

    function pause(){
        if (!playing) return;
        if (videoEl && !videoEl.paused) { videoEl.pause(); }
    }
    function resume(){
        if (!playing) { start(); return; }
        if (videoEl && videoEl.paused) { videoEl.play().catch(()=>{}); }
    }
    function stop(){ playing=false; clearStage(); }

    btnPlay.addEventListener('click', ()=>{ if (playing) resume(); else start(); });
    btnPause.addEventListener('click', ()=> pause());
    btnStop.addEventListener('click', ()=> stop());
    return box;
}

function renderBottomSettings() {
    const box = document.createElement('div'); box.className='panel';
    const title = document.createElement('h3'); title.textContent='置底｜四步驟設定'; box.appendChild(title);

    // 第一步：是否需要前導特效
    const leadSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; leadSel.appendChild(o); });
    leadSel.value = state.form.step5.bottom.needLead; leadSel.addEventListener('change', e=>{ state.form.step5.bottom.needLead = e.target.value; renderStep(); });
    box.appendChild(createField('第一步：是否需要前導特效', leadSel));

    if (state.form.step5.bottom.needLead === '是') {
        const v = document.createElement('input'); v.type='file'; v.accept='video/*'; v.addEventListener('change', e=>{ state.form.step5.bottom.leadVideoFile = (e.target.files||[])[0] || null; });
        box.appendChild(createField('上傳特效影片檔', v));
    }

    // 第二步：是否要播放影片
    const playVideoSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; playVideoSel.appendChild(o); });
    playVideoSel.value = state.form.step5.bottom.playVideo; playVideoSel.addEventListener('change', e=>{ state.form.step5.bottom.playVideo = e.target.value; renderStep(); });
    box.appendChild(createField('第二步：是否要播放影片', playVideoSel));

    if (state.form.step5.bottom.playVideo === '是') {
        const srcSel = document.createElement('select'); ['','上傳影片檔','輸入url網址'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v||'選擇來源'; srcSel.appendChild(o); });
        srcSel.value = state.form.step5.bottom.playVideoSource; srcSel.addEventListener('change', e=>{ state.form.step5.bottom.playVideoSource = e.target.value; renderStep(); });
        box.appendChild(createField('影片來源', srcSel));

        if (state.form.step5.bottom.playVideoSource === '上傳影片檔') {
            const v = document.createElement('input'); v.type='file'; v.accept='video/*'; v.addEventListener('change', e=>{ state.form.step5.bottom.playVideoFile = (e.target.files||[])[0] || null; });
            box.appendChild(createField('上傳影片檔', v));
        }
        if (state.form.step5.bottom.playVideoSource === '輸入url網址') {
            const t = document.createElement('input'); t.type='text'; t.placeholder='貼上可嵌入之影片網址'; t.value = state.form.step5.bottom.playVideoUrl || '';
            t.addEventListener('input', e=>{ state.form.step5.bottom.playVideoUrl = e.target.value; });
            box.appendChild(createField('影片網址（iframe）', t, '例如可嵌入的播放網址。'));
        }
    }

    // 第三步：是否需要停留畫面
    const holdSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; holdSel.appendChild(o); });
    holdSel.value = state.form.step5.bottom.needHold; holdSel.addEventListener('change', e=>{ state.form.step5.bottom.needHold = e.target.value; renderStep(); });
    box.appendChild(createField('第三步：是否需要停留畫面', holdSel));

    if (state.form.step5.bottom.needHold === '是') {
        const typeSel = document.createElement('select'); ['','互動式版型','靜態畫面'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v||'請選擇'; typeSel.appendChild(o); });
        typeSel.value = state.form.step5.bottom.holdType; typeSel.addEventListener('change', e=>{ state.form.step5.bottom.holdType = e.target.value; renderStep(); });
        box.appendChild(createField('停留畫面類型', typeSel));

        if (state.form.step5.bottom.holdType === '互動式版型') {
            const modeSel = document.createElement('select'); ['','系統建議版型','自選版型'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v||'請選擇'; modeSel.appendChild(o); });
            modeSel.value = state.form.step5.bottom.holdMode; modeSel.addEventListener('change', e=>{ state.form.step5.bottom.holdMode = e.target.value; renderStep(); });
            box.appendChild(createField('版型模式', modeSel));

            if (state.form.step5.bottom.holdMode === '自選版型') {
                const grid = document.createElement('div'); grid.className='grid-tiles';
                const bottomTemplates = ['置底版型A','置底版型B','置底版型C','置底版型D','置底版型E','置底版型F','置底版型G','置底版型H','置底版型I'];
                bottomTemplates.forEach(t=>{
                    const tile = document.createElement('div'); tile.className='tile' + (state.form.step5.bottom.holdTemplate===t?' active':'');
                    const ph = document.createElement('div'); ph.className='preview';
                    const name = document.createElement('h4'); name.textContent=t;
                    tile.appendChild(ph); tile.appendChild(name);
                    tile.addEventListener('click', ()=>{ state.form.step5.bottom.holdTemplate = t; state.form.step5.bottom.holdAssets = []; renderStep(); });
                    grid.appendChild(tile);
                });
                box.appendChild(createField('選擇置底版型', grid));

                if (state.form.step5.bottom.holdTemplate) {
                    const up = document.createElement('input'); up.type='file'; up.multiple=true; up.accept='image/*,video/*';
                    up.addEventListener('change', e=>{ state.form.step5.bottom.holdAssets = Array.from(e.target.files||[]); renderStep(); });
                    box.appendChild(createField('上傳素材（示意：需 2 件）', up));

                    box.appendChild(buildCarouselPreview('置底互動式預覽', state.form.step5.bottom.holdAssets));
                }
            } else if (state.form.step5.bottom.holdMode === '系統建議版型') {
                const info = document.createElement('div'); info.className='muted'; info.textContent='將由系統提供建議版型（此版本僅預留按鈕）。';
                box.appendChild(info);
            }
        } else if (state.form.step5.bottom.holdType === '靜態畫面') {
            const img = document.createElement('input'); img.type='file'; img.accept='image/*'; img.addEventListener('change', e=>{ state.form.step5.bottom.holdImage = (e.target.files||[])[0] || null; });
            box.appendChild(createField('上傳停留畫面底圖', img));

            const btnSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; btnSel.appendChild(o); });
            btnSel.value = state.form.step5.bottom.holdButton.enabled; btnSel.addEventListener('change', e=>{ state.form.step5.bottom.holdButton.enabled = e.target.value; renderStep(); });
            box.appendChild(createField('是否置放按鈕', btnSel));

            if (state.form.step5.bottom.holdButton.enabled === '是') {
                const btnImg = document.createElement('input'); btnImg.type='file'; btnImg.accept='image/*'; btnImg.addEventListener('change', e=>{ state.form.step5.bottom.holdButton.imageFile = (e.target.files||[])[0] || null; });
                box.appendChild(createField('上傳按鈕圖片', btnImg));
            }
        }
    }

    // 第四步：是否需要導連著陸頁
    const landingSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; landingSel.appendChild(o); });
    landingSel.value = state.form.step5.bottom.needLanding; landingSel.addEventListener('change', e=>{ state.form.step5.bottom.needLanding = e.target.value; renderStep(); });
    box.appendChild(createField('第四步：是否需要導連著陸頁', landingSel));

    if (state.form.step5.bottom.needLanding === '是') {
        const t = document.createElement('input'); t.type='text'; t.placeholder='輸入著陸頁網址'; t.value = state.form.step5.bottom.landingUrl || '';
        t.addEventListener('input', e=>{ state.form.step5.bottom.landingUrl = e.target.value; });
        box.appendChild(createField('著陸頁網址', t));
    }

    // 預覽區域
    const prev = document.createElement('div'); prev.className='preview-box';
    const controls = document.createElement('div'); controls.className='inline';
    const btnPlay = document.createElement('button'); btnPlay.className='btn'; btnPlay.textContent='播放';
    const btnPause = document.createElement('button'); btnPause.className='btn'; btnPause.textContent='暫停';
    const btnStop = document.createElement('button'); btnStop.className='btn ghost'; btnStop.textContent='停止';
    controls.appendChild(btnPlay); controls.appendChild(btnPause); controls.appendChild(btnStop);
    const stage = document.createElement('div'); stage.style.minHeight = '220px'; stage.style.display='grid'; stage.style.placeItems='center'; stage.style.overflow='hidden'; stage.style.position='relative';
    prev.appendChild(controls); prev.appendChild(stage);
    const hint = document.createElement('div'); hint.className='muted'; hint.style.marginTop='6px'; hint.textContent='預覽：前導特效 → 播放影片（可拖曳縮放） → 停留畫面';
    prev.appendChild(hint);
    box.appendChild(prev);

    let videoEl = null; let iframeEl = null; let playing = false;
    let isPanning = false; let lastPos = {x:0,y:0};

    function clearStage(){
        stage.innerHTML = '';
        if (videoEl) { try { videoEl.pause(); } catch(_){}; videoEl.src=''; videoEl.remove(); videoEl=null; }
        if (iframeEl) { iframeEl.src='about:blank'; iframeEl.remove(); iframeEl=null; }
    }

    function attachTransformable(el){
        el.style.position='absolute';
        const t = state.form.step5.bottom.playVideoTransform || { scale:1, x:0, y:0 };
        function apply(){ el.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`; }
        apply();
        // 滑鼠拖曳
        el.addEventListener('mousedown', (e)=>{ isPanning=true; lastPos={x:e.clientX - t.x, y:e.clientY - t.y}; });
        window.addEventListener('mouseup', ()=> isPanning=false);
        window.addEventListener('mousemove', (e)=>{ if(!isPanning) return; t.x = e.clientX - lastPos.x; t.y = e.clientY - lastPos.y; state.form.step5.bottom.playVideoTransform = t; apply(); });
        // 滾輪縮放
        stage.addEventListener('wheel', (e)=>{ e.preventDefault(); const delta = e.deltaY < 0 ? 0.05 : -0.05; t.scale = Math.max(0.2, Math.min(3, (t.scale||1)+delta)); state.form.step5.bottom.playVideoTransform = t; apply(); }, { passive:false });
        // 觸控縮放與拖曳
        let touchStartDist = 0; let touchDragging = false;
        stage.addEventListener('touchstart', (e)=>{
            if (e.touches.length===1){ touchDragging=true; lastPos={x:e.touches[0].clientX - t.x, y:e.touches[0].clientY - t.y}; }
            if (e.touches.length===2){ touchDragging=false; touchStartDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); }
        }, { passive:true });
        stage.addEventListener('touchmove', (e)=>{
            if (e.touches.length===1 && touchDragging){ t.x = e.touches[0].clientX - lastPos.x; t.y = e.touches[0].clientY - lastPos.y; state.form.step5.bottom.playVideoTransform = t; apply(); }
            if (e.touches.length===2){ const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); const delta = (dist - touchStartDist)/300; t.scale = Math.max(0.2, Math.min(3, (t.scale||1) + delta)); state.form.step5.bottom.playVideoTransform = t; apply(); touchStartDist = dist; }
        }, { passive:true });
        stage.addEventListener('touchend', ()=>{ touchDragging=false; });
    }

    function playLeadVideo(next){
        clearStage();
        if (state.form.step5.bottom.leadVideoFile){
            videoEl = document.createElement('video'); videoEl.controls=false; videoEl.muted=true; videoEl.playsInline=true; videoEl.style.maxWidth='100%'; videoEl.style.maxHeight='100%';
            videoEl.src = makeUrl(state.form.step5.bottom.leadVideoFile); stage.appendChild(videoEl);
            videoEl.onended = ()=> next(); videoEl.play().catch(()=> next()); return;
        }
        next();
    }

    function playMainVideo(next){
        clearStage();
        const src = state.form.step5.bottom.playVideoSource;
        if (src === '上傳影片檔' && state.form.step5.bottom.playVideoFile){
            videoEl = document.createElement('video'); videoEl.controls=false; videoEl.muted=true; videoEl.playsInline=true; videoEl.style.maxWidth='100%'; videoEl.style.maxHeight='100%';
            videoEl.src = makeUrl(state.form.step5.bottom.playVideoFile); stage.appendChild(videoEl); attachTransformable(videoEl);
            videoEl.onended = ()=> next(); videoEl.play().catch(()=> next()); return;
        }
        if (src === '輸入url網址' && state.form.step5.bottom.playVideoUrl){
            iframeEl = document.createElement('iframe'); iframeEl.src = state.form.step5.bottom.playVideoUrl; iframeEl.allow='autoplay; encrypted-media'; iframeEl.style.border='0'; iframeEl.style.width='560px'; iframeEl.style.height='315px'; stage.appendChild(iframeEl); attachTransformable(iframeEl);
            setTimeout(()=> next(), 10000); return;
        }
        next();
    }

    function showHold(){
        clearStage();
        if (state.form.step5.bottom.holdType === '靜態畫面' && state.form.step5.bottom.holdImage) {
            const img = document.createElement('img'); img.style.maxWidth='100%'; img.style.maxHeight='100%';
            img.src = makeUrl(state.form.step5.bottom.holdImage); stage.appendChild(img);
            
            if (state.form.step5.bottom.holdButton.enabled === '是' && state.form.step5.bottom.holdButton.imageFile) {
                const btn = document.createElement('img'); btn.style.position='absolute'; btn.style.bottom='20px'; btn.style.right='20px'; btn.style.maxWidth='80px'; btn.style.maxHeight='40px';
                btn.src = makeUrl(state.form.step5.bottom.holdButton.imageFile); stage.appendChild(btn);
            }
        }
    }

    function start(){
        playing = true;
        const needLead = state.form.step5.bottom.needLead === '是' && !!state.form.step5.bottom.leadVideoFile;
        const needPlayVideo = state.form.step5.bottom.playVideo === '是' && (state.form.step5.bottom.playVideoSource==='上傳影片檔' ? !!state.form.step5.bottom.playVideoFile : !!state.form.step5.bottom.playVideoUrl);
        const needHold = state.form.step5.bottom.needHold === '是';

        function nextAfterLead(){ needPlayVideo ? playMainVideo(nextAfterPlayVideo) : (needHold ? showHold() : clearStage()); }
        function nextAfterPlayVideo(){ needHold ? showHold() : clearStage(); }

        if (needLead) playLeadVideo(nextAfterLead);
        else if (needPlayVideo) playMainVideo(nextAfterPlayVideo);
        else if (needHold) showHold();
        else { clearStage(); }
    }

    function pause(){
        if (!playing) return;
        if (videoEl && !videoEl.paused) { videoEl.pause(); }
    }
    function resume(){
        if (!playing) { start(); return; }
        if (videoEl && videoEl.paused) { videoEl.play().catch(()=>{}); }
    }
    function stop(){ playing=false; clearStage(); }

    btnPlay.addEventListener('click', ()=>{ if (playing) resume(); else start(); });
    btnPause.addEventListener('click', ()=> pause());
    btnStop.addEventListener('click', ()=> stop());
    return box;
}

function renderInlineSettings() {
    const box = document.createElement('div'); box.className='panel';
    const title = document.createElement('h3'); title.textContent='文中｜四步驟設定'; box.appendChild(title);

    // 第一步：是否需要前導特效
    const leadSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; leadSel.appendChild(o); });
    leadSel.value = state.form.step5.inline.needLead; leadSel.addEventListener('change', e=>{ state.form.step5.inline.needLead = e.target.value; renderStep(); });
    box.appendChild(createField('第一步：是否需要前導特效', leadSel));

    if (state.form.step5.inline.needLead === '是') {
        const v = document.createElement('input'); v.type='file'; v.accept='video/*'; v.addEventListener('change', e=>{ state.form.step5.inline.leadVideoFile = (e.target.files||[])[0] || null; });
        box.appendChild(createField('上傳特效影片檔', v));
    }

    // 第二步：是否要播放影片
    const playVideoSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; playVideoSel.appendChild(o); });
    playVideoSel.value = state.form.step5.inline.playVideo; playVideoSel.addEventListener('change', e=>{ state.form.step5.inline.playVideo = e.target.value; renderStep(); });
    box.appendChild(createField('第二步：是否要播放影片', playVideoSel));

    if (state.form.step5.inline.playVideo === '是') {
        const srcSel = document.createElement('select'); ['','上傳影片檔','輸入url網址'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v||'選擇來源'; srcSel.appendChild(o); });
        srcSel.value = state.form.step5.inline.playVideoSource; srcSel.addEventListener('change', e=>{ state.form.step5.inline.playVideoSource = e.target.value; renderStep(); });
        box.appendChild(createField('影片來源', srcSel));

        if (state.form.step5.inline.playVideoSource === '上傳影片檔') {
            const v = document.createElement('input'); v.type='file'; v.accept='video/*'; v.addEventListener('change', e=>{ state.form.step5.inline.playVideoFile = (e.target.files||[])[0] || null; });
            box.appendChild(createField('上傳影片檔', v));
        }
        if (state.form.step5.inline.playVideoSource === '輸入url網址') {
            const t = document.createElement('input'); t.type='text'; t.placeholder='貼上可嵌入之影片網址'; t.value = state.form.step5.inline.playVideoUrl || '';
            t.addEventListener('input', e=>{ state.form.step5.inline.playVideoUrl = e.target.value; });
            box.appendChild(createField('影片網址（iframe）', t, '例如可嵌入的播放網址。'));
        }
    }

    // 第三步：是否需要停留畫面
    const holdSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; holdSel.appendChild(o); });
    holdSel.value = state.form.step5.inline.needHold; holdSel.addEventListener('change', e=>{ state.form.step5.inline.needHold = e.target.value; renderStep(); });
    box.appendChild(createField('第三步：是否需要停留畫面', holdSel));

    if (state.form.step5.inline.needHold === '是') {
        const typeSel = document.createElement('select'); ['','互動式版型','靜態畫面'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v||'請選擇'; typeSel.appendChild(o); });
        typeSel.value = state.form.step5.inline.holdType; typeSel.addEventListener('change', e=>{ state.form.step5.inline.holdType = e.target.value; renderStep(); });
        box.appendChild(createField('停留畫面類型', typeSel));

        if (state.form.step5.inline.holdType === '互動式版型') {
            const modeSel = document.createElement('select'); ['','系統建議版型','自選版型'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v||'請選擇'; modeSel.appendChild(o); });
            modeSel.value = state.form.step5.inline.holdMode; modeSel.addEventListener('change', e=>{ state.form.step5.inline.holdMode = e.target.value; renderStep(); });
            box.appendChild(createField('版型模式', modeSel));

            if (state.form.step5.inline.holdMode === '自選版型') {
                const grid = document.createElement('div'); grid.className='grid-tiles';
                const inlineTemplates = ['文中版型A','文中版型B','文中版型C','文中版型D','文中版型E','文中版型F','文中版型G','文中版型H','文中版型I'];
                inlineTemplates.forEach(t=>{
                    const tile = document.createElement('div'); tile.className='tile' + (state.form.step5.inline.holdTemplate===t?' active':'');
                    const ph = document.createElement('div'); ph.className='preview';
                    const name = document.createElement('h4'); name.textContent=t;
                    tile.appendChild(ph); tile.appendChild(name);
                    tile.addEventListener('click', ()=>{ state.form.step5.inline.holdTemplate = t; state.form.step5.inline.holdAssets = []; renderStep(); });
                    grid.appendChild(tile);
                });
                box.appendChild(createField('選擇文中版型', grid));

                if (state.form.step5.inline.holdTemplate) {
                    const up = document.createElement('input'); up.type='file'; up.multiple=true; up.accept='image/*,video/*';
                    up.addEventListener('change', e=>{ state.form.step5.inline.holdAssets = Array.from(e.target.files||[]); renderStep(); });
                    box.appendChild(createField('上傳素材（示意：需 2 件）', up));

                    box.appendChild(buildCarouselPreview('文中互動式預覽', state.form.step5.inline.holdAssets));
                }
            } else if (state.form.step5.inline.holdMode === '系統建議版型') {
                const info = document.createElement('div'); info.className='muted'; info.textContent='將由系統提供建議版型（此版本僅預留按鈕）。';
                box.appendChild(info);
            }
        } else if (state.form.step5.inline.holdType === '靜態畫面') {
            const img = document.createElement('input'); img.type='file'; img.accept='image/*'; img.addEventListener('change', e=>{ state.form.step5.inline.holdImage = (e.target.files||[])[0] || null; });
            box.appendChild(createField('上傳停留畫面底圖', img));

            const btnSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; btnSel.appendChild(o); });
            btnSel.value = state.form.step5.inline.holdButton.enabled; btnSel.addEventListener('change', e=>{ state.form.step5.inline.holdButton.enabled = e.target.value; renderStep(); });
            box.appendChild(createField('是否置放按鈕', btnSel));

            if (state.form.step5.inline.holdButton.enabled === '是') {
                const btnImg = document.createElement('input'); btnImg.type='file'; btnImg.accept='image/*'; btnImg.addEventListener('change', e=>{ state.form.step5.inline.holdButton.imageFile = (e.target.files||[])[0] || null; });
                box.appendChild(createField('上傳按鈕圖片', btnImg));
            }
        }
    }

    // 第四步：是否需要導連著陸頁
    const landingSel = document.createElement('select'); ['否','是'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; landingSel.appendChild(o); });
    landingSel.value = state.form.step5.inline.needLanding; landingSel.addEventListener('change', e=>{ state.form.step5.inline.needLanding = e.target.value; renderStep(); });
    box.appendChild(createField('第四步：是否需要導連著陸頁', landingSel));

    if (state.form.step5.inline.needLanding === '是') {
        const t = document.createElement('input'); t.type='text'; t.placeholder='輸入著陸頁網址'; t.value = state.form.step5.inline.landingUrl || '';
        t.addEventListener('input', e=>{ state.form.step5.inline.landingUrl = e.target.value; });
        box.appendChild(createField('著陸頁網址', t));
    }

    // 預覽區域
    const prev = document.createElement('div'); prev.className='preview-box';
    const controls = document.createElement('div'); controls.className='inline';
    const btnPlay = document.createElement('button'); btnPlay.className='btn'; btnPlay.textContent='播放';
    const btnPause = document.createElement('button'); btnPause.className='btn'; btnPause.textContent='暫停';
    const btnStop = document.createElement('button'); btnStop.className='btn ghost'; btnStop.textContent='停止';
    controls.appendChild(btnPlay); controls.appendChild(btnPause); controls.appendChild(btnStop);
    const stage = document.createElement('div'); stage.style.minHeight = '220px'; stage.style.display='grid'; stage.style.placeItems='center'; stage.style.overflow='hidden'; stage.style.position='relative';
    prev.appendChild(controls); prev.appendChild(stage);
    const hint = document.createElement('div'); hint.className='muted'; hint.style.marginTop='6px'; hint.textContent='預覽：前導特效 → 播放影片（可拖曳縮放） → 停留畫面';
    prev.appendChild(hint);
    box.appendChild(prev);

    let videoEl = null; let iframeEl = null; let playing = false;
    let isPanning = false; let lastPos = {x:0,y:0};

    function clearStage(){
        stage.innerHTML = '';
        if (videoEl) { try { videoEl.pause(); } catch(_){}; videoEl.src=''; videoEl.remove(); videoEl=null; }
        if (iframeEl) { iframeEl.src='about:blank'; iframeEl.remove(); iframeEl=null; }
    }

    function attachTransformable(el){
        el.style.position='absolute';
        const t = state.form.step5.inline.playVideoTransform || { scale:1, x:0, y:0 };
        function apply(){ el.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.scale})`; }
        apply();
        // 滑鼠拖曳
        el.addEventListener('mousedown', (e)=>{ isPanning=true; lastPos={x:e.clientX - t.x, y:e.clientY - t.y}; });
        window.addEventListener('mouseup', ()=> isPanning=false);
        window.addEventListener('mousemove', (e)=>{ if(!isPanning) return; t.x = e.clientX - lastPos.x; t.y = e.clientY - lastPos.y; state.form.step5.inline.playVideoTransform = t; apply(); });
        // 滾輪縮放
        stage.addEventListener('wheel', (e)=>{ e.preventDefault(); const delta = e.deltaY < 0 ? 0.05 : -0.05; t.scale = Math.max(0.2, Math.min(3, (t.scale||1)+delta)); state.form.step5.inline.playVideoTransform = t; apply(); }, { passive:false });
        // 觸控縮放與拖曳
        let touchStartDist = 0; let touchDragging = false;
        stage.addEventListener('touchstart', (e)=>{
            if (e.touches.length===1){ touchDragging=true; lastPos={x:e.touches[0].clientX - t.x, y:e.touches[0].clientY - t.y}; }
            if (e.touches.length===2){ touchDragging=false; touchStartDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); }
        }, { passive:true });
        stage.addEventListener('touchmove', (e)=>{
            if (e.touches.length===1 && touchDragging){ t.x = e.touches[0].clientX - lastPos.x; t.y = e.touches[0].clientY - lastPos.y; state.form.step5.inline.playVideoTransform = t; apply(); }
            if (e.touches.length===2){ const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY); const delta = (dist - touchStartDist)/300; t.scale = Math.max(0.2, Math.min(3, (t.scale||1) + delta)); state.form.step5.inline.playVideoTransform = t; apply(); touchStartDist = dist; }
        }, { passive:true });
        stage.addEventListener('touchend', ()=>{ touchDragging=false; });
    }

    function playLeadVideo(next){
        clearStage();
        if (state.form.step5.inline.leadVideoFile){
            videoEl = document.createElement('video'); videoEl.controls=false; videoEl.muted=true; videoEl.playsInline=true; videoEl.style.maxWidth='100%'; videoEl.style.maxHeight='100%';
            videoEl.src = makeUrl(state.form.step5.inline.leadVideoFile); stage.appendChild(videoEl);
            videoEl.onended = ()=> next(); videoEl.play().catch(()=> next()); return;
        }
        next();
    }

    function playMainVideo(next){
        clearStage();
        const src = state.form.step5.inline.playVideoSource;
        if (src === '上傳影片檔' && state.form.step5.inline.playVideoFile){
            videoEl = document.createElement('video'); videoEl.controls=false; videoEl.muted=true; videoEl.playsInline=true; videoEl.style.maxWidth='100%'; videoEl.style.maxHeight='100%';
            videoEl.src = makeUrl(state.form.step5.inline.playVideoFile); stage.appendChild(videoEl); attachTransformable(videoEl);
            videoEl.onended = ()=> next(); videoEl.play().catch(()=> next()); return;
        }
        if (src === '輸入url網址' && state.form.step5.inline.playVideoUrl){
            iframeEl = document.createElement('iframe'); iframeEl.src = state.form.step5.inline.playVideoUrl; iframeEl.allow='autoplay; encrypted-media'; iframeEl.style.border='0'; iframeEl.style.width='560px'; iframeEl.style.height='315px'; stage.appendChild(iframeEl); attachTransformable(iframeEl);
            setTimeout(()=> next(), 10000); return;
        }
        next();
    }

    function showHold(){
        clearStage();
        if (state.form.step5.inline.holdType === '靜態畫面' && state.form.step5.inline.holdImage) {
            const img = document.createElement('img'); img.style.maxWidth='100%'; img.style.maxHeight='100%';
            img.src = makeUrl(state.form.step5.inline.holdImage); stage.appendChild(img);
            
            if (state.form.step5.inline.holdButton.enabled === '是' && state.form.step5.inline.holdButton.imageFile) {
                const btn = document.createElement('img'); btn.style.position='absolute'; btn.style.bottom='20px'; btn.style.right='20px'; btn.style.maxWidth='80px'; btn.style.maxHeight='40px';
                btn.src = makeUrl(state.form.step5.inline.holdButton.imageFile); stage.appendChild(btn);
            }
        }
    }

    function start(){
        playing = true;
        const needLead = state.form.step5.inline.needLead === '是' && !!state.form.step5.inline.leadVideoFile;
        const needPlayVideo = state.form.step5.inline.playVideo === '是' && (state.form.step5.inline.playVideoSource==='上傳影片檔' ? !!state.form.step5.inline.playVideoFile : !!state.form.step5.inline.playVideoUrl);
        const needHold = state.form.step5.inline.needHold === '是';

        function nextAfterLead(){ needPlayVideo ? playMainVideo(nextAfterPlayVideo) : (needHold ? showHold() : clearStage()); }
        function nextAfterPlayVideo(){ needHold ? showHold() : clearStage(); }

        if (needLead) playLeadVideo(nextAfterLead);
        else if (needPlayVideo) playMainVideo(nextAfterPlayVideo);
        else if (needHold) showHold();
        else { clearStage(); }
    }

    function pause(){
        if (!playing) return;
        if (videoEl && !videoEl.paused) { videoEl.pause(); }
    }
    function resume(){
        if (!playing) { start(); return; }
        if (videoEl && videoEl.paused) { videoEl.play().catch(()=>{}); }
    }
    function stop(){ playing=false; clearStage(); }

    btnPlay.addEventListener('click', ()=>{ if (playing) resume(); else start(); });
    btnPause.addEventListener('click', ()=> pause());
    btnStop.addEventListener('click', ()=> stop());
    return box;
}

// 共用：簡易輪播預覽（圖片/影片混合）
function buildCarouselPreview(title, files){
    const wrap = document.createElement('div'); wrap.className='preview-box';
    const header = document.createElement('div'); header.className='muted'; header.textContent = `${title}（點播放啟動輪播）`;
    const controls = document.createElement('div'); controls.className='inline';
    const btnPlay = document.createElement('button'); btnPlay.className='btn'; btnPlay.textContent='播放';
    const btnPause = document.createElement('button'); btnPause.className='btn'; btnPause.textContent='暫停';
    const btnStop = document.createElement('button'); btnStop.className='btn ghost'; btnStop.textContent='停止';
    const stage = document.createElement('div'); stage.style.minHeight='120px'; stage.style.display='grid'; stage.style.placeItems='center';
    controls.appendChild(btnPlay); controls.appendChild(btnPause); controls.appendChild(btnStop);
    wrap.appendChild(header); wrap.appendChild(controls); wrap.appendChild(stage);

    let idx = 0; let timer = null; let videoEl = null; let playing=false;
    const urls = (files||[]).map(f=> makeUrl(f));

    function clear(){
        stage.innerHTML='';
        if (timer) { clearTimeout(timer); timer=null; }
        if (videoEl) { try { videoEl.pause(); } catch(_){}; videoEl.src=''; videoEl.remove(); videoEl=null; }
    }
    function showNext(){
        if (!playing || !urls.length) { clear(); return; }
        clear();
        const file = files[idx]; const url = urls[idx]; idx = (idx + 1) % urls.length;
        if (!file) { timer = setTimeout(showNext, 1500); return; }
        if ((file.type||'').startsWith('video/')){
            videoEl = document.createElement('video'); videoEl.src=url; videoEl.muted=true; videoEl.playsInline=true; videoEl.style.maxWidth='100%'; videoEl.style.maxHeight='140px'; stage.appendChild(videoEl);
            videoEl.onended = ()=>{ timer = setTimeout(showNext, 300); };
            videoEl.play().catch(()=>{ timer = setTimeout(showNext, 1200); });
        } else {
            const img = document.createElement('img'); img.src=url; img.style.maxWidth='100%'; img.style.maxHeight='140px'; stage.appendChild(img);
            timer = setTimeout(showNext, 1200);
        }
    }
    function play(){ if (playing) return; playing=true; showNext(); }
    function pause(){ playing=false; if (timer){ clearTimeout(timer); timer=null; } if (videoEl && !videoEl.paused){ videoEl.pause(); } }
    function stop(){ playing=false; idx=0; clear(); }
    btnPlay.addEventListener('click', play);
    btnPause.addEventListener('click', pause);
    btnStop.addEventListener('click', stop);

    if (!files || !files.length){ const empty = document.createElement('div'); empty.className='muted'; empty.textContent='尚未上傳素材'; wrap.appendChild(empty); }
    return wrap;
}

// Step 6
function renderStep6(host) {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<h3>Step 6｜API 條件觸發</h3>';

    const chips = document.createElement('div'); chips.className='chips';
    function toggle(name){
        const on = state.form.step6.triggers.includes(name);
        if (on) state.form.step6.triggers = state.form.step6.triggers.filter(v=>v!==name);
        else state.form.step6.triggers.push(name);
        renderStep();
    }
    apiOptions.forEach(n=>{
        const c = document.createElement('div'); c.className='chip' + (state.form.step6.triggers.includes(n)?' active':''); c.textContent=n; c.addEventListener('click', ()=> toggle(n)); chips.appendChild(c);
    });
    wrap.appendChild(createField('選擇觸發條件（可複選）', chips));

    const adv = document.createElement('div');
    state.form.step6.triggers.forEach(n=>{
        if (n==='地圖') {
            const f1 = document.createElement('input'); f1.type='text'; f1.placeholder='設定定位條件（例：住家定位半徑100公尺內）'; f1.value = state.form.step6.settings.geo||''; f1.addEventListener('input', e=>{ state.form.step6.settings.geo = e.target.value; });
            const f2 = document.createElement('input'); f2.type='file'; f2.multiple=true; f2.accept='.csv,.xlsx,.txt'; f2.addEventListener('change', e=>{ state.form.step6.settings.geoFiles = Array.from(e.target.files||[]); });
            adv.appendChild(createField('地圖｜定位條件', f1, '需要客戶提供分店地址'));
            adv.appendChild(createField('地圖｜資料上傳', f2, '批次或逐筆上傳分店地址資料'));
        }
        if (n==='中原標準時間') {
            const f = document.createElement('input'); f.type='text'; f.placeholder='廣告點擊時觸發'; f.value = state.form.step6.settings.time||''; f.addEventListener('input', e=>{ state.form.step6.settings.time = e.target.value; });
            adv.appendChild(createField('中原標準時間｜觸發條件', f, '廣告點擊時觸發'));
        }
        if (n==='溫度') {
            const f1 = document.createElement('input'); f1.type='text'; f1.placeholder='溫度高於或低於幾度，不投放廣告'; f1.value = state.form.step6.settings.tempCondition||''; f1.addEventListener('input', e=>{ state.form.step6.settings.tempCondition = e.target.value; });
            const f2 = document.createElement('input'); f2.type='text'; f2.placeholder='溫度達一定條件時，投放不同素材'; f2.value = state.form.step6.settings.tempMaterial||''; f2.addEventListener('input', e=>{ state.form.step6.settings.tempMaterial = e.target.value; });
            adv.appendChild(createField('溫度｜特殊觸發條件', f1, '依定位，如溫度高於或低於幾度，不投放廣告'));
            adv.appendChild(createField('溫度｜素材投放條件', f2, '或溫度達一定條件時，投放不同素材'));
        }
        if (n==='溼度') {
            const f1 = document.createElement('input'); f1.type='text'; f1.placeholder='溼度高於或低於多少，不投放廣告'; f1.value = state.form.step6.settings.humCondition||''; f1.addEventListener('input', e=>{ state.form.step6.settings.humCondition = e.target.value; });
            const f2 = document.createElement('input'); f2.type='text'; f2.placeholder='溼度達一定條件時，投放不同素材'; f2.value = state.form.step6.settings.humMaterial||''; f2.addEventListener('input', e=>{ state.form.step6.settings.humMaterial = e.target.value; });
            adv.appendChild(createField('溼度｜特殊觸發條件', f1, '依定位，如溼度高於或低於多少，不投放廣告'));
            adv.appendChild(createField('溼度｜素材投放條件', f2, '或溼度達一定條件時，投放不同素材'));
        }
        if (n==='下雨機率') {
            const f1 = document.createElement('input'); f1.type='text'; f1.placeholder='機率高於或低於多少，不投放廣告'; f1.value = state.form.step6.settings.rainCondition||''; f1.addEventListener('input', e=>{ state.form.step6.settings.rainCondition = e.target.value; });
            const f2 = document.createElement('input'); f2.type='text'; f2.placeholder='機率達一定條件時，投放不同素材'; f2.value = state.form.step6.settings.rainMaterial||''; f2.addEventListener('input', e=>{ state.form.step6.settings.rainMaterial = e.target.value; });
            adv.appendChild(createField('下雨機率｜特殊觸發條件', f1, '依定位，如機率高於或低於多少，不投放廣告'));
            adv.appendChild(createField('下雨機率｜素材投放條件', f2, '或機率達一定條件時，投放不同素材'));
        }
        if (n==='紫外線指數') {
            const f1 = document.createElement('input'); f1.type='text'; f1.placeholder='分級高於或低於多少，不投放廣告'; f1.value = state.form.step6.settings.uviCondition||''; f1.addEventListener('input', e=>{ state.form.step6.settings.uviCondition = e.target.value; });
            const f2 = document.createElement('input'); f2.type='text'; f2.placeholder='分級達一定條件時，投放不同素材'; f2.value = state.form.step6.settings.uviMaterial||''; f2.addEventListener('input', e=>{ state.form.step6.settings.uviMaterial = e.target.value; });
            adv.appendChild(createField('紫外線指數｜特殊觸發條件', f1, '依定位，如分級高於或低於多少，不投放廣告'));
            adv.appendChild(createField('紫外線指數｜素材投放條件', f2, '或分級達一定條件時，投放不同素材'));
        }
        if (n==='空氣品質') {
            const f1 = document.createElement('input'); f1.type='text'; f1.placeholder='分級高於或低於多少，不投放廣告'; f1.value = state.form.step6.settings.aqiCondition||''; f1.addEventListener('input', e=>{ state.form.step6.settings.aqiCondition = e.target.value; });
            const f2 = document.createElement('input'); f2.type='text'; f2.placeholder='分級達一定條件時，投放不同素材'; f2.value = state.form.step6.settings.aqiMaterial||''; f2.addEventListener('input', e=>{ state.form.step6.settings.aqiMaterial = e.target.value; });
            adv.appendChild(createField('空氣品質｜特殊觸發條件', f1, '依定位，如分級高於或低於多少，不投放廣告'));
            adv.appendChild(createField('空氣品質｜素材投放條件', f2, '或分級達一定條件時，投放不同素材'));
        }
    });
    wrap.appendChild(adv);

    host.appendChild(wrap);
}

// Step 7
function renderStep7(host) {
    const wrap = document.createElement('div');
    wrap.innerHTML = '<h3>Step 7｜匯出</h3>';
    const options = ['下載html壓縮包', 'url連結', 'QR code'];
    const chips = document.createElement('div'); chips.className='chips';
    function toggle(name){
        const on = state.form.step7.export.includes(name);
        if (on) state.form.step7.export = state.form.step7.export.filter(v=>v!==name);
        else state.form.step7.export.push(name);
        renderStep();
    }
    options.forEach(n=>{
        const c = document.createElement('div'); c.className='chip' + (state.form.step7.export.includes(n)?' active':''); c.textContent=n; c.addEventListener('click', ()=> toggle(n)); chips.appendChild(c);
    });
    wrap.appendChild(createField('選擇匯出方式（可複選）', chips));

    const out = document.createElement('div'); out.className='preview-box';
    out.innerHTML = '<div class="muted">完成後將依選擇提供對應輸出：檔案下載、可分享 URL、或 QR 圖碼。</div>';
    wrap.appendChild(out);
    host.appendChild(wrap);
}

document.getElementById('btn-back').addEventListener('click', ()=>{ if (state.currentStep>0){ state.currentStep--; tick(); }});
document.getElementById('btn-next').addEventListener('click', ()=>{
    if (state.currentStep < state.steps.length - 1) {
        state.currentStep++;
        tick();
    } else {
        alert('設定完成！可前往匯出或下載。');
    }
});
document.getElementById('btn-save').addEventListener('click', ()=>{
    try {
        localStorage.setItem('richmedia-studio-state', JSON.stringify(state.form));
        alert('已暫存');
    } catch(e) { alert('暫存失敗'); }
});

(function restore(){
    try {
        const raw = localStorage.getItem('richmedia-studio-state');
        if (raw) {
            const f = JSON.parse(raw);
            state.form = Object.assign({}, state.form, f);
        }
    } catch(e){}
})();

tick();


