# 🎁 Epal Gift Counter — Complete Guide & Documentation

[![Version](https://img.shields.io/badge/version-2.3.1-ff4d89.svg)](https://github.com/DebonairFab/epalgifttracker)
[![Platform](https://img.shields.io/badge/platform-Epal.gg-00d4ff.svg)](https://www.epal.gg/)
[![License](https://img.shields.io/badge/license-Community-lightgrey.svg)](#)

A lightweight **Tampermonkey** script designed to track, count, and filter gifts in real-time within **Epal.gg** chatrooms. This tool helps streamers and users manage their goals with a built-in timer and an automated leaderboard.

> [!IMPORTANT]
> **Disclaimer:** This is an independent community tool and is not officially affiliated with Epal.gg.

<p align="center">
  <img width="253" height="344" alt="Epal Gift Counter Interface" src="https://github.com/user-attachments/assets/8186d79e-067a-4b5d-9b63-6467a28ab9a6">
</p>

---

## ✨ Features

*   **📈 Buffs Counter:** Automatically calculates the total value of gifts in buffs/dollars.
*   **🎯 Target Filtering:** Enter a username to only track gifts received by a specific person. If empty, it tracks **Everyone**.
*   **⏱️ Built-in Timer:** Set a duration (in minutes) and the tracker stops when the countdown reaches zero.
*   **🏆 Top Donors:** Real-time leaderboard showing the top 3 supporters of the session.
*   **🚀 Auto-Send:** One click to generate the leaderboard and send it **directly** into the Epal chat.
*   **🖱️ Movable Interface:** Click and drag the header to position the window anywhere on your screen.

---

## 🛠️ 1. Installation Process

To use this script, you need a browser extension that can run "UserScripts" (such as **Tampermonkey**).

1.  **Install Tampermonkey:**
    Go to [tampermonkey.net](https://www.tampermonkey.net/) and install the version for your browser (Chrome, Firefox, Edge).
2.  **Import the Script:**
    👉 **[CLICK HERE TO INSTALL THE SCRIPT](https://github.com/DebonairFab/epalgifttracker/raw/refs/heads/main/Epal%20Gift%20Counter.user.js)**
    <details><summary><b>*Note:*</b></summary> If the link opens as text, copy the code, click the Tampermonkey icon > "Create a new script", paste it, and save (Ctrl+S).*</details>
3.  **Activate:**
    Navigate to any [Epal Chatroom](https://www.epal.gg/arcade/). The tracker will appear on the left side of your screen.

---

## 🚀 2. How to Use

### Interface Overview
*   **Target (Optional):** Type the name of the person receiving the gifts (e.g., `cakekkie`). If left empty, it displays `(Everyone)` in the leaderboard.
*   **Timer:** Set your desired session time in minutes (e.g., 3, 5, or 10 min).
*   **Start/Stop:** The status indicator turns green (**LIVE**) when tracking is active.
*   **Send Button:** Generates the leaderboard, copies it to your clipboard, and **automatically sends it** into the Epal chatroom.
*   **Reset:** Clears all scores, donors, the timer, and the target field for a fresh start.

---

## 📸 3. Visual Guide

### Setting a Target
To track a specific person, type their name exactly as it appears on Epal.

<p align="center">
  <img width="257" height="351" alt="Setting Target Example" src="https://github.com/user-attachments/assets/17905c09-b2ab-4870-aed0-5c5a525c8ae4">
</p>

### Sharing the Results
When you click **SEND**, the script generates a message and sends it to the chat instantly:

<p align="center">
  <img src="https://s4.ezgif.com/tmp/ezgif-4d3ac94c0f28d8ab.gif" alt="Démonstration animée">
</p>

```text
GIFT LEADERBOARD (Everyone) 🏆
1. PlayerA : 10.50 $
2. PlayerB : 5.20 $
3. PlayerC : 0.00 $
```

---
💎 Supported Gift Prices

You'll find here all the gift currently supported (if a gift is not on this list it'll go under default with a value of 0) :

        "Springtime Honey": 10, 
        "Rose": 1, 
        "Thumbs Up": 2, 
        "Forever With You": 600,
        "Sweet Treat": 3, 
        "Magic Donut": 5, 
        "Party With me": 7, 
        "Heavenly Match": 2000,
        "Dancing Ryan": 10, "Soft Touch": 20, 
        "My Little Angel": 50, 
        "Cruise With Me": 100,
        "Only Mine": 300, 
        "Golden Ascension": 1000, 
        "Ace Reign": 1600, 
        "Lolipop": 0.20,
        "Luv ya": 0.50, 
        "Sweet Claw": 1, 
        "Energy Drink": 2, 
        "Disco Dancing": 2,
        "Marry me": 5, 
        "Eternal Love": 10, 
        "Streamer gear": 10, 
        "Cyberpunk": 20,
        "Space shuttle": 20, 
        "Pink Dream": 50, 
        "Halloween Vibe": 50, 
        "Lucky Draw": 50,
        "Fairy Land": 50, 
        "Be With You": 50, 
        "Romantic Trip": 50, 
        "Vanilla Sky": 50,
        "Kitten uwu": 100, 
        "Bunny uwu": 100, 
        "Sweet Carnival": 200, 
        "Hypercar": 200,
        "Loving castle": 500, 
        "Curious Locket": 5, 
        "EE":0, 
        "Turkish Coffee":0, 
        "Default": 0


---
💬 4. Feedback & Support

Your feedback is essential for improving this tool!

  Suggestions: Please visit the Issues section of the repository.

  Bugs: If a gift price is incorrect or a name is not detected, feel free to report it there.

<p align="center">Created with ❤️ by <b>Fab</b></p>
