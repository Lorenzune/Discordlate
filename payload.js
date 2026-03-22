console.log("[Discordlate] Payload script is running in the Discord Web UI");

// Inject CSS to hide annoying default Discord buttons (Gift and Stickers)
const styleObj = document.createElement('style');
styleObj.textContent = `
    div[class*="buttons_"] [aria-label*="Regal" i], 
    div[class*="buttons_"] [aria-label*="gift" i], 
    div[class*="buttons_"] [aria-label*="adesiv" i], 
    div[class*="buttons_"] [aria-label*="sticker" i] {
        display: none !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
    }
`;
document.head.appendChild(styleObj);

async function translateText(text, targetLang = 'it') {
    if (!text || text.trim() === '') return text;
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await window.fetch(url);
        const data = await res.json();
        return data[0].map(item => item[0]).join('');
    } catch (e) {
        console.error("[Discordlate] Translation Error", e);
        return text;
    }
}

// Map to store Outgoing messages: Translated Output -> Original Input map
window.discordlateSentTranslations = window.discordlateSentTranslations || new Map();
window.discordlateEnableTranslation = true; // Toggle state
window.discordlateLangOut = window.discordlateLangOut || 'en'; // Target outgoing language
window.discordlateLangIn = window.discordlateLangIn || 'it'; // Target incoming language

window.discordlateLangOptionsMap = [
    {c: 'af', n: 'Afrikaans'}, {c: 'sq', n: 'Albanian'}, {c: 'am', n: 'Amharic'}, {c: 'ar', n: 'Arabic'},
    {c: 'hy', n: 'Armenian'}, {c: 'az', n: 'Azerbaijani'}, {c: 'eu', n: 'Basque'}, {c: 'be', n: 'Belarusian'},
    {c: 'bn', n: 'Bengali'}, {c: 'bs', n: 'Bosnian'}, {c: 'bg', n: 'Bulgarian'}, {c: 'ca', n: 'Catalan'},
    {c: 'ceb', n: 'Cebuano'}, {c: 'ny', n: 'Chichewa'}, {c: 'zh-CN', n: 'Chinese (Simplified)'}, 
    {c: 'zh-TW', n: 'Chinese (Traditional)'}, {c: 'co', n: 'Corsican'}, {c: 'hr', n: 'Croatian'},
    {c: 'cs', n: 'Czech'}, {c: 'da', n: 'Danish'}, {c: 'nl', n: 'Dutch'}, {c: 'en', n: 'English'},
    {c: 'eo', n: 'Esperanto'}, {c: 'et', n: 'Estonian'}, {c: 'tl', n: 'Filipino'}, {c: 'fi', n: 'Finnish'},
    {c: 'fr', n: 'French'}, {c: 'fy', n: 'Frisian'}, {c: 'gl', n: 'Galician'}, {c: 'ka', n: 'Georgian'},
    {c: 'de', n: 'German'}, {c: 'el', n: 'Greek'}, {c: 'gu', n: 'Gujarati'}, {c: 'ht', n: 'Haitian Creole'},
    {c: 'ha', n: 'Hausa'}, {c: 'haw', n: 'Hawaiian'}, {c: 'iw', n: 'Hebrew'}, {c: 'hi', n: 'Hindi'},
    {c: 'hmn', n: 'Hmong'}, {c: 'hu', n: 'Hungarian'}, {c: 'is', n: 'Icelandic'}, {c: 'ig', n: 'Igbo'},
    {c: 'id', n: 'Indonesian'}, {c: 'ga', n: 'Irish'}, {c: 'it', n: 'Italian'}, {c: 'ja', n: 'Japanese'},
    {c: 'jw', n: 'Javanese'}, {c: 'kn', n: 'Kannada'}, {c: 'kk', n: 'Kazakh'}, {c: 'km', n: 'Khmer'},
    {c: 'rw', n: 'Kinyarwanda'}, {c: 'ko', n: 'Korean'}, {c: 'ku', n: 'Kurdish'}, {c: 'ky', n: 'Kyrgyz'},
    {c: 'lo', n: 'Lao'}, {c: 'la', n: 'Latin'}, {c: 'lv', n: 'Latvian'}, {c: 'lt', n: 'Lithuanian'},
    {c: 'lb', n: 'Luxembourgish'}, {c: 'mk', n: 'Macedonian'}, {c: 'mg', n: 'Malagasy'}, {c: 'ms', n: 'Malay'},
    {c: 'ml', n: 'Malayalam'}, {c: 'mt', n: 'Maltese'}, {c: 'mi', n: 'Maori'}, {c: 'mr', n: 'Marathi'},
    {c: 'mn', n: 'Mongolian'}, {c: 'my', n: 'Myanmar'}, {c: 'ne', n: 'Nepali'}, {c: 'no', n: 'Norwegian'},
    {c: 'or', n: 'Odia'}, {c: 'ps', n: 'Pashto'}, {c: 'fa', n: 'Persian'}, {c: 'pl', n: 'Polish'},
    {c: 'pt', n: 'Portuguese'}, {c: 'pa', n: 'Punjabi'}, {c: 'ro', n: 'Romanian'}, {c: 'ru', n: 'Russian'},
    {c: 'sm', n: 'Samoan'}, {c: 'gd', n: 'Scots'}, {c: 'sr', n: 'Serbian'}, {c: 'st', n: 'Sesotho'},
    {c: 'sn', n: 'Shona'}, {c: 'sd', n: 'Sindhi'}, {c: 'si', n: 'Sinhala'}, {c: 'sk', n: 'Slovak'},
    {c: 'sl', n: 'Slovenian'}, {c: 'so', n: 'Somali'}, {c: 'es', n: 'Spanish'}, {c: 'su', n: 'Sundanese'},
    {c: 'sw', n: 'Swahili'}, {c: 'sv', n: 'Swedish'}, {c: 'tg', n: 'Tajik'}, {c: 'ta', n: 'Tamil'},
    {c: 'tt', n: 'Tatar'}, {c: 'te', n: 'Telugu'}, {c: 'th', n: 'Thai'}, {c: 'tr', n: 'Turkish'},
    {c: 'tk', n: 'Turkmen'}, {c: 'uk', n: 'Ukrainian'}, {c: 'ur', n: 'Urdu'}, {c: 'ug', n: 'Uyghur'},
    {c: 'uz', n: 'Uzbek'}, {c: 'vi', n: 'Vietnamese'}, {c: 'cy', n: 'Welsh'}, {c: 'xh', n: 'Xhosa'},
    {c: 'yi', n: 'Yiddish'}, {c: 'yo', n: 'Yoruba'}, {c: 'zu', n: 'Zulu'}
];
window.discordlateLangOptionsHTML = window.discordlateLangOptionsMap.map(l => `<option value="${l.c}" style="background-color: var(--background-floating, #111214); color: var(--text-normal, #dbdee1); font-family: inherit; font-size: 14px;">${l.n}</option>`).join('');

