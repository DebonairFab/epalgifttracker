// ==UserScript==
// @name         Epal Gift Counter Pro - Movable (v1.9.4)
// @namespace    http://tampermonkey.net/
// @version      1.9.4
// @description  Tracker with Timer, target filter and moveable window. 
// @downloadURL  https://github.com/DebonairFab/epalgifttracker/raw/refs/heads/main/Epal%20Gift%20Counter%20Pro%20-%20Movable%20(v1.9.3)-1.9.3.user.js
// @updateURL    https://github.com/DebonairFab/epalgifttracker/raw/refs/heads/main/Epal%20Gift%20Counter%20Pro%20-%20Movable%20(v1.9.3)-1.9.3.user.js
// @author       Fab
// @match        https://www.epal.gg/chill/chatroom/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const giftPrices = {
        "Springtime Honey": 10, "Rose": 1, "Thumbs Up": 2, "Forever With You": 600,
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

    // --- UI ---
    const dashboard = document.createElement('div');
    dashboard.id = "gemini-tracker-ui";
    dashboard.style = "position:fixed; top:100px; left:20px; z-index:10000; background:rgba(15,15,15,0.98); color:white; padding:18px; border-radius:12px; font-family:sans-serif; border:1px solid #ff4d89; min-width:260px; box-shadow:0 15px 40px rgba(0,0,0,0.6); user-select:none;";

    dashboard.innerHTML = `
        <div id="drag-handle" style="font-weight:bold; color:#ff4d89; margin-bottom:12px; display:flex; justify-content:space-between; font-size:11px; letter-spacing:1px; cursor:move; padding-bottom:5px; border-bottom:1px solid rgba(255,77,137,0.2);">
            <span>🎁 GIFT TRACKER v1.9.3</span>
            <span id="status-indicator" style="color:#ff4d4d;">OFF</span>
        </div>

        <div style="margin-bottom:10px;">
            <div style="font-size:10px; color:#aaa; margin-bottom:4px; text-transform:uppercase;">Epal (Target) :</div>
            <input type="text" id="input-target" placeholder="Name of the gifted..." style="width:100%; background:#222; border:1px solid #444; color:#00d4ff; border-radius:4px; padding:6px; font-size:12px; outline:none; box-sizing:border-box;">
        </div>

        <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
            <input type="number" id="input-minutes" value="30" min="1" style="width:45px; background:#222; border:1px solid #444; color:white; border-radius:4px; padding:4px; font-size:12px;">
            <span style="font-size:11px; color:#ccc;">min</span>
            <div id="display-timer" style="flex:1; text-align:right; font-family:monospace; font-size:16px; font-weight:bold; color:#4CAF50;">00:00</div>
        </div>

        <div id="top-donors" style="background:rgba(255,255,255,0.03); padding:8px; border-radius:6px; margin-bottom:12px; font-size:12px; min-height:40px; border-left:2px solid #ff4d89;">Waiting...</div>

        <div style="margin-bottom:12px;">
            <div id="epal-count" style="font-size:11px; color:#aaa;">Gifts : 0</div>
            <div id="epal-value" style="font-size:1.8em; font-weight:bold; color:#ffce00;">0.00 💎</div>
        </div>

        <div style="display:flex; gap:8px;">
            <button id="btn-start" style="flex:2; background:#4CAF50; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px;">START</button>
            <button id="btn-reset" style="flex:1; background:#333; color:#ccc; border:none; padding:8px; border-radius:6px; cursor:pointer; font-size:12px;">Reset</button>
        </div>
    `;
    document.body.appendChild(dashboard);


    let isDragging = false, offset = { x: 0, y: 0 };
    const handle = document.getElementById('drag-handle');

    handle.onmousedown = (e) => {
        isDragging = true;
        offset.x = e.clientX - dashboard.offsetLeft;
        offset.y = e.clientY - dashboard.offsetTop;
    };

    document.onmousemove = (e) => {
        if (!isDragging) return;
        dashboard.style.left = (e.clientX - offset.x) + "px";
        dashboard.style.top = (e.clientY - offset.y) + "px";
        dashboard.style.bottom = "auto";
    };

    document.onmouseup = () => isDragging = false;


    const updateUI = () => {
        document.getElementById('epal-count').innerText = `Gifts : ${totalGifts}`;
        document.getElementById('epal-value').innerText = `${totalValue.toFixed(2)} 💎`;
        const sorted = Object.entries(donors).sort(([,a],[,b]) => b-a).slice(0,3);
        let html = "";
        sorted.forEach((d, i) => {
            html += `<div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:140px;">#${i+1} ${d[0]}</span>
                <span style="color:#ffce00; font-weight:bold;">${d[1].toFixed(0)}</span>
            </div>`;
        });
        document.getElementById('top-donors').innerHTML = html || "Waiting...";
    };

    const processNode = (node) => {
        if (!isRunning) return;
        const giftPart = node.querySelector('.epal-live-chat.text-positive-variant-normal');
        if (giftPart && giftPart.innerText.includes("gifted")) {
            const fullText = giftPart.innerText;
            const targetFilter = document.getElementById('input-target').value.trim();

            if (targetFilter !== "" && !fullText.toLowerCase().includes("gifted " + targetFilter.toLowerCase())) return;

            const messageContainer = giftPart.closest('.hover\\:bg-surface-element-normal');
            if (messageContainer) {
                const donorWrapper = giftPart.previousElementSibling;
                let donorName = "Inconnu";
                if (donorWrapper) {
                    const donorElem = donorWrapper.querySelector('.epal-name-gold, .epal-name-vip, .text-primary-variant-normal');
                    if (donorElem) donorName = donorElem.innerText.trim();
                }

                const qtyMatch = fullText.match(/x(\d+)\s*$/);
                if (qtyMatch) {
                    const quantity = parseInt(qtyMatch[1]);
                    let foundGift = "Default";
                    for (let giftKey in giftPrices) {
                        if (fullText.toLowerCase().includes(giftKey.toLowerCase())) {
                            foundGift = giftKey;
                            break;
                        }
                    }
                    const totalChange = giftPrices[foundGift] * quantity;
                    totalGifts += quantity;
                    totalValue += totalChange;
                    donors[donorName] = (donors[donorName] || 0) + totalChange;

                    console.log(
                        `%c 🎁 GIFT %c ${donorName} %c send ${foundGift} x${quantity} to ${targetFilter || 'Anyone'} %c +${totalChange}💎 `,
                        "background:#ff4d89; color:white; font-weight:bold; border-radius:3px 0 0 3px;",
                        "background:#333; color:#ffce00; font-weight:bold;",
                        "background:#222; color:#ccc;",
                        "background:#4CAF50; color:white; font-weight:bold; border-radius:0 3px 3px 0;"
                    );
                    updateUI();
                }
            }
        }
    };

    const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

    const stopTracker = () => {
        isRunning = false; clearInterval(timerInterval);
        document.getElementById('status-indicator').innerText = "OFF";
        document.getElementById('status-indicator').style.color = "#ff4d4d";
        document.getElementById('btn-start').innerText = "START";
        document.getElementById('btn-start').style.background = "#4CAF50";
    };

    const startTracker = () => {
        const mins = parseInt(document.getElementById('input-minutes').value) || 1;
        if (!timeLeft || timeLeft <= 0) timeLeft = mins * 60;
        isRunning = true;
        document.getElementById('status-indicator').innerText = "LIVE";
        document.getElementById('status-indicator').style.color = "#4CAF50";
        document.getElementById('btn-start').innerText = "STOP";
        document.getElementById('btn-start').style.background = "#ff4d4d";
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            document.getElementById('display-timer').innerText = formatTime(timeLeft);
            if (timeLeft <= 0) stopTracker();
        }, 1000);
    };

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) processNode(n); }));
    });
    observer.observe(document.body, { childList: true, subtree: true });

    document.getElementById('btn-start').onclick = () => isRunning ? stopTracker() : startTracker();
    document.getElementById('btn-reset').onclick = () => {
        if(confirm("Reset Session?")) {
            totalGifts = 0; totalValue = 0; donors = {}; timeLeft = 0;
            document.getElementById('display-timer').innerText = "00:00";
            if (isRunning) stopTracker();
            updateUI();
        }
    };

})();
