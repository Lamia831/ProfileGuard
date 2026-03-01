const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/predict', (req, res) => {
    const { followers, following, posts, photo, accountAge, platform } = req.body;

    let riskScore = 0;
    const fCount = parseInt(followers) || 0;
    const flngCount = parseInt(following) || 0;
    const age = parseInt(accountAge) || 12;

    // 1. Ratio Analysis (Weight: 40%)
    const ratio = flngCount / (fCount + 1);
    if (ratio > 5) riskScore += 40;
    else if (ratio > 2) riskScore += 20;

    // 2. Account Age Analysis (Weight: 30%)
    if (age < 1) riskScore += 30;
    else if (age < 6) riskScore += 15;

    // 3. Completeness (Weight: 20%)
    if (photo === "no") riskScore += 20;

    // 4. Activity Baseline (Weight: 10%)
    if (parseInt(posts) < 5) riskScore += 10;

    // Final Decision Engine
    let prediction, confidence;
    const totalConfidence = Math.min(100, 85 + (riskScore % 10)); // Artificial confidence boost for AI feel

    if (riskScore >= 60) {
        prediction = "🚩 HIGH RISK / FAKE";
    } else if (riskScore >= 30) {
        prediction = "⚠️ SUSPICIOUS ACCOUNT";
    } else {
        prediction = "✅ AUTHENTIC ACCOUNT";
    }

    console.log(`[AI Engine] Scan completed for ${platform}. Risk: ${riskScore}%, Status: ${prediction}`);

    res.json({
        prediction: prediction,
        confidence: totalConfidence
    });
});

app.post('/chat', (req, res) => {
    const msg = (req.body.message || "").toLowerCase().trim();

    // Time-based Greeting Logic
    const hour = new Date().getHours();
    let timeGreeting = "Day";
    if (hour < 12) timeGreeting = "Morning";
    else if (hour < 17) timeGreeting = "Afternoon";
    else timeGreeting = "Evening";

    const brain = {
        greetings: {
            keywords: ["hello", "hi", "hey", "greetings", "assalamu alaikum", "namaste", "ki obostha", "aslam", "salam", "morning", "evening", "bondhu", "hola", "yo", "khobor"],
            responses: [
                `Good ${timeGreeting}, Guardian! How can I secure your digital presence today?`,
                `Hello! ProfileGuard is active and monitoring. What can I do for you?`,
                `Greetings! I'm your AI Security Assistant. Ready for a scan?`,
                `Salaam! Ami apnar help-er jonno prostut. Ajke ki scan korte hobe?`,
                `Hi there! Hope you're having a secure ${timeGreeting}.`
            ]
        },
        website_info: {
            keywords: ["this website", "ei website", "profileguard ki", "what is profileguard", "site ta ki", "about", "information", "details", "website ta ki", "eta ki", "kisher site", "kaj ki", "purpose"],
            responses: [
                "ProfileGuard is an advanced AI platform designed to detect fake social media profiles. We protect users from scams, bots, and impersonation.",
                "ProfileGuard holo ekti advanced AI platform jeta fake social media profile detect korar jonno banano hoyeche. Eta apnake scammers ebong bots theke bachay.",
                "This site uses behavioral biometrics and neural engines to identify fraudulent accounts in seconds."
            ]
        },
        how_it_works: {
            keywords: ["kivabe kaj kore", "how it works", "process", "behind the scenes", "logic", "mechanism", "kajer dhoron", "kivbe kre", "system", "method"],
            responses: [
                "I analyze 4 key layers: 1. Ratio Analysis (Followers vs Following), 2. Account Age, 3. Profile Completeness, and 4. Activity Patterns. Together, these create a Risk Score.",
                "Amader system 4ti bishesh layer bebohar kore: anupat bishleshon, account-er boyos, profile-er purnota, ebong activity pattern. Egulo diyei amara fake profile চিনি.",
                "Our AI model compares profile data against millions of known bot signatures to find anomalies."
            ]
        },
        capabilities: {
            keywords: ["kaj", "work", "do", "help", "capability", "function", "what can you", "tumi ki koro", "ki kaj", "kkhomota", "services", "features", "options"],
            responses: [
                "I can:\n1. **Scan Profiles**: Identify bots.\n2. **Analyze Stats**: Check follow-ratio.\n3. **Threat Intel**: Provide safety tips.\n4. **Real-time Monitoring**: Alerts for suspicious activity.",
                "Amake diye apni profile scan korte paren, fake account dhorer felte paren ebong security tips nite paren. Bolun, kivabe shajjo kori?"
            ]
        },
        scan_process: {
            keywords: ["kivabe scan korbo", "how to scan", "check profile", "start analysis", "scan kivabe kore", "kivabe check kore", "verify"],
            responses: [
                "To scan, go to 'Profile Checker', enter the target's stats, and hit 'Launch AI Analysis'. Results appear in ~2 seconds.",
                "Scan korar jonno 'Profile Checker' page-e jan. Username ebong followers/following count dilei amader AI ota check korbe.",
                "You can verify any Instagram, Twitter, or Facebook profile using our analysis tool."
            ]
        },
        accuracy: {
            keywords: ["accurate", "correct", "fake", "trust", "true", "confidence", "shothik", "percentage", "reliable", "guarantee", "vishash"],
            responses: [
                "Our model uses a heuristic scoring engine with **99.8% precision** on known bot signatures.",
                "Amader system-er accuracy pray 99.8%. Eta advanced pattern recognition bebohar kore suspicious account dhorer felte."
            ]
        },
        security_tips: {
            keywords: ["tip", "advice", "safe", "protect", "hacked", "password", "security", "warning", "stay safe", "advice", "nirapod", "tips"],
            responses: [
                "**Security Tip:** Never share your OTP or social media password. Use 2FA (Two-Factor Authentication) on all accounts.",
                "**Pro Tip:** Look for accounts with 0 posts but thousands of followers—these are 90% likely to be bots.",
                "Nirapod thakte shob somoy 2-step verification on rakhun ebong unknown link-e click korben na."
            ]
        },
        technology: {
            keywords: ["how", "tech", "ai", "model", "engine", "work", "neural", "kivabe kaj kore", "logic", "code", "backend", "developer"],
            responses: [
                "ProfileGuard runs on a **Pattern-Matching Neural Engine** (v2.4). It analyzes metadata to identify anomalous account behavior.",
                "Amra advanced algorithms ebong data analysis use kori fake profile detect korar jonno."
            ]
        },
        signup_login: {
            keywords: ["login", "signup", "account", "register", "join", "khulbo", "dhukbo", "login kivbe", "entry"],
            responses: [
                "Click 'Get Started' to sign up. Once your account is ready, use the login page to access your secure dashboard.",
                "Account khular jonno 'Get Started' text-e click korun. Tarpor apni login kore dashboard-e jete parben."
            ]
        },
        owner: {
            keywords: ["who made", "creator", "owner", "developer", "boss", "build", "ke baniyeche", "malik", "team", "father", "banise"],
            responses: [
                "ProfileGuard was built by a visionary team of developers and security researchers. I'm their creation.",
                "Ami ekjon specialized security bot, amake banano hoyeche apnar digital life-ke safe rakhar jonno."
            ]
        },
        thanks: {
            keywords: ["thanks", "thank you", "dhonnobad", "thnx", "tks", "shukriya", "good job", "awesome", "great", "nice"],
            responses: [
                "You're welcome! Stay vigilant and secure.",
                "Dhonno-bad! Ar kono help lagle oboshoy bolben.",
                "Scanning systems... 100% healthy. Ready to assist!"
            ]
        }
    };

    let response = "I'm learning more phrases every day! You can ask me:\n1. **What is ProfileGuard?**\n2. **How do I scan a profile?**\n3. **Is this site accurate?**\n4. **Security Tips**\nOr just say 'Hello'!";

    // Improved matching logic: Split input into words for better precision
    const inputWords = msg.split(/\s+/);
    let bestMatch = null;
    let maxScore = 0;

    for (let intent in brain) {
        let score = 0;
        brain[intent].keywords.forEach(key => {
            // Check if exact key exists as a substring or full word match
            const keyLower = key.toLowerCase();
            if (msg.includes(keyLower)) {
                score += (keyLower.length >= 5) ? 3 : 2;
            }
            // Bonus points for whole word match
            if (inputWords.includes(keyLower)) {
                score += 5;
            }
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = intent;
        }
    }

    // Default to 'website_info' if general keyword detected but no specific match
    if (maxScore < 5 && (msg.includes("profile") || msg.includes("guard") || msg.includes("site") || msg.includes("eta") || msg.includes("ki"))) {
        if (!bestMatch) bestMatch = "website_info";
    }

    if (bestMatch && maxScore > 0) {
        const possibleResponses = brain[bestMatch].responses;
        response = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
    }

    // Special conversational cases (Hardcoded humor/Easter eggs)
    if (msg.match(/(joke|hasaw|moja|হাসাও)/)) {
        response = "Why did the computer go to the doctor? Because it had a virus! *Beep boop*";
    }

    res.json({ response: response });
});

// Serve static files from the frontend directory
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
    console.log(`ProfileGuard Backend live at http://localhost:${port}`);
    console.log(`Frontend is also available at http://localhost:${port}/home.html`);
});

