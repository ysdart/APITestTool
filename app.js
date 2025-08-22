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

	/**
	 * ブロックに含まれる固定ボディ値を収集
	 * @param {HTMLElement} block
	 * @returns {Record<string,string>}
	 */
	function collectFixedBody(block){
		const rows = block.querySelectorAll('.kv-table .kv-row');
		const obj = {};
		rows.forEach(row=>{
			const keyDiv = row.querySelector('.kv-key');
			const input = row.querySelector('input');
			if(keyDiv && input){
				const key = keyDiv.getAttribute('data-key');
				obj[key] = input.value;
			}
		});
		return obj;
	}

	/**
	 * ブロックに含まれるパスパラメータ値を収集
	 * @param {HTMLElement} block
	 * @returns {Record<string,string>}
	 */
	function collectPathParams(block){
		const rows = block.querySelectorAll('.path-table .kv-row');
		const obj = {};
		rows.forEach(row=>{
			const keyDiv = row.querySelector('.kv-key');
			const input = row.querySelector('input');
			if(keyDiv && input){
				const key = keyDiv.getAttribute('data-key');
				obj[key] = input.value;
			}
		});
		return obj;
	}

	/**
	 * {token} を値で置換してURLパスを作成
	 * @param {string} template
	 * @param {Record<string,string>} params
	 */
	function replacePathTokens(template, params){
		let path = template;
		Object.keys(params).forEach(k=>{
			const token = '{' + k + '}';
			const value = encodeURIComponent(params[k] || '');
			path = path.split(token).join(value);
		});
		return path;
	}

	/**
	 * 右側のレスポンス表示を初期化
	 * @param {string} summary
	 */
	function resetResponse(summary){
		reqSummarySpan.textContent = summary || '-';
		statusSpan.textContent = 'Status: ...';
		durationSpan.textContent = 'Time: ...';
		responseBodyPre.textContent = '';
		responseHeadersPre.textContent = '';
	}

	/** レスポンス描画 */
	async function renderResponse(res){
		const headersObj = {}; res.headers.forEach((v, k)=> headersObj[k]=v);
		responseHeadersPre.textContent = JSON.stringify(headersObj, null, 2);
		const contentType = res.headers.get('content-type') || '';
		if(contentType.includes('application/json')){
			const json = await res.json(); responseBodyPre.textContent = JSON.stringify(json, null, 2);
		}else{ const text = await res.text(); responseBodyPre.textContent = text; }
	}

	/**
	 * ブロック内容からURLとinitを構築して送信
	 * @param {HTMLElement} block
	 */
	async function sendBlock(block){
		const baseUrl = (baseUrlInput.value || '').trim().replace(/\/$/, '');
		const templatePath = block.getAttribute('data-path');
		const method = block.getAttribute('data-method');
		const pathParams = collectPathParams(block);
		const filledPath = replacePathTokens(templatePath, pathParams);
		const url = baseUrl + filledPath;

		const bodyObj = collectFixedBody(block);
		const init = { method, headers: {} };
		if(method !== 'GET' && method !== 'HEAD'){
			init.headers['Content-Type'] = 'application/json;charset=UTF-8';
			init.body = JSON.stringify(bodyObj);
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

	/** 送信ボタンを紐付け */
	function wireSendButtons(){
		blocksContainer.querySelectorAll('.api-block .send').forEach(btn=>{
			btn.addEventListener('click', (e)=>{
				const block = e.target.closest('.api-block');
				sendBlock(block);
			});
		});
	}

	/** タブ切替 */
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

	// 初期化
	wireSendButtons();
	wireTabs();
})(); 