// Monkey-patch fetch to intercept outgoing messages
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const url = args[0];
    const options = args[1];

    if (window.discordlateEnableTranslation && url && typeof url === 'string' && url.includes('/api/') && url.includes('/messages') && options && options.method === 'POST') {
        try {
            const boundaryBody = options.body;
            if (typeof boundaryBody === 'string') {
                const bodyJson = JSON.parse(boundaryBody);
                if (bodyJson && typeof bodyJson.content === 'string' && bodyJson.content.trim() !== '') {
                    const originalItalianText = bodyJson.content;
                    console.log("[Discordlate] Intercepted outgoing message:", originalItalianText);
                    
                    // Translate original -> target out before sending
                    const englishText = await translateText(originalItalianText, window.discordlateLangOut);
                    bodyJson.content = englishText;
                    options.body = JSON.stringify(bodyJson);
                    
                    window.discordlateSentTranslations.set(englishText, originalItalianText);
                    console.log(`[Discordlate] Transformed outgoing message -> "${englishText}"`);
                }
            }
        } catch(e) { 
            // ignore JSON parse error, could be multipart/form-data
        }
    }
    return originalFetch.apply(this, args);
};

// Monkey-patch XMLHttpRequest to intercept outgoing messages
const OriginalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    let requestMethod = '';
    let requestUrl = '';
    
    xhr.open = function(method, url) {
        requestMethod = method;
        requestUrl = url;
        return originalOpen.apply(this, arguments);
    };
    
    xhr.send = function(body) {
        if (window.discordlateEnableTranslation && requestUrl && typeof requestUrl === 'string' && requestUrl.includes('/api/') && requestUrl.includes('/messages') && requestMethod === 'POST') {
            try {
                if (typeof body === 'string') {
                    const bodyJson = JSON.parse(body);
                    if (bodyJson && typeof bodyJson.content === 'string' && bodyJson.content.trim() !== '') {
                        const originalItalianText = bodyJson.content;
                        console.log("[Discordlate] Intercepted outgoing XHR message:", originalItalianText);
                        
                        // We must translate asynchronously, then call originalSend
                        translateText(originalItalianText, window.discordlateLangOut).then(englishText => {
                            bodyJson.content = englishText;
                            window.discordlateSentTranslations.set(englishText, originalItalianText);
                            console.log(`[Discordlate] Transformed outgoing XHR -> "${englishText}"`);
                            originalSend.call(xhr, JSON.stringify(bodyJson));
                        }).catch(e => {
                            console.error("[Discordlate] XHR Translation Error:", e);
                            originalSend.call(xhr, body);
                        });
                        
                        return; // Prevent synchronous send
                    }
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }
        return originalSend.apply(this, arguments);
    };
    
    return xhr;
};

// Use MutationObserver for visual formatting
const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length > 0) {
            m.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    
                    // Look for message content nodes (Discord uses id="message-content-XXX")
                    let messageNodes = [];
                    if (node.matches && node.matches('[id^="message-content-"]')) {
                        messageNodes.push(node);
                    } else if (node.querySelectorAll) {
                        messageNodes = Array.from(node.querySelectorAll('[id^="message-content-"]'));
                    }

                    for (const el of messageNodes) {
                        if (el.dataset.discordlateHandled) continue;
                        
                        // Extract text
                        const rawText = el.innerText || el.textContent;
                        if (!rawText || rawText.trim() === '') continue;

                        // Mark as handled to prevent infinite loops when we replace innerHTML
                        el.dataset.discordlateHandled = "true";
                        
                        // Process the message asynchronously
                        (async () => {
                            if (window.discordlateSentTranslations.has(rawText)) {
                                // It's an outgoing message that we sent in English
                                const originalItalian = window.discordlateSentTranslations.get(rawText);
                                el.innerHTML = `<span style="opacity: 0.7; font-size: 0.85em;">${originalItalian}</span><br><span style="font-size: 1em;"><img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Translate_logo.svg" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; margin-bottom: 2px;">${rawText}</span>`;
                            } else {
                                // It's an incoming message (or ours not translated). Auto-translate.
                                const translatedToItalian = await translateText(rawText, window.discordlateLangIn);
                                if (translatedToItalian && translatedToItalian !== rawText) {
                                    el.innerHTML = `<span style="opacity: 0.7; font-size: 0.85em;">${rawText}</span><br><span style="font-size: 1em;"><img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Translate_logo.svg" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; margin-bottom: 2px;">${translatedToItalian}</span>`;
                                }
                            }
                        })().catch(err => console.error("[Discordlate] UI rendering error:", err));
                    }
                }
            });
        }
    }
    
    // Inject Toggle Button into Chat Bar
    const textAreas = document.querySelectorAll('div[class*="channelTextArea_"]');
    textAreas.forEach(area => {
        if (!area.dataset.discordlateButtonInjected) {
            const buttonsContainer = area.querySelector('div[class*="buttons_"]');
            if (buttonsContainer) {
                area.dataset.discordlateButtonInjected = "true";
                const toggleBtn = document.createElement('div');
                toggleBtn.style.cssText = "display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; cursor: pointer; filter: grayscale(100%); transition: all 0.2s; margin-right: 4px; font-size: 18px;";
                toggleBtn.title = "Toggle Discordlate Translation";
                toggleBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Translate_logo.svg" style="width: 20px; height: 20px;">';
                
                if (window.discordlateEnableTranslation) {
                    toggleBtn.style.filter = "grayscale(0%)";
                    toggleBtn.style.opacity = "1";
                } else {
                    toggleBtn.style.filter = "grayscale(100%)";
                    toggleBtn.style.opacity = "0.5";
                }
                
                toggleBtn.onclick = () => {
                    window.discordlateEnableTranslation = !window.discordlateEnableTranslation;
                    if (window.discordlateEnableTranslation) {
                        toggleBtn.style.filter = "grayscale(0%)";
                        toggleBtn.style.opacity = "1";
                    } else {
                        toggleBtn.style.filter = "grayscale(100%)";
                        toggleBtn.style.opacity = "0.5";
                    }
                };
                
                // Settings Button
                const settingsBtn = document.createElement('div');
                settingsBtn.style.cssText = "display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; cursor: pointer; filter: grayscale(100%); transition: all 0.2s; margin-right: 4px; font-size: 18px;";
                settingsBtn.title = "Discordlate Settings";
                settingsBtn.innerHTML = "⚙️";
                settingsBtn.onmouseover = () => { settingsBtn.style.filter = "grayscale(0%)"; };
                settingsBtn.onmouseout = () => { settingsBtn.style.filter = "grayscale(100%)"; };
                settingsBtn.onclick = () => {
                    const modal = document.getElementById('discordlate-modal');
                    if(modal) {
                        document.getElementById('discordlate-lang-in').value = window.discordlateLangIn;
                        document.getElementById('discordlate-lang-out').value = window.discordlateLangOut;
                        if (window.discordlateOpenModal) {
                            window.discordlateOpenModal();
                        } else {
                            modal.style.display = 'flex';
                        }
                    }
                };

                buttonsContainer.insertBefore(settingsBtn, buttonsContainer.firstChild);
                buttonsContainer.insertBefore(toggleBtn, buttonsContainer.firstChild);
                
                // Guided Tour Popout
                if (!localStorage.getItem('discordlate_tour_v2')) {
                    localStorage.setItem('discordlate_tour_v2', 'true');
                    setTimeout(() => {
                        const btnRect = toggleBtn.getBoundingClientRect();
                        if (btnRect.width === 0) return;
                        
                        // We check if it already exists in case of multiple text areas
                        if (document.getElementById('discordlate-tour')) return;

                        const tourHtml = `
                        <div id="discordlate-tour" style="position: fixed; top: ${btnRect.top - 145}px; left: ${btnRect.left - 200}px; z-index: 100000; background: var(--brand-experiment, #5865F2); color: white; padding: 16px; border-radius: 8px; font-family: 'gg sans', sans-serif; box-shadow: 0 8px 16px rgba(0,0,0,0.4); animation: discordlate-bounce 2s infinite; width: 240px;">
                            <style>
                                @keyframes discordlate-bounce {
                                    0%, 100% { transform: translateY(0); }
                                    50% { transform: translateY(-5px); }
                                }
                                #discordlate-tour::after {
                                    content: ''; position: absolute; bottom: -8px; right: 26px; border-width: 8px 8px 0; border-style: solid; border-color: var(--brand-experiment, #5865F2) transparent transparent transparent;
                                }
                            </style>
                            <h3 style="margin: 0 0 8px; font-size: 16px; display: flex; align-items: center; gap: 8px;"><img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Translate_logo.svg" style="width: 16px; height: 16px;"> Discordlate Tour</h3>
                            <p style="margin: 0; font-size: 13px; line-height: 1.4;">Click the Translate icon below to quickly toggle translations.<br><br>Click the ⚙️ icon to configure your incoming/outgoing languages!</p>
                            <div style="text-align: right; margin-top: 12px;">
                                <button onclick="document.getElementById('discordlate-tour').remove(); if(window.discordlateOpenModal) window.discordlateOpenModal();" style="background: rgba(0,0,0,0.25); color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.4)'" onmouseout="this.style.background='rgba(0,0,0,0.25)'">Got it! (Open Settings)</button>
                            </div>
                        </div>
                        `;
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = tourHtml;
                        document.body.appendChild(tempDiv.firstElementChild);
                    }, 1500);
                }
            }
        }
    });

});

