document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chips = document.querySelectorAll('.prompt-chip');

    // Knowledge Base (Updated with Resume Data)
    const knowledgeBase = {
        'intro': "I am Naveenkumar Narsozhan, a Master's student in CS at USC (GPA 9.3/10 in B.Tech). I specialize in AI, NLP, and Cloud Computing.",

        'education': "I am currently pursuing an MS in Computer Science at the University of Southern California (2025-2027). I hold a B.Tech from NIT Puducherry with a CGPA of 9.3/10.",

        'skills': "My arsenal includes Python, C++, C#, and SQL. In the realm of AI, I wield PyTorch, TensorFlow, Transformers, and Scikit-learn. I am also versed in the Azure Cloud ecosystem.",

        'hcl': "At HCL Tech (Technical Lead), I migrated a legacy website with 50K+ monthly users to Azure, reducing costs by 20%. I also trained extensively in the Microsoft ecosystem.",

        'niot': "As a Research Intern at NIOT, I performed EDA on 1 Million+ data points to optimize ship fuel efficiency and analyzed trajectory data for maritime navigation.",

        'valorant': "The Valorant Strategy Assistant is a RAG-based chatbot I built using Mistral 7B and ChromaDB. It answers strategy questions by retrieving context from 50+ knowledge documents.",

        'pix2pix': "For my Aerial Image to Map project, I implemented a Conditional GAN (Pix2Pix) to translate satellite imagery into cartographic maps, fine-tuning it on geo-spatial datasets.",

        'covid': "I designed a two-stage CNN pipeline for Chest X-rays, achieving 96% accuracy in distinguishing COVID-19 vs. Viral Pneumonia.",

        'contact': "You can summon me via email at narsozha@usc.edu or find me on LinkedIn.",

        'default': "My knowledge covers my time at USC, my work at HCL/NIOT, and my AI projects. Ask me about 'Valorant', 'NIOT', or my 'Skills'."
    };

    function getBotResponse(input) {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('intro') || lowerInput.includes('who are you')) return knowledgeBase['intro'];
        if (lowerInput.includes('educat') || lowerInput.includes('usc') || lowerInput.includes('nit')) return knowledgeBase['education'];
        if (lowerInput.includes('skill') || lowerInput.includes('stack') || lowerInput.includes('python')) return knowledgeBase['skills'];
        if (lowerInput.includes('hcl') || lowerInput.includes('work') || lowerInput.includes('azure')) return knowledgeBase['hcl'];
        if (lowerInput.includes('niot') || lowerInput.includes('intern') || lowerInput.includes('ship')) return knowledgeBase['niot'];
        if (lowerInput.includes('valorant') || lowerInput.includes('rag') || lowerInput.includes('chat')) return knowledgeBase['valorant'];
        if (lowerInput.includes('pix2pix') || lowerInput.includes('gan') || lowerInput.includes('map')) return knowledgeBase['pix2pix'];
        if (lowerInput.includes('covid') || lowerInput.includes('x-ray') || lowerInput.includes('cnn')) return knowledgeBase['covid'];
        if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('phone')) return knowledgeBase['contact'];

        return knowledgeBase['default'];
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-message');
        msgDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        msgDiv.textContent = text;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';

        setTimeout(() => {
            const response = getBotResponse(text);
            addMessage(response, 'bot');
        }, 600);
    }

    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            userInput.value = chip.textContent.replace(/"/g, '');
            handleSend();
        });
    });
});
