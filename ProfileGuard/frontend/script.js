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

                try {
                    const response = await fetch('/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: text })
                    });
                    const data = await response.json();
                    setTimeout(() => {
                        chatMessages.removeChild(typing);
                        addMessage(data.response, 'bot');
                    }, 600);
                } catch (error) {
                    chatMessages.removeChild(typing);
                    addMessage("Signal lost. Ensure the ProfileGuard backend node is synchronized.", 'bot');
                }
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
        const response = await fetch("/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ platform, accountAge, followers, following, posts: 15, photo: hasPhoto })
        });
        const data = await response.json();

        setTimeout(() => {
            if (radar) radar.style.display = 'none';
            btn.style.opacity = '1';
            btn.innerHTML = 'Scan Another Profile <i class="fas fa-sync"></i>';
            btn.disabled = false;

            if (panel) panel.classList.add('active');
            const score = data.confidence;

            if (document.getElementById('resultTitle')) {
                document.getElementById('resultTitle').innerText = `Analysis: ${username}`;
            }

            if (bar) {
                bar.style.width = score + '%';
                const isFake = data.prediction.includes("FAKE");
                bar.style.background = isFake ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #10b981, #34d399)';
            }

            if (resText) {
                const isFake = data.prediction.includes("FAKE");
                resText.innerText = data.prediction;
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