// Observe DOM
observer.observe(document.body, { childList: true, subtree: true });
console.log("[Discordlate] MutationObserver is now watching for messages.");

// --- DISCORDLATE MODAL INJECTION ---
if (!document.getElementById('discordlate-modal')) {
    const modalHTML = `
    <div id="discordlate-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 99999; background: rgba(0, 0, 0, 0.85); justify-content: center; align-items: center; opacity: 0; transition: opacity 0.2s ease-out; backdrop-filter: blur(4px);">
        <div id="discordlate-modal-inner" style="background: var(--background-primary, #313338); border-radius: 12px; width: 440px; color: var(--text-normal, #dbdee1); font-family: 'gg sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.5); display: flex; flex-direction: column; overflow: hidden; transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
            
            <!-- Header -->
            <div style="padding: 24px 24px 16px; text-align: center;">
                <h2 style="margin: 0; color: var(--header-primary, #f2f3f5); font-size: 24px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Translate_logo.svg" style="width: 24px; height: 24px;"> Discordlate Settings
                </h2>
                <p style="margin: 8px 0 0; font-size: 14px; color: var(--header-secondary, #b5bac1);">Configure your automated translation preferences.</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 0 24px 24px; display: flex; flex-direction: column; gap: 20px;">
                
                <!-- Tutorial Banner -->
                <div style="background: linear-gradient(90deg, rgba(88, 101, 242, 0.15), rgba(88, 101, 242, 0.05)); border-left: 4px solid var(--brand-experiment, #5865F2); padding: 14px 16px; border-radius: 4px 8px 8px 4px; display: flex; gap: 12px; align-items: center; margin-bottom: 4px;">
                    <div style="background: var(--brand-experiment, #5865F2); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(88,101,242,0.4);">
                        <span style="font-size: 14px; color: white;">✨</span>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: var(--text-normal, #dbdee1); line-height: 1.5;">
                        <strong style="color: var(--brand-experiment, #5865f2); display: block; font-size: 14px; margin-bottom: 2px;">Welcome to Discordlate!</strong>
                        You can fast-toggle translations ON or OFF anytime by clicking the <strong style="color: white; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px;"><img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Translate_logo.svg" style="width: 12px; height: 12px;"> icon</strong> in your chat bar.
                    </p>
                </div>
                
                <!-- Incoming -->
                <div style="background: var(--background-secondary, #2b2d31); padding: 16px; border-radius: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-weight: 700; font-size: 12px; color: var(--header-secondary, #b5bac1); text-transform: uppercase;">
                        <span>📥</span> Translate INCOMING messages to
                    </label>
                    <div style="position: relative;">
                        <select id="discordlate-lang-in" style="width: 100%; padding: 12px; background: var(--background-tertiary, #1e1f22); color: var(--text-normal); border: 1px solid var(--background-modifier-accent, rgba(255,255,255,0.06)); border-radius: 4px; outline: none; font-family: inherit; font-size: 15px; font-weight: 500; cursor: pointer; appearance: none;">
                            ${window.discordlateLangOptionsHTML}
                        </select>
                        <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; opacity: 0.5;">▼</div>
                    </div>
                </div>
                
                <!-- Outgoing -->
                <div style="background: var(--background-secondary, #2b2d31); padding: 16px; border-radius: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-weight: 700; font-size: 12px; color: var(--header-secondary, #b5bac1); text-transform: uppercase;">
                        <span>📤</span> Translate OUTGOING messages to
                    </label>
                    <div style="position: relative;">
                        <select id="discordlate-lang-out" style="width: 100%; padding: 12px; background: var(--background-tertiary, #1e1f22); color: var(--text-normal); border: 1px solid var(--background-modifier-accent, rgba(255,255,255,0.06)); border-radius: 4px; outline: none; font-family: inherit; font-size: 15px; font-weight: 500; cursor: pointer; appearance: none;">
                            ${window.discordlateLangOptionsHTML}
                        </select>
                        <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; opacity: 0.5;">▼</div>
                    </div>
                </div>
                
            </div>
            
            <!-- Footer -->
            <div style="background: var(--background-secondary, #2b2d31); padding: 16px 24px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--background-modifier-accent, rgba(0,0,0,0.2));">
                <button id="discordlate-close-btn" style="background: transparent; color: var(--text-normal); border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer; font-weight: 500; font-family: inherit; font-size: 14px; transition: text-decoration 0.2s;">Cancel</button>
                <button id="discordlate-save-btn" style="background: var(--button-positive-background, #248046); color: white; border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer; font-weight: 500; font-family: inherit; font-size: 14px; transition: background 0.2s;">Save Settings</button>
            </div>
            
        </div>
    </div>
    `;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    document.body.appendChild(tempDiv.firstElementChild);

    const modalWrapper = document.getElementById('discordlate-modal');
    const modalInner = document.getElementById('discordlate-modal-inner');

    const openModal = () => {
        modalWrapper.style.display = 'flex';
        // force reflow before opacity change for transition to work
        void modalWrapper.offsetWidth; 
        modalWrapper.style.opacity = '1';
        modalInner.style.transform = 'scale(1)';
    };

    const closeModal = () => {
        modalWrapper.style.opacity = '0';
        modalInner.style.transform = 'scale(0.95)';
        setTimeout(() => { modalWrapper.style.display = 'none'; }, 200);
    };

    window.discordlateOpenModal = openModal;

    document.getElementById('discordlate-close-btn').addEventListener('mouseenter', e => { e.target.style.textDecoration = 'underline'; });
    document.getElementById('discordlate-close-btn').addEventListener('mouseleave', e => { e.target.style.textDecoration = 'none'; });
    document.getElementById('discordlate-save-btn').addEventListener('mouseenter', e => { e.target.style.backgroundColor = '#1a6334'; });
    document.getElementById('discordlate-save-btn').addEventListener('mouseleave', e => { e.target.style.backgroundColor = '#248046'; });

    document.getElementById('discordlate-close-btn').onclick = closeModal;
    
    document.getElementById('discordlate-save-btn').onclick = () => {
        window.discordlateLangIn = document.getElementById('discordlate-lang-in').value;
        window.discordlateLangOut = document.getElementById('discordlate-lang-out').value;
        closeModal();
        console.log(`[Discordlate] Settings saved: In=${window.discordlateLangIn}, Out=${window.discordlateLangOut}`);
    };
    
    modalWrapper.addEventListener('click', (e) => {
        if (e.target === modalWrapper) {
            closeModal();
        }
    });
}

