/* ---------------------------
   ORIGINAL CODE (unchanged)
   ---------------------------
   All original functions kept: UI toggles, encryptCaesar, encryptMessage,
   decryptMessage, charToNumber, numberToChar, decryptCaesarCipher,
   checkEncryptForm, checkDecryptForm, and event listeners.
   This portion follows your original file closely.
   (I left comments minimal and didn't alter cryptographic logic.)
---------------------------- */

const container = document.getElementById('container');
const decryptBtn = document.getElementById('decryptBtn');
const encryptBtn = document.getElementById('encryptBtn');

if (decryptBtn && encryptBtn) {
  decryptBtn.addEventListener('click', () => {
      container.classList.add("active");
  });

  encryptBtn.addEventListener('click', () => {
      container.classList.remove("active");
  });
}

function encryptCaesar(word, shift) {
    let result = '';
    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (char.match(/[a-z]/i)) {
            let code = word.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
            }
        }
        result += char;
    }
    return result;
}

function numberToLetter(num) {
    return String.fromCharCode('A'.charCodeAt(0) + num);
}

function encryptMessage() {
    let word = document.getElementById('message').value;
    let shift = parseInt(document.getElementById('shift').value);
    let methodInput = document.getElementById('method').value.toLowerCase();
    let r = parseInt(document.getElementById('r').value);
    let l = parseInt(document.getElementById('l').value);
    let j = parseInt(document.getElementById('loops').value);

    let method = methodInput === 'sine' ? 1 : methodInput === 'cosine' ? 2 : 0;

    word = encryptCaesar(word, shift);

    let M = [];
    for (let c of word) {
        if (c.match(/[A-Z]/)) {
            M.push(c.charCodeAt(0) - 'A'.charCodeAt(0));
        } else if (c.match(/[a-z]/)) {
            M.push(c.charCodeAt(0) - 'a'.charCodeAt(0));
        }
    }

    let len = M.length;
    let K = [shift, method];
    let C = Array(len).fill(0);

    let r_letter = numberToLetter(r);
    let l_letter = numberToLetter(l);

    for (let loop = 0; loop < j; loop++) {
        let currentK = Array(len).fill(0);

        if (method === 1) { // sine method
            for (let i = 0; i < len; i++) {
                let R = Math.pow(r, 2 * i + 1);
                let sum = 1;
                for (let n = 2; n <= l + 1; n++) {
                    sum *= (2 * i + n);
                }
                let product = M[i] * R * sum;
                C[i] = (product % 26 + 26) % 26;
                currentK[i] = Math.floor(product / 26);
            }
        } else if (method === 2) { // cosine method
            for (let i = 0; i < len; i++) {
                let R = Math.pow(r, 2 * i);
                let sum = 1;
                for (let n = 1; n <= l; n++) {
                    sum *= (2 * i + n);
                }
                let product = M[i] * R * sum;
                C[i] = (product % 26 + 26) % 26;
                currentK[i] = Math.floor(product / 26);
            }
        }

        K = K.concat(currentK);
        M = C;
    }

    word = word.toUpperCase() + r_letter + l_letter;

    let keySetString = K.join(' ');

    for (let i = 0; i < len; i++) {
        word = word.slice(0, i) + String.fromCharCode(C[i] + 'A'.charCodeAt(0)) + word.slice(i + 1);
    }

    const encryptMessageForm = document.getElementById('encryptMessageForm');
    encryptMessageForm.style.display = 'none';

    const loading = document.getElementById('loadingEncrypt');
    loading.style.display = 'flex';

    setTimeout(() => {
        loading.style.display = 'none';

        const encryptedMessage = document.getElementById('encryptedMessage');
        
        encryptedMessage.style.display = 'flex';
        document.getElementById('encMsg').textContent = word;
        document.getElementById('keySet').textContent = keySetString;
    }, 2000);
}

function charToNumber(ch) {
    return ch.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
}

function numberToChar(num) {
    return String.fromCharCode('A'.charCodeAt(0) + num);
}

function decryptCaesarCipher(encryptedWord, shift) {
    let decryptedWord = '';
    for (let i = 0; i < encryptedWord.length; i++) {
        let ch = encryptedWord[i];
        if (/[a-zA-Z]/.test(ch)) {
            let base = ch >= 'a' ? 'a'.charCodeAt(0) : 'A'.charCodeAt(0);
            ch = String.fromCharCode(base + (ch.charCodeAt(0) - base - shift + 26) % 26);
        }
        decryptedWord += ch;
    }
    return decryptedWord;
}

function decryptMessage() {
    const decryptMessageForm = document.getElementById('decryptMessageForm');
    const encryptMessageForm = document.getElementById('encryptMessageForm');
    const encryptedMessage = document.getElementById('encryptedMessage');
    const loadingDecrypt = document.getElementById('loadingDecrypt');
    const decryptedMessage = document.getElementById('decryptedMessage');
    encryptMessageForm.style.display = 'none';
    encryptedMessage.style.display = 'none';

    let encryptedWord = document.getElementById('encryptedInput').value;
    let keysInput = document.getElementById('keysInput').value.trim();

    let sanitizedKeysInput = keysInput.replace(/[^\d\s]/g, '').replace(/\s+/g, ' ');

    let splitKeys = sanitizedKeysInput.split(' ').filter(key => key !== '');

    let keys = splitKeys.map(Number);

    let j = encryptedWord.length;
    let C = encryptedWord.split('').map(charToNumber);

    let l = C.pop();
    j--;
    let r = C.pop();
    j--;

    let [shift, method, ...remainingkeys] = keys;
    keys = remainingkeys;

    let numKeys = keys.length;
    let loop = Math.floor(numKeys / j);

    for (let l_cnt = 0; l_cnt < loop; l_cnt++) {
        let M = new Array(j);

        if (method === 1) {
            for (let i = 0; i < j; i++) {
                let R = Math.pow(r, 2 * i + 1);
                let sum = 1;
                for (let n = 2; n <= l + 1; n++) {
                    sum *= (2 * i + n);
                }
                let K_value = keys[numKeys - j + i];
                M[i] = Math.floor((C[i] + 26 * K_value) / (R * sum));
            }
            C = M;
        } else if (method === 2) {
            for (let i = 0; i < j; i++) {
                let R = Math.pow(r, 2 * i);
                let sum = 1;
                for (let n = 1; n <= l; n++) {
                    sum *= (2 * i + n);
                }
                let K_value = keys[numKeys - j + i];
                M[i] = Math.floor((C[i] + 26 * K_value) / (R * sum));
            }
            C = M;
        }

        keys = keys.slice(0, numKeys - j);
        numKeys -= j;
    }

    let resultWord = C.map(numberToChar).join('');

    let decryptedWord = decryptCaesarCipher(resultWord, shift);

    decryptMessageForm.style.display = 'none';

    loadingDecrypt.style.display = 'flex';
    setTimeout(() => {
        loadingDecrypt.style.display = 'none';
        decryptedMessage.style.display = 'flex';
        document.getElementById('decMsg').innerText = 'Original message: ' + decryptedWord;
    }, 2000);
}

function checkEncryptForm() {
    const message = document.getElementById('message').value;
    const shift = document.getElementById('shift').value;
    const method = document.getElementById('method').value;
    const r = document.getElementById('r').value;
    const l = document.getElementById('l').value;
    const loops = document.getElementById('loops').value;
    const encryptButton = document.getElementById('encryptMessageBtn');

    if (message && shift && method && r && l && loops) {
        encryptButton.disabled = false;
    } else {
        encryptButton.disabled = true;
    }
}

function checkDecryptForm() {
    const encryptedInput = document.getElementById('encryptedInput').value;
    const keysInput = document.getElementById('keysInput').value;
    const decryptButton = document.getElementById('decryptMessageBtn');

    if (encryptedInput && keysInput) {
        decryptButton.disabled = false;
    } else {
        decryptButton.disabled = true;
    }
}

// Attach event listeners to the input fields to monitor changes
document.getElementById('message').addEventListener('input', checkEncryptForm);
document.getElementById('shift').addEventListener('input', checkEncryptForm);
document.getElementById('method').addEventListener('input', checkEncryptForm);
document.getElementById('r').addEventListener('input', checkEncryptForm);
document.getElementById('l').addEventListener('input', checkEncryptForm);
document.getElementById('loops').addEventListener('input', checkEncryptForm);

document.getElementById('encryptedInput').addEventListener('input', checkDecryptForm);
document.getElementById('keysInput').addEventListener('input', checkDecryptForm);


/* ----------------------------
   NEW: copy-both JSON helper
   ----------------------------
   Appended module (non-invasive). Watches #encMsg and #keySet, enables
   #copyBothBtn when both are present, copies JSON to clipboard and auto-fills
   decrypt inputs. Also supports paste-handling of the JSON package.
----------------------------- */

