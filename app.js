(function(){
	/** 要素参照 */
	const baseUrlInput = document.getElementById('baseUrl');
	const blocksContainer = document.getElementById('blocks');
	const reqSummarySpan = document.getElementById('reqSummary');
	const statusSpan = document.getElementById('statusCode');
	const durationSpan = document.getElementById('duration');
	const responseBodyPre = document.getElementById('responseBody');
	const responseHeadersPre = document.getElementById('responseHeaders');
	const tabButtons = document.querySelectorAll('.tab');
	const panels = document.querySelectorAll('.panel');

	let defaultsMap = (window && window.REST_API_TEST_DEFAULTS) ? window.REST_API_TEST_DEFAULTS : {};

	/** パスパラメータ収集 */
	function collectPathParams(block){
		const rows = block.querySelectorAll('.path-table .kv-row');
		const obj = {};
		rows.forEach(row=>{
			const keyDiv = row.querySelector('.kv-key');
			const input = row.querySelector('input');
			if(keyDiv && input){ obj[keyDiv.getAttribute('data-key')] = input.value; }
		});
		return obj;
	}

	/** {token} 置換 */
	function replacePathTokens(template, params){
		let path = template;
		Object.keys(params).forEach(k=>{
			const token = '{' + k + '}';
			path = path.split(token).join(encodeURIComponent(params[k] || ''));
		});
		return path;
	}

	/** JSON parse（空ならundefined） */
	function parseBodyJson(text){
		if(!text || !text.trim()) return undefined;
		return JSON.parse(text);
	}

	/** レスポンス欄初期化 */
	function resetResponse(summary){
		reqSummarySpan.textContent = summary || '-';
		statusSpan.textContent = 'Status: ...';
		durationSpan.textContent = 'Time: ...';
		responseBodyPre.textContent = '';
		responseHeadersPre.textContent = '';
	}

	/** レスポンス描画 */
	async function renderResponse(res){
		const headersObj = {}; res.headers.forEach((v, k)=> headersObj[k] = v);
		responseHeadersPre.textContent = JSON.stringify(headersObj, null, 2);
		const contentType = res.headers.get('content-type') || '';
		if(contentType.includes('application/json')){
			const json = await res.json(); responseBodyPre.textContent = JSON.stringify(json, null, 2);
		}else{ const text = await res.text(); responseBodyPre.textContent = text; }
	}

	/** 送信 */
	async function sendBlock(block){
		const baseUrl = (baseUrlInput.value || '').trim().replace(/\/$/, '');
		const templatePath = block.getAttribute('data-path');
		const method = block.getAttribute('data-method');
		const pathParams = collectPathParams(block);
		const filledPath = replacePathTokens(templatePath, pathParams);
		const url = baseUrl + filledPath;

		// JSONテキストボックス読み取り
		const bodyTextarea = block.querySelector('.body-json');
		let init = { method, headers: {} };
		if(method !== 'GET' && method !== 'HEAD'){
			try{
				const parsed = parseBodyJson(bodyTextarea ? bodyTextarea.value : '');
				if(parsed !== undefined){
					init.headers['Content-Type'] = 'application/json;charset=UTF-8';
					init.body = JSON.stringify(parsed);
				}
			}catch(err){
				resetResponse(method + ' ' + url);
				statusSpan.textContent = 'Error';
				responseBodyPre.textContent = 'JSONの構文が不正です: ' + String(err.message || err);
				return; // 送信しない
			}
		}

		resetResponse(method + ' ' + url);
		const start = performance.now();
		try{
			const res = await fetch(url, init);
			const end = performance.now();
			durationSpan.textContent = 'Time: ' + Math.round(end - start) + ' ms';
			statusSpan.textContent = 'Status: ' + res.status + ' ' + res.statusText;
			await renderResponse(res);
		}catch(err){
			const end = performance.now();
			durationSpan.textContent = 'Time: ' + Math.round(end - start) + ' ms';
			statusSpan.textContent = 'Error';
			responseBodyPre.textContent = String(err);
		}
	}

	/** リセットボタン */
	function wireResetButtons(){
		blocksContainer.querySelectorAll('.api-block .body-reset').forEach(btn=>{
			btn.addEventListener('click', (e)=>{
				const block = e.target.closest('.api-block');
				const ta = block.querySelector('.body-json');
				if(ta){
					const key = ta.getAttribute('data-default-key');
					const v = defaultsMap[key];
					ta.value = v ? JSON.stringify(v, null, 2) : '';
				}
			});
		});
	}

	/** 送信ボタン */
	function wireSendButtons(){
		blocksContainer.querySelectorAll('.api-block .send').forEach(btn=>{
			btn.addEventListener('click', (e)=>{
				const block = e.target.closest('.api-block');
				sendBlock(block);
			});
		});
	}

	/** タブ */
	function wireTabs(){
		tabButtons.forEach(btn=>{
			btn.addEventListener('click', ()=>{
				tabButtons.forEach(b=>b.classList.remove('active'));
				panels.forEach(p=>p.classList.remove('active'));
				btn.classList.add('active');
				const id = btn.getAttribute('data-tab');
				const panel = id === 'body' ? responseBodyPre : responseHeadersPre;
				panel.classList.add('active');
			});
		});
	}

	/** defaults.js から初期値を各textareaに反映 */
	function applyDefaults(){
		blocksContainer.querySelectorAll('.api-block .body-json').forEach(ta=>{
			const key = ta.getAttribute('data-default-key');
			const v = defaultsMap[key];
			ta.value = v ? JSON.stringify(v, null, 2) : '';
		});
	}

	// 初期化
	wireResetButtons();
	wireSendButtons();
	wireTabs();
	applyDefaults();
})(); 