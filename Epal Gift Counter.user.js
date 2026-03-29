// ==UserScript==
// @name         Epal Gift Tracker
// @namespace    http://tampermonkey.net/
// @version      2.6.0
// @description  Lightweight & Compact leaderboard for small chat limits
// @author       Fab
// @match        https://www.epal.gg/chill/chatroom/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const customIcon = "https://raw.githubusercontent.com/DebonairFab/epalgifttracker/refs/heads/main/Sans%20titre.png";

    const giftPrices = {
        "Springtime Honey": 0, "Rose": 1, "Thumbs Up": 2, "Forever With You": 600,
        "Sweet Treat": 3, "Magic Donut": 5, "Party With me": 7, "Heavenly Match": 2000,
        "Dancing Ryan": 10, "Soft Touch": 20, "My Little Angel": 50, "Cruise With Me": 100,
        "Only Mine": 300, "Golden Ascension": 1000, "Ace Reign": 1600, "Lolipop": 0.20,
        "Luv ya": 0.50, "Sweet Claw": 1, "Energy Drink": 2, "Disco Dancing": 2,
        "Marry me": 5, "Eternal Love": 10, "Streamer gear": 10, "Cyberpunk": 20,
        "Space shuttle": 20, "Pink Dream": 50, "Halloween Vibe": 50, "Lucky Draw": 50,
        "Fairy Land": 50, "Be With You": 50, "Romantic Trip": 50, "Vanilla Sky": 50,
        "Kitten uwu": 100, "Bunny uwu": 100, "Sweet Carnival": 200, "Hypercar": 200,
        "Loving castle": 500, "Curious Locket": 5, "EE":0, "Turkish Coffee":0, "Default": 0
    };

    let totalGifts = 0, totalValue = 0, isRunning = false, donors = {};
    let timerInterval = null, timeLeft = 0;

    // --- INTERFACE (CSS INJECTED) ---
    const dashboard = document.createElement('div');
    dashboard.id = "epal-tracker-pro";
    dashboard.style = `position: fixed; top: 100px; left: 20px; z-index: 99999; background: rgba(15, 15, 15, 0.98); color: white; padding: 18px; border-radius: 12px; font-family: 'Segoe UI', sans-serif; border: 1px solid #ff4d89; min-width: 260px; box-shadow: 0 15px 40px rgba(0,0,0,0.6);`;

    dashboard.innerHTML = `
        <div id="drag-handle" style="font-weight:bold; color:#ff4d89; margin-bottom:12px; display:flex; justify-content:space-between; font-size:11px; cursor:move; padding-bottom:5px; border-bottom:1px solid rgba(255,77,137,0.2);">
            <span>🎁 GIFT TRACKER</span>
            <span id="status-indicator" style="color:#ff4d4d;">OFF</span>
        </div>
        <div style="margin-bottom:10px;">
            <input type="text" id="input-target" placeholder="Target name..." style="width:100%; background:#222; border:1px solid #444; color:#00d4ff; border-radius:4px; padding:6px; font-size:12px; outline:none; box-sizing:border-box;">
        </div>
        <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <input type="number" id="input-minutes" value="3" min="1" style="width:45px; background:#222; border:1px solid #444; color:white; border-radius:4px; padding:4px; font-size:12px;">
            <span style="font-size:11px; color:#ccc;">min</span>
            <div id="display-timer" style="flex:1; text-align:right; font-family:monospace; font-size:20px; font-weight:bold; color:#4CAF50;">00:00</div>
        </div>
        <div id="top-donors" style="background:rgba(255,255,255,0.03); padding:8px; border-radius:6px; margin-bottom:12px; font-size:12px; min-height:40px; border-left:2px solid #ff4d89;">Waiting...</div>
        <div style="margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                <span id="epal-value-num" style="font-size:1.8em; font-weight:bold; color:#ffce00;">0.00</span>
                <img src="${customIcon}" style="width:24px; height:24px; object-fit:contain;" onerror="this.style.display='none'">
            </div>
        </div>
        <div style="display:flex; gap:6px;">
            <button id="btn-start" style="flex:2; background:#4CAF50; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:11px;">START</button>
            <button id="btn-copy" style="flex:1.2; background:#ffce00; color:black; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:11px;">SEND</button>
            <button id="btn-reset" style="flex:1; background:#333; color:#ccc; border:none; padding:8px; border-radius:6px; cursor:pointer; font-size:11px;">Reset</button>
        </div>
    `;
    document.body.appendChild(dashboard);

    // --- DRAG ---
    let isDragging = false, offsetX, offsetY;
    document.getElementById('drag-handle').onmousedown = (e) => { isDragging = true; offsetX = e.clientX - dashboard.offsetLeft; offsetY = e.clientY - dashboard.offsetTop; };
    window.onmousemove = (e) => { if (isDragging) { dashboard.style.left = (e.clientX - offsetX) + "px"; dashboard.style.top = (e.clientY - offsetY) + "px"; } };
    window.onmouseup = () => { isDragging = false; };

    // --- LOGIC ---
    const updateUI = () => {
        document.getElementById('epal-value-num').innerText = totalValue.toFixed(2);
        const sorted = Object.entries(donors).sort(([,a],[,b]) => b-a).slice(0,3);
        let html = "";
        sorted.forEach((d, i) => {
            html += `<div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:140px; color:#eee;">#${i+1} ${d[0]}</span>
                <span style="color:#ffce00; font-weight:bold;">${d[1].toFixed(2)} $</span>
            </div>`;
        });
        document.getElementById('top-donors').innerHTML = html || "Waiting...";
    };

    const processNode = (node) => {
        if (!isRunning || node.nodeType !== 1) return;
        const giftPart = node.querySelector('.epal-live-chat.text-positive-variant-normal');
        if (giftPart && giftPart.innerText.includes("gifted")) {
            const fullText = giftPart.innerText;
            const targetFilter = document.getElementById('input-target').value.trim().toLowerCase();
            if (targetFilter !== "" && !fullText.toLowerCase().includes("gifted " + targetFilter)) return;
            const messageContainer = giftPart.closest('.hover\\:bg-surface-element-normal');
            let donorName = "User";
            if (messageContainer) {
                const donorElem = messageContainer.querySelector('.epal-name-gold, .epal-name-vip, .text-primary-variant-normal');
                if (donorElem) donorName = donorElem.innerText.trim();
            }
            const qtyMatch = fullText.match(/x(\d+)\s*$/);
            if (qtyMatch) {
                const quantity = parseInt(qtyMatch[1]);
                let foundGift = "Default";
                for (let giftKey in giftPrices) { if (fullText.toLowerCase().includes(giftKey.toLowerCase())) { foundGift = giftKey; break; } }
                const amount = giftPrices[foundGift] * quantity;
                totalGifts += quantity; totalValue += amount; donors[donorName] = (donors[donorName] || 0) + amount;
                updateUI();
            }
        }
    };

    const copyAndSend = () => {
        const target = document.getElementById('input-target').value.trim() || "Everyone";
        const sorted = Object.entries(donors).sort(([,a],[,b]) => b-a).slice(0,3);

        // Version Ultra-compacte (Espace optimisé)
        let text = `🏆 TOP DONORS (${target})\n`;
        const icons = ["🥇","🥈","🥉"];
        sorted.forEach((d, i) => {
            text += `${icons[i]} ${d[0]}: ${d[1].toFixed(1)}$\n`; // .toFixed(1) pour gagner un caractère
        });
        if (sorted.length === 0) text += "Waiting for gifts...";

        const chatEditor = document.querySelector('.ql-editor');
        if (chatEditor) {
            chatEditor.innerHTML = text.split('\n').map(line => `<p>${line}</p>`).join('');
            chatEditor.classList.remove('ql-blank');
            chatEditor.focus();

            setTimeout(() => {
                const enter = new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', keyCode: 13 });
                chatEditor.dispatchEvent(enter);
            }, 300); // Envoi rapide
        }

        const btn = document.getElementById('btn-copy');
        btn.innerText = "SENT! 🚀";
        setTimeout(() => btn.innerText = "SEND", 1000);
    };

    const observer = new MutationObserver(mutations => { for (const mutation of mutations) mutation.addedNodes.forEach(processNode); });
    observer.observe(document.body, { childList: true, subtree: true });

    document.getElementById('btn-start').onclick = () => {
        if (!isRunning) {
            const mins = parseFloat(document.getElementById('input-minutes').value) || 1;
            timeLeft = Math.floor(mins * 60);
            isRunning = true;
            document.getElementById('status-indicator').innerText = "LIVE"; document.getElementById('status-indicator').style.color = "#4CAF50";
            document.getElementById('btn-start').innerText = "STOP";
            timerInterval = setInterval(() => {
                if (timeLeft > 0) { timeLeft--; document.getElementById('display-timer').innerText = `${Math.floor(timeLeft/60).toString().padStart(2,'0')}:${(timeLeft%60).toString().padStart(2,'0')}`; }
                else { isRunning = false; clearInterval(timerInterval); document.getElementById('status-indicator').innerText = "OFF"; }
            }, 1000);
        } else {
            isRunning = false; clearInterval(timerInterval);
            document.getElementById('status-indicator').innerText = "OFF";
            document.getElementById('btn-start').innerText = "START";
        }
    };
    document.getElementById('btn-copy').onclick = copyAndSend;
    document.getElementById('btn-reset').onclick = () => { totalGifts = 0; totalValue = 0; donors = {}; updateUI(); };
})();
