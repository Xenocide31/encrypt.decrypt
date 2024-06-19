const container = document.getElementById('container');
const decryptBtn = document.getElementById('decryptBtn');
const encryptBtn = document.getElementById('encryptBtn');

decryptBtn.addEventListener('click', () => {
    container.classList.add("active");
});

encryptBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

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

    // Determine method value
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
    console.log("Sanitized Keys Input: ", sanitizedKeysInput);

    let splitKeys = sanitizedKeysInput.split(' ').filter(key => key !== '');
    console.log("Split Keys: ", splitKeys);

    let keys = splitKeys.map(Number);
    console.log("Keys after splitting and mapping to numbers: ", keys);

    let j = encryptedWord.length;
    let C = encryptedWord.split('').map(charToNumber);

    let l = C.pop();
    j--;
    let r = C.pop();
    j--;

    console.log("Value of j:", j);

    let [shift, method, ...remainingkeys] = keys;
    keys = remainingkeys;
    console.log("Shift", shift, "Method: ", method);
    console.log(keys);

    let numKeys = keys.length;
    console.log("Length of keys:", numKeys);
    let loop = Math.floor(numKeys / j);

    console.log("Number of loops ", loop);

    for (let l_cnt = 0; l_cnt < loop; l_cnt++) {
        let M = new Array(j);
        console.log(M);

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
    console.log(resultWord);

    let decryptedWord = decryptCaesarCipher(resultWord, shift);

    decryptMessageForm.style.display = 'none';

    loadingDecrypt.style.display = 'flex';
    setTimeout(() => {
        loadingDecrypt.style.display = 'none';
        decryptedMessage.style.display = 'flex';
        document.getElementById('decMsg').innerText = 'Original message: ' + decryptedWord;
    }, 2000);
}

function copyToClipboard(elementId) {
    let text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).catch(err => {
        alert('Failed to copy text: ' + err);
    });
}

function updatePlaceholders() {
    const encryptedInput = document.getElementById('encryptedInput');
    const keysInput = document.getElementById('keysInput');
    const messageInput = document.getElementById('message');
    const shiftInput = document.getElementById('shift');
    const rInput = document.getElementById('r');
    const lInput = document.getElementById('l');
    const loopsInput = document.getElementById('loops');

    if (window.innerWidth <= 760) {
        encryptedInput.placeholder = "Encrypted message";
        keysInput.placeholder = "Enter keys";
        messageInput.placeholder = "Enter message";
        shiftInput.placeholder = "Enter shifts";
        rInput.placeholder = "Enter value of r";
        lInput.placeholder = "Enter value of l";
        loopsInput.placeholder = "Enter number of loops";
    } else {
        encryptedInput.placeholder = "Enter the encrypted message";
        keysInput.placeholder = "Enter the keys";
        messageInput.placeholder = "Enter message";
        shiftInput.placeholder = "Enter number of shifts";
        rInput.placeholder = "Enter value of r";
        lInput.placeholder = "Enter value of l";
        loopsInput.placeholder = "Enter the number of loops";
    }
}

window.addEventListener('load', updatePlaceholders);
window.addEventListener('resize', updatePlaceholders);