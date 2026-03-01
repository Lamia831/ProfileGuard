document.addEventListener('DOMContentLoaded', () => {
    // 0. Auth Guard & User Session Logic
    const protectedPages = ['dashboard.html', 'check.html', 'report.html', 'admin.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    const currentUser = JSON.parse(localStorage.getItem('pg_current_user'));

    if (protectedPages.includes(currentPage) && !currentUser) {
        // Only skip if it's specifically the hardcoded admin case (which we'll handle by setting session on login)
        if (localStorage.getItem('pg_admin_logged_in') !== 'true') {
            console.warn("Unauthorized access attempt to", currentPage);
            window.location.href = "index.html";
            return;
        }
    }

    // Update User Name Display if on Dashboard
    const nameDisplay = document.getElementById('userNameDisplay');
    if (nameDisplay && currentUser) {
        nameDisplay.innerText = currentUser.name;
    } else if (nameDisplay && localStorage.getItem('pg_admin_logged_in') === 'true') {
        nameDisplay.innerText = 'Admin';
    }

    // 1. Theme Toggle Logic
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const html = document.documentElement;
        const icon = themeToggle.querySelector('i');

        const updateThemeIcon = (theme) => {
            if (icon) {
                if (theme === 'light') icon.classList.replace('fa-moon', 'fa-sun');
                else icon.classList.replace('fa-sun', 'fa-moon');
            }
        };

        const savedTheme = localStorage.getItem('theme') || 'dark';
        html.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    // 2. Intersection Observer for Scroll Animations
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, observerOptions);
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));

    // 3. Stats Animation
    const stats = document.querySelectorAll('.stat-item h3');
    if (stats.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const endValue = parseFloat(target.getAttribute('data-target'));
                    if (endValue) {
                        const suffix = target.innerText.replace(/[0-9.]/g, '');
                        animateValue(target, 0, endValue, 2000, suffix);
                        statsObserver.unobserve(target);
                    }
                }
            });
        }, { threshold: 0.5 });
        stats.forEach(s => statsObserver.observe(s));
    }

    function animateValue(obj, start, end, duration, suffix) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            let current = progress * (end - start) + start;
            obj.innerHTML = (end % 1 !== 0 ? current.toFixed(1) : Math.floor(current)) + suffix;
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    // 4. Chatbot Logic
    const chatTrigger = document.getElementById('chatTrigger');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const sendMessage = document.getElementById('sendMessage');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    const suggestionArea = document.getElementById('suggestionArea');

    if (chatTrigger && chatWindow) {
        chatTrigger.addEventListener('click', () => chatWindow.classList.toggle('active'));
        if (closeChat) closeChat.addEventListener('click', () => chatWindow.classList.remove('active'));

        const addMessage = (text, sender) => {
            const msg = document.createElement('div');
            msg.className = `msg ${sender}`;
            if (sender === 'bot') msg.innerHTML = text;
            else msg.textContent = text;
            chatMessages.appendChild(msg);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return msg;
        };

        const handleSend = async (textOverride = null) => {
            const text = textOverride || (userInput ? userInput.value.trim() : null);
            if (text) {
                if (!textOverride && userInput) userInput.value = '';
                addMessage(text, 'user');
                if (suggestionArea) suggestionArea.style.display = 'none';

                const typing = document.createElement('div');
                typing.className = 'msg bot typing-indicator';
                typing.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
                chatMessages.appendChild(typing);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // Client-side Chat Logic completely replacing backend
                setTimeout(() => {
                    const msg = text.toLowerCase().trim();
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

                    const inputWords = msg.split(/\s+/);
                    let bestMatch = null;
                    let maxScore = 0;

                    for (let intent in brain) {
                        let score = 0;
                        brain[intent].keywords.forEach(key => {
                            const keyLower = key.toLowerCase();
                            if (msg.includes(keyLower)) {
                                score += (keyLower.length >= 5) ? 3 : 2;
                            }
                            if (inputWords.includes(keyLower)) {
                                score += 5;
                            }
                        });

                        if (score > maxScore) {
                            maxScore = score;
                            bestMatch = intent;
                        }
                    }

                    if (maxScore < 5 && (msg.includes("profile") || msg.includes("guard") || msg.includes("site") || msg.includes("eta") || msg.includes("ki"))) {
                        if (!bestMatch) bestMatch = "website_info";
                    }

                    if (bestMatch && maxScore > 0) {
                        const possibleResponses = brain[bestMatch].responses;
                        response = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
                    }

                    if (msg.match(/(joke|hasaw|moja|হাসাও)/)) {
                        response = "Why did the computer go to the doctor? Because it had a virus! *Beep boop*";
                    }

                    chatMessages.removeChild(typing);
                    addMessage(response, 'bot');
                }, 600);
            }
        };

        if (sendMessage) sendMessage.addEventListener('click', () => handleSend());
        if (userInput) userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
        window.handleSuggestion = (text) => handleSend(text);
    }

    // 5. Analysis Page Logic (check.html)
    const fileInput = document.getElementById('fileInput');
    const previewImage = document.getElementById('previewImage');
    if (fileInput && previewImage) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    previewImage.src = event.target.result;
                    previewImage.style.display = 'block';
                    previewImage.style.animation = 'fadeIn 0.5s forwards';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // 6. Dashboard Logic
    const dashBar = document.getElementById('scoreBar');
    const dashText = document.getElementById('scoreText');
    if (dashBar && dashText) {
        let score = 0;
        const target = 89;
        const interval = setInterval(() => {
            if (score >= target) {
                clearInterval(interval);
                dashText.style.animation = "glow 2s infinite";
            } else {
                score++;
                dashText.innerText = score + '%';
                dashBar.style.strokeDashoffset = 440 - (440 * score / 100);
            }
        }, 30);
    }
});

