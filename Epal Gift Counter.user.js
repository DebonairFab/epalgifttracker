// ==UserScript==
// @name         Epal Gift Tracker - Detailed Logs Edition
// @namespace    http://tampermonkey.net/
// @version      3.1.0
// @description  Cloud Sync + Detailed Console Logs + Medals
// @author       Fab
// @match        https://www.epal.gg/chill/chatroom/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    const JSON_URL = "https://raw.githubusercontent.com/DebonairFab/epalgifttracker/refs/heads/main/prices.json";
    const customIcon = "https://raw.githubusercontent.com/DebonairFab/epalgifttracker/refs/heads/main/Sans%20titre.png";

    const style = document.createElement('style');
    style.innerHTML = `
        #epal-tracker-pro button { transition: all 0.2s ease; cursor: pointer; border: none; outline: none; }
        #epal-tracker-pro button:hover { filter: brightness(1.2); transform: translateY(-1px); }
        #epal-tracker-pro button:active { transform: translateY(1px) scale(0.96); }
        #btn-sync:hover { transform: rotate(90deg); }
        .gift-row { animation: fadeIn 0.3s ease-out; display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }
    `;
    document.head.appendChild(style);

    let giftPrices = { "Rose": 1, "Default": 0 };
    let totalValue = 0, isRunning = false, donors = {};
    let timerInterval = null, timeLeft = 0;

    async function syncPrices() {
        try {
            const response = await fetch(JSON_URL);
            if (!response.ok) throw new Error("Sync failed");
            giftPrices = await response.json();
            console.log("%c✅ Prices Synced", "color: #00d4ff; font-weight: bold;");
            const indicator = document.getElementById('status-indicator');
            if(indicator) {
                indicator.innerText = "SYNCED"; indicator.style.color = "#00d4ff";
                setTimeout(() => { 
                    indicator.innerText = isRunning ? "LIVE" : "OFF";
                    indicator.style.color = isRunning ? "#4CAF50" : "#ff4d4d";
                }, 2000);
            }
        } catch (e) { console.error("❌ Sync Error:", e); }
    }

    const dashboard = document.createElement('div');
    dashboard.id = "epal-tracker-pro";
    dashboard.style = `position: fixed; top: 100px; left: 20px; z-index: 99999; background: rgba(15, 15, 15, 0.98); color: white; padding: 18px; border-radius: 12px; font-family: 'Segoe UI', sans-serif; border: 1px solid #ff4d89; min-width: 260px; box-shadow: 0 15px 40px rgba(0,0,0,0.6);`;

    dashboard.innerHTML = `
        <div id="drag-handle" style="font-weight:bold; color:#ff4d89; margin-bottom:12px; display:flex; justify-content:space-between; font-size:11px; cursor:move; padding-bottom:5px; border-bottom:1px solid rgba(255,77,137,0.2);">
            <span>🎁 GIFT TRACKER</span>
            <span id="status-indicator" style="color:#ff4d4d; font-weight:bold;">OFF</span>
        </div>
        <div style="display:flex; gap:4px; margin-bottom:10px;">
            <input type="text" id="input-target" placeholder="Target User..." style="flex:3; background:#222; border:1px solid #444; color:#00d4ff; border-radius:4px; padding:6px; font-size:12px; outline:none;">
            <button id="btn-sync" title="Sync Prices" style="flex:1; background:#333; border:1px solid #444; color:white; border-radius:4px; font-size:10px;">🔄</button>
        </div>
        <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <input type="number" id="input-minutes" value="3" min="1" style="width:45px; background:#222; border:1px solid #444; color:white; border-radius:4px; padding:4px; font-size:12px;">
            <span style="font-size:11px; color:#ccc;">min</span>
            <div id="display-timer" style="flex:1; text-align:right; font-family:monospace; font-size:20px; font-weight:bold; color:#4CAF50;">00:00</div>
        </div>
        <div id="top-donors" style="background:rgba(255,255,255,0.03); padding:8px; border-radius:6px; margin-bottom:12px; font-size:12px; min-height:60px; border-left:2px solid #ff4d89;">Waiting...</div>
        <div style="margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
                <span id="epal-value-num" style="font-size:1.8em; font-weight:bold; color:#ffce00;">0.00</span>
                <img src="${customIcon}" style="width:24px; height:24px; object-fit:contain;">
            </div>
        </div>
        <div style="display:flex; gap:6px;">
            <button id="btn-start" style="flex:2; background:#4CAF50; color:white; padding:8px; border-radius:6px; font-weight:bold; font-size:11px;">START</button>
            <button id="btn-copy" style="flex:1.5; background:#ffce00; color:black; padding:8px; border-radius:6px; font-weight:bold; font-size:11px;">SEND</button>
            <button id="btn-reset" style="flex:1; background:#333; color:#ff4d4d; padding:8px; border-radius:6px; font-size:11px; font-weight:bold;">RESET</button>
        </div>
    `;
    document.body.appendChild(dashboard);

    const updateUI = () => {
        document.getElementById('epal-value-num').innerText = totalValue.toFixed(2);
        const sorted = Object.entries(donors).sort(([,a],[,b]) => b-a).slice(0,3);
        const medals = ["🥇", "🥈", "🥉"];
        let html = "";
        sorted.forEach((d, i) => {
            html += `<div class="gift-row"><span>${medals[i]} ${d[0]}</span><span style="color:#ffce00; font-weight:bold;">${d[1].toFixed(2)} $</span></div>`;
        });
        document.getElementById('top-donors').innerHTML = html || "Waiting for gifts...";
    };

    const processNode = (node) => {
        if (!isRunning || node.nodeType !== 1) return;
        const giftPart = node.querySelector('.epal-live-chat.text-positive-variant-normal');
        if (giftPart && giftPart.innerText.includes("gifted")) {
            const fullText = giftPart.innerText;
            const targetFilter = document.getElementById('input-target').value.trim();
            if (targetFilter !== "" && !fullText.toLowerCase().includes("gifted " + targetFilter.toLowerCase())) return;

            const messageContainer = giftPart.closest('.hover\\:bg-surface-element-normal');
            let donorName = "User";
            if (messageContainer) {
                const donorElem = messageContainer.querySelector('.epal-name-gold, .epal-name-vip, .text-primary-variant-normal');
                if (donorElem) donorName = donorElem.innerText.trim();
            }

            const qtyMatch = fullText.match(/x(\d+)\s*$/);
            if (qtyMatch) {
                const quantity = parseInt(qtyMatch[1]);
                let foundGift = null;
                for (let key in giftPrices) { if (fullText.toLowerCase().includes(key.toLowerCase())) { foundGift = key; break; } }
                const price = foundGift ? giftPrices[foundGift] : 0;
                const totalAmount = price * quantity;

                // --- DETAILED LOGS ---
                if (foundGift) {
                    console.log(
                        `%c🎁 [GIFT] ${foundGift} x${quantity} | %cTo: ${targetFilter || "Everyone"} %c| From: ${donorName} | %cValue: $${totalAmount.toFixed(2)}`, 
                        "color:#4CAF50; font-weight:bold;", 
                        "color:#00d4ff;", 
                        "color:#ffffff;", 
                        "color:#ffce00; font-weight:bold;"
                    );
                } else {
                    console.warn(`%c❓ UNKNOWN GIFT: ${fullText}`, "color:#ff9800;");
                }

                totalValue += totalAmount; 
                donors[donorName] = (donors[donorName] || 0) + totalAmount;
                updateUI();
            }
        }
    };

    document.getElementById('btn-sync').onclick = syncPrices;
    document.getElementById('btn-reset').onclick = () => {
        if (confirm("⚠️ Reset everything?")) {
            totalValue = 0; donors = {}; updateUI();
        }
    };

    document.getElementById('btn-copy').onclick = function() {
        const target = document.getElementById('input-target').value.trim() || "Everyone";
        const sorted = Object.entries(donors).sort(([,a],[,b]) => b-a).slice(0,3);
        const medals = ["🥇","🥈","🥉"];
        let msg = `🏆 TOP DONORS (${target})\n`;
        sorted.forEach((d, i) => msg += `${medals[i]} ${d[0]}: ${d[1].toFixed(1)}$\n`);
        const chat = document.querySelector('.ql-editor');
        if (chat) {
            chat.innerHTML = msg.split('\n').map(l => `<p>${l}</p>`).join('');
            chat.focus();
            setTimeout(() => {
                chat.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', keyCode: 13 }));
                const btn = document.getElementById('btn-copy');
                btn.innerText = "SENT !"; btn.style.background = "#4CAF50"; btn.style.color = "white";
                setTimeout(() => { btn.innerText = "SEND"; btn.style.background = "#ffce00"; btn.style.color = "black"; }, 1500);
            }, 300);
        }
    };

    document.getElementById('btn-start').onclick = function() {
        if (!isRunning) {
            const mins = parseFloat(document.getElementById('input-minutes').value) || 1;
            timeLeft = Math.floor(mins * 60); isRunning = true;
            this.innerText = "STOP"; this.style.background = "#f44336";
            document.getElementById('status-indicator').innerText = "LIVE"; document.getElementById('status-indicator').style.color = "#4CAF50";
            timerInterval = setInterval(() => { 
                if (timeLeft > 0) {
                    timeLeft--;
                    document.getElementById('display-timer').innerText = `${Math.floor(timeLeft/60).toString().padStart(2,'0')}:${(timeLeft%60).toString().padStart(2,'0')}`;
                } else {
                    isRunning = false; clearInterval(timerInterval);
                    this.innerText = "START"; this.style.background = "#4CAF50";
                    document.getElementById('status-indicator').innerText = "OFF"; document.getElementById('status-indicator').style.color = "#ff4d4d";
                }
            }, 1000);
        } else {
            isRunning = false; clearInterval(timerInterval);
            this.innerText = "START"; this.style.background = "#4CAF50";
            document.getElementById('status-indicator').innerText = "OFF"; document.getElementById('status-indicator').style.color = "#ff4d4d";
        }
    };

    syncPrices();
    const observer = new MutationObserver(m => m.forEach(mu => mu.addedNodes.forEach(processNode)));
    observer.observe(document.body, { childList: true, subtree: true });

    let isDragging = false, ox, oy;
    document.getElementById('drag-handle').onmousedown = e => { isDragging = true; ox = e.clientX - dashboard.offsetLeft; oy = e.clientY - dashboard.offsetTop; };
    window.onmousemove = e => { if (isDragging) { dashboard.style.left = (e.clientX - ox) + "px"; dashboard.style.top = (e.clientY - oy) + "px"; } };
    window.onmouseup = () => isDragging = false;
})();
