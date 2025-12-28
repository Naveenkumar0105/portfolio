document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chips = document.querySelectorAll('.prompt-chip');

    // Knowledge Base (Trained on Resume)
    const knowledgeBase = {
        'intro': "I am Naveenkumar Narsozhan, a Master's student in CS at USC (Class of 2027) pursuing industry-focused roles in AI, ML, and Software Engineering. I am interested in building practical, scalable systems and am open to internship/full-time opportunities.",

        'education': "I am currently pursuing a Master's in CS at USC, focusing on application-oriented AI and Data Analytics. Previously, I earned my B.Tech in CSE from NIT Puducherry (CGPA 9.3/10) with a strong foundation in formal AI coursework.",

        'coursework': "My academic foundation is deep. \nAI/ML: Expert Systems, Deep Learning, Soft Computing, Pattern Recognition. \nNLP: Automata, Compiler Design. \nSystems: OS, Networks, Algorithms, DBMS.",

        'skills': "Programming: Python, C, C#, SQL, JavaScript. \nAI/ML: PyTorch, TensorFlow, OpenCV, Scikit-learn, Pandas. \nWeb: HTML/CSS, Angular, PHP. \nTools: Jupyter, Git, Azure.",

        'experience': "Professional Experience:\n1. HCLTech (Fresher SE): Trained in MSSQL, C#, .NET, Angular, and Azure API development. Gained enterprise software exposure.\n2. NIOT (Research Intern): Optimized ship routes using ML on weather/maritime data.",

        'projects': "Major Projects:\n1. LensSQL: NLP Encoder-Decoder to convert SQL queries into natural language summaries.\n2. Face Recognition Attendance: Automated identification using SVM & OpenCV.\n3. Pix2Pix Maps: GAN-based Aerial-to-Map translation.\n4. Valorant RAG Bot.",

        'lenssql': "LensSQL is an NLP project demonstrating applied AI. I used an Encoder-Decoder architecture on the Spider dataset to bridge the gap between structured SQL queries and human-readable language.",

        'face': "I built a Face Recognition Attendance System using Support Vector Machines (SVM) and OpenCV. It uses supervised learning for accurate individual identification.",

        'achievements': "Beyond coding, I am a competitive Chess player (Inter-college winner). I also served as President of the Arts & Crafts Club, organizing 20+ events, and led creative teams for college festivals.",

        'contact': "I am actively seeking opportunities. You can reach me at narsozha@usc.edu or connect on LinkedIn.",

        'default': "I can discuss my detailed Coursework, specific Projects (LensSQL, Face Rec), my HCL training, or my Leadership achievements (Chess, Clubs). What interests you?"
    };

    function getBotResponse(input) {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('intro') || lowerInput.includes('who are you') || lowerInput.includes('about') || lowerInput.includes('goal')) return knowledgeBase['intro'];
        if (lowerInput.includes('educat') || lowerInput.includes('degree') || lowerInput.includes('usc') || lowerInput.includes('nit')) return knowledgeBase['education'];
        if (lowerInput.includes('course') || lowerInput.includes('subject') || lowerInput.includes('class')) return knowledgeBase['coursework'];
        if (lowerInput.includes('skill') || lowerInput.includes('stack') || lowerInput.includes('python') || lowerInput.includes('tool')) return knowledgeBase['skills'];
        if (lowerInput.includes('experience') || lowerInput.includes('work') || lowerInput.includes('hcl') || lowerInput.includes('niot') || lowerInput.includes('job')) return knowledgeBase['experience'];

        // Projects
        if (lowerInput.includes('lens') || lowerInput.includes('sql') || lowerInput.includes('nlp')) return knowledgeBase['lenssql'];
        if (lowerInput.includes('face') || lowerInput.includes('attendance') || lowerInput.includes('vision')) return knowledgeBase['face'];
        if (lowerInput.includes('project') || lowerInput.includes('project') || lowerInput.includes('valorant') || lowerInput.includes('gan')) return knowledgeBase['projects'];

        // Misc
        if (lowerInput.includes('achievement') || lowerInput.includes('chess') || lowerInput.includes('club') || lowerInput.includes('lead')) return knowledgeBase['achievements'];
        if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('hire')) return knowledgeBase['contact'];

        return knowledgeBase['default'];
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-message');
        msgDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        // Handle newlines for lists
        msgDiv.innerHTML = text.replace(/\n/g, '<br>');
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typing-indicator';
        typingDiv.textContent = 'Assistant is thinking...';
        chatWindow.appendChild(typingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        typingDiv.style.display = 'block';
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }

    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';

        // Simulate thinking with typing indicator
        showTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            const response = getBotResponse(text);
            addMessage(response, 'bot');
        }, 1000); // 1 second delay for realism
    }

    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const text = chip.textContent.replace(/"/g, '');
            userInput.value = text;
            handleSend();
        });
    });
});