(function () {
    // Element references (may exist already from original DOM)
    let encMsgEl = document.getElementById('encMsg');
    let keySetEl = document.getElementById('keySet');
    const copyBothBtn = document.getElementById('copyBothBtn');

    const encryptedInput = document.getElementById('encryptedInput');
    const keysInput = document.getElementById('keysInput');
    const decryptBtnLocal = document.getElementById('decryptMessageBtn');

    function fallbackWriteText(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { console.warn('fallback copy failed', e); }
        document.body.removeChild(ta);
    }

    async function copyBothAsJSONAndPaste() {
        const enc = (encMsgEl && encMsgEl.textContent) ? encMsgEl.textContent.trim() : '';
        const keys = (keySetEl && keySetEl.textContent) ? keySetEl.textContent.trim() : '';

        if (!enc && !keys) {
            alert('Nothing to copy — encrypt a message first.');
            return;
        }

        const payload = { enc: enc, keys: keys };
        const jsonString = JSON.stringify(payload);

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(jsonString);
            } catch (err) {
                console.warn('clipboard.writeText failed, fallback used', err);
                fallbackWriteText(jsonString);
            }
        } else {
            fallbackWriteText(jsonString);
        }

        // Auto-fill decrypt inputs on this page
        if (encryptedInput) {
            encryptedInput.value = enc;
            encryptedInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (keysInput) {
            keysInput.value = keys;
            keysInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // enable decrypt button if ready
        if (decryptBtnLocal) {
            decryptBtnLocal.disabled = !(encryptedInput && encryptedInput.value.trim().length > 0 && keysInput && keysInput.value.trim().length > 0);
        }

        // button visual feedback
        if (copyBothBtn) {
            const original = copyBothBtn.innerHTML;
            copyBothBtn.innerHTML = '<i class="fa-solid fa-check" style="margin-right:8px"></i>Copied';
            setTimeout(() => { copyBothBtn.innerHTML = original; }, 1300);
        }
    }

    function updateCopyBothState() {
        if (!copyBothBtn) return;
        const enc = (encMsgEl && encMsgEl.textContent) ? encMsgEl.textContent.trim() : '';
        const keys = (keySetEl && keySetEl.textContent) ? keySetEl.textContent.trim() : '';
        const enabled = enc.length > 0 && keys.length > 0;
        copyBothBtn.disabled = !enabled;
        copyBothBtn.setAttribute('aria-disabled', (!enabled).toString());
    }

    function tryParseAndPopulateFromJSON(text) {
        if (!text) return false;
        try {
            const obj = JSON.parse(text);
            if (obj && (obj.enc !== undefined || obj.keys !== undefined)) {
                if (encryptedInput && obj.enc !== undefined) encryptedInput.value = obj.enc;
                if (keysInput && obj.keys !== undefined) keysInput.value = obj.keys;
                if (encryptedInput) encryptedInput.dispatchEvent(new Event('input', { bubbles: true }));
                if (keysInput) keysInput.dispatchEvent(new Event('input', { bubbles: true }));
                if (decryptBtnLocal) {
                    decryptBtnLocal.disabled = !(encryptedInput && encryptedInput.value.trim().length > 0 && keysInput && keysInput.value.trim().length > 0);
                }
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    }

    function startObservers() {
        // Re-query elements in case DOM changed
        encMsgEl = document.getElementById('encMsg');
        keySetEl = document.getElementById('keySet');

        if (!encMsgEl || !keySetEl) return;
        const obs = new MutationObserver(updateCopyBothState);
        obs.observe(encMsgEl, { childList: true, subtree: true, characterData: true });
        obs.observe(keySetEl, { childList: true, subtree: true, characterData: true });
        updateCopyBothState();
    }

    document.addEventListener('DOMContentLoaded', () => {
        startObservers();

        if (copyBothBtn) copyBothBtn.addEventListener('click', copyBothAsJSONAndPaste);

        // paste handling on decrypt inputs
        if (encryptedInput) {
            encryptedInput.addEventListener('paste', (ev) => {
                const pasted = (ev.clipboardData || window.clipboardData).getData('text');
                if (pasted && tryParseAndPopulateFromJSON(pasted.trim())) {
                    ev.preventDefault();
                }
            });
        }
        if (keysInput) {
            keysInput.addEventListener('paste', (ev) => {
                const pasted = (ev.clipboardData || window.clipboardData).getData('text');
                if (pasted && tryParseAndPopulateFromJSON(pasted.trim())) {
                    ev.preventDefault();
                }
            });
        }

        // If encMsg/keySet are already set before DOMContentLoaded finishes, update state
        updateCopyBothState();
    });
})();