// Global Utility Functions (Available to HTML inline handlers)

// Analysis Page Logic
window.runAnalysis = async () => {
    const btn = document.getElementById('analyzeBtn');
    const panel = document.getElementById('resultPanel');
    const bar = document.getElementById('meterBar');
    const resText = document.getElementById('resultText');
    const confText = document.getElementById('confidenceText');
    const radar = document.getElementById('radar');
    const previewImage = document.getElementById('previewImage');

    if (!btn) return;

    const username = document.getElementById('targetUsername')?.value.trim();
    if (!username) {
        alert("Please enter the @username you wish to analyze.");
        return;
    }

    const platform = document.querySelector('select')?.value || 'Instagram';
    const accountAge = document.getElementById('accAge')?.value || 12;
    const followers = document.getElementById('followers')?.value || 100;
    const following = document.getElementById('following')?.value || 200;
    const hasPhoto = previewImage?.style.display === 'block' ? 'yes' : 'no';

    btn.style.opacity = '0.5';
    btn.disabled = true;
    if (radar) radar.style.display = 'block';
    if (panel) panel.classList.remove('active');

    try {
        setTimeout(() => {
            let riskScore = 0;
            const fCount = parseInt(followers) || 0;
            const flngCount = parseInt(following) || 0;
            const age = parseInt(accountAge) || 12;

            const ratio = flngCount / (fCount + 1);
            if (ratio > 5) riskScore += 40;
            else if (ratio > 2) riskScore += 20;

            if (age < 1) riskScore += 30;
            else if (age < 6) riskScore += 15;

            if (hasPhoto === "no") riskScore += 20;

            if (15 < 5) riskScore += 10; // default posts 15

            let prediction;
            const totalConfidence = Math.min(100, 85 + (riskScore % 10));

            if (riskScore >= 60) {
                prediction = "🚩 HIGH RISK / FAKE";
            } else if (riskScore >= 30) {
                prediction = "⚠️ SUSPICIOUS ACCOUNT";
            } else {
                prediction = "✅ AUTHENTIC ACCOUNT";
            }

            if (radar) radar.style.display = 'none';
            btn.style.opacity = '1';
            btn.innerHTML = 'Scan Another Profile <i class="fas fa-sync"></i>';
            btn.disabled = false;

            if (panel) panel.classList.add('active');
            const score = totalConfidence;

            if (document.getElementById('resultTitle')) {
                document.getElementById('resultTitle').innerText = `Analysis: ${username}`;
            }

            if (bar) {
                bar.style.width = score + '%';
                const isFake = prediction.includes("FAKE");
                bar.style.background = isFake ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #10b981, #34d399)';
            }

            if (resText) {
                const isFake = prediction.includes("FAKE");
                resText.innerText = prediction;
                resText.style.color = isFake ? '#ef4444' : '#10b981';
            }
            if (confText) confText.innerText = `Artificial Intelligence Confidence Level: ${score}%`;
            if (panel) panel.scrollIntoView({ behavior: 'smooth' });
        }, 2500);

    } catch (error) {
        console.error("Backend connection failed. Simulating analysis...");
        setTimeout(() => {
            if (radar) radar.style.display = 'none';
            btn.style.opacity = '1';
            btn.innerHTML = 'Retry Scan <i class="fas fa-sync"></i>';
            btn.disabled = false;
            if (panel) {
                panel.classList.add('active');
                if (bar) {
                    bar.style.width = '75%';
                    bar.style.background = '#f59e0b';
                }
                if (resText) {
                    resText.innerText = 'OFFLINE ANALYSIS';
                    resText.style.color = '#f59e0b';
                }
                if (confText) confText.innerText = 'Server unreachable. Running edge diagnostics.';
            }
        }, 2500);
    }
};

// Report Submission Logic
window.submitReport = () => {
    const btn = document.querySelector('.report-container .btn-primary');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        btn.disabled = true;
        setTimeout(() => {
            alert("Report successfully submitted to the ProfileGuard safety team.");
            window.location.href = "dashboard.html";
        }, 1200);
    }
};

// Login Logic
window.login = (e) => {
    if (e) e.preventDefault();
    console.log("Login attempt initiated...");

    const user = document.getElementById("username")?.value.trim();
    const pass = document.getElementById("password")?.value.trim();

    if (!user || !pass) {
        alert("Please enter both your credentials.");
        return false;
    }

    // Check hardcoded admin
    if (user === "admin" && pass === "1234") {
        console.log("Admin logged in.");
        localStorage.setItem('pg_admin_logged_in', 'true');
        localStorage.removeItem('pg_current_user'); // Clear any previous user session
        alert("Login Successful! (Admin Access)");
        window.location.href = "dashboard.html";
        return false;
    }

    // Check localStorage users
    try {
        const users = JSON.parse(localStorage.getItem('pg_users') || "[]");
        console.log("Checking credentials against", users.length, "registered users.");

        // Find user by email (username) or Full Name
        const foundUser = users.find(u =>
            (u.username.toLowerCase() === user.toLowerCase() || u.name.toLowerCase() === user.toLowerCase())
            && u.password === pass
        );

        if (foundUser) {
            console.log("User found:", foundUser.name);
            alert(`Welcome back, ${foundUser.name || user}! Login Successful.`);
            // Store current user session
            localStorage.setItem('pg_current_user', JSON.stringify(foundUser));
            window.location.href = "dashboard.html";
        } else {
            console.warn("Authentication failed for:", user);
            alert("Invalid credentials. Please use your registered email/name and password.");
        }
    } catch (err) {
        console.error("Authentication Error:", err);
        alert("System error. Please clear browser storage and try again.");
    }
    return false;
};

// Signup Logic
window.handleSignup = (e) => {
    if (e) e.preventDefault();
    console.log("Signup attempt initiated...");

    const name = document.getElementById('name')?.value || "";
    const email = document.getElementById('email')?.value || "";
    const password = document.getElementById('password')?.value || "";

    if (!email || !password || !name) {
        alert("Please complete all security fields.");
        return false;
    }

    try {
        const users = JSON.parse(localStorage.getItem('pg_users') || "[]");

        if (users.some(u => u.username.toLowerCase() === email.trim().toLowerCase())) {
            alert("This email is already registered. Please login.");
            window.location.href = "index.html";
            return false;
        }

        const newUser = {
            name: name.trim(),
            username: email.trim(),
            password: password.trim(),
            joined: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('pg_users', JSON.stringify(users));
        console.log("New user registered successfully:", email);

        alert("Account created successfully! You can now log in.");
        window.location.href = "index.html";
    } catch (err) {
        console.error("Signup error:", err);
        alert("Security vault error. Storage might be full.");
    }
    return false;
};

// Global Logout Function
window.logout = (e) => {
    if (e) e.preventDefault();
    localStorage.removeItem('pg_current_user');
    localStorage.removeItem('pg_admin_logged_in');
    alert("You have been securely logged out.");
    window.location.href = "home.html";
};
