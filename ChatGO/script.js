/* =========================================
   CHATGO
   AI CHATBOT
========================================= */


/* =========================================
   GEMINI API CONFIG
=========================================

   IMPORTANT:
   Don't publish a real API key inside
   frontend JavaScript.

   For testing only, you can put your key here.

========================================= */


/* =========================================
   ELEMENTS
========================================= */

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const chatContainer = document.getElementById("chatContainer");

const welcome = document.getElementById("welcome");

const newChatButton = document.getElementById("newChat");
const clearChatsButton = document.getElementById("clearChats");
const clearCurrentButton = document.getElementById("clearCurrent");

const mobileMenu = document.getElementById("mobileMenu");
const closeSidebar = document.getElementById("closeSidebar");

const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");

const suggestions = document.querySelectorAll(".suggestion");


/* =========================================
   CHAT HISTORY
========================================= */

let conversation = [];


/* =========================================
   SEND MESSAGE
========================================= */

async function sendMessage(text = null) {

    const message = text || messageInput.value.trim();

    if (!message) return;

    messageInput.value = "";

    autoResize();

    hideWelcome();

    addMessage("user", message);

    conversation.push({
        role: "user",
        text: message
    });

    showTyping();

    sendButton.disabled = true;

    try {

        const response = await askGroq(message);

        removeTyping();

        conversation.push({
            role: "assistant",
            text: response
        });

        saveConversation();

    } catch (error) {

    console.error("ChatGO Error:", error);

    removeTyping();

    addMessage(
        "ai",
        error.message
    );
 } finally {

        sendButton.disabled = false;

        messageInput.focus();

    }
}


/* =========================================
   Groq API
========================================= */

async function askGroq(message) {

    const response = await fetch(
        "/.netlify/functions/chat",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })
        }
    );


    if (!response.ok) {

        const errorData =
            await response.json();

        throw new Error(
            errorData?.error ||
            `ChatGO server error: ${response.status}`
        );
    }


    const data =
        await response.json();


    const fullResponse =
        data.response;


    if (!fullResponse) {

        throw new Error(
            "ChatGO received an empty response."
        );
    }


    removeTyping();


    // Create AI message
    const messageElement =
        document.createElement("div");

    messageElement.className =
        "message ai";


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent = "✦";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    messageElement.appendChild(avatar);

    messageElement.appendChild(content);

    chatContainer.appendChild(messageElement);


    // Render Markdown
    content.innerHTML =
        marked.parse(fullResponse);


    scrollToBottom();


    // Copy button
    const copyButton =
        document.createElement("button");

    copyButton.className =
        "copy-btn";

    copyButton.textContent =
        "Copy";


    copyButton.onclick = () => {

        navigator.clipboard.writeText(
            fullResponse
        );

        copyButton.textContent =
            "Copied!";

        setTimeout(() => {

            copyButton.textContent =
                "Copy";

        }, 1500);
    };


    content.appendChild(copyButton);


    return fullResponse;
}


/* =========================================
   ADD MESSAGE
========================================= */

function addMessage(type, text) {

    const message = document.createElement("div");

    message.className =
        `message ${type}`;


    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    avatar.textContent =
        type === "ai"
            ? "✦"
            : "U";


    const content = document.createElement("div");

    content.className = "message-content";

    content.textContent = text;


    if (type === "ai") {

        const copyButton =
            document.createElement("button");

        copyButton.className = "copy-btn";

        copyButton.textContent = "Copy";

        copyButton.onclick = () => {

            navigator.clipboard.writeText(text);

            copyButton.textContent = "Copied!";

            setTimeout(() => {

                copyButton.textContent = "Copy";

            }, 1500);

        };

        content.appendChild(copyButton);

    }


    message.appendChild(avatar);

    message.appendChild(content);


    chatContainer.appendChild(message);


    scrollToBottom();
}


/* =========================================
   TYPING INDICATOR
========================================= */

function showTyping() {

    const message =
        document.createElement("div");

    message.className =
        "message ai";

    message.id =
        "typingMessage";


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        "✦";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const typing =
        document.createElement("div");

    typing.className =
        "typing";


    typing.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;


    content.appendChild(typing);

    message.appendChild(avatar);

    message.appendChild(content);

    chatContainer.appendChild(message);

    scrollToBottom();
}


function removeTyping() {

    const typing =
        document.getElementById("typingMessage");

    if (typing) {

        typing.remove();

    }
}


/* =========================================
   HIDE WELCOME
========================================= */

function hideWelcome() {

    if (welcome) {

        welcome.style.display = "none";

    }
}


/* =========================================
   NEW CHAT
========================================= */

function newChat() {

    conversation = [];

    chatContainer.innerHTML = "";

    chatContainer.appendChild(welcome);

    welcome.style.display = "block";

    messageInput.value = "";

    saveConversation();

}


/* =========================================
   CLEAR CHAT
========================================= */

function clearChat() {

    newChat();

}


/* =========================================
   LOCAL STORAGE
========================================= */

function saveConversation() {

    localStorage.setItem(
        "chatgo_conversation",
        JSON.stringify(conversation)
    );

}


function loadConversation() {

    const saved =
        localStorage.getItem(
            "chatgo_conversation"
        );


    if (!saved) return;


    try {

        conversation =
            JSON.parse(saved);


        if (conversation.length > 0) {

            hideWelcome();

            conversation.forEach(message => {

                const type =
                    message.role === "user"
                        ? "user"
                        : "ai";

                addMessage(
                    type,
                    message.text
                );

            });

        }

    } catch {

        conversation = [];

    }

}


/* =========================================
   AUTO RESIZE TEXTAREA
========================================= */

function autoResize() {

    messageInput.style.height =
        "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            150
        ) + "px";

}


/* =========================================
   SCROLL
========================================= */

function scrollToBottom() {

    setTimeout(() => {

        chatContainer.scrollTop =
            chatContainer.scrollHeight;

    }, 50);

}


/* =========================================
   ENTER TO SEND
========================================= */

messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================================
   INPUT
========================================= */

messageInput.addEventListener(
    "input",
    autoResize
);


/* =========================================
   SEND BUTTON
========================================= */

sendButton.addEventListener(
    "click",
    () => sendMessage()
);


/* =========================================
   SUGGESTIONS
========================================= */

suggestions.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const message =
                button.dataset.message;

            sendMessage(message);

        }
    );

});


/* =========================================
   NEW CHAT
========================================= */

newChatButton.addEventListener(
    "click",
    newChat
);


/* =========================================
   CLEAR
========================================= */

clearChatsButton.addEventListener(
    "click",
    clearChat
);

clearCurrentButton.addEventListener(
    "click",
    clearChat
);


/* =========================================
   MOBILE SIDEBAR
========================================= */

mobileMenu.addEventListener(
    "click",
    () => {

        sidebar.classList.add("open");

        overlay.classList.add("active");

    }
);


closeSidebar.addEventListener(
    "click",
    closeMobileMenu
);


overlay.addEventListener(
    "click",
    closeMobileMenu
);


function closeMobileMenu() {

    sidebar.classList.remove("open");

    overlay.classList.remove("active");

}


/* =========================================
   INITIALIZE
========================================= */

loadConversation();

messageInput.focus();

/* =========================================
   ABOUT CHATGO
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const aboutButton =
        document.getElementById("aboutChatGO");

    const aboutOverlay =
        document.getElementById("aboutOverlay");

    const aboutClose =
        document.getElementById("aboutClose");


    // Check elements
    console.log("ChatGO About:", {
        button: aboutButton,
        overlay: aboutOverlay,
        close: aboutClose
    });


    // If something is missing
    if (
        !aboutButton ||
        !aboutOverlay ||
        !aboutClose
    ) {

        console.error(
            "ChatGO: About ChatGO elements not found."
        );

        return;
    }


    // OPEN
    aboutButton.addEventListener("click", () => {

        aboutOverlay.classList.add("active");

        document.body.style.overflow = "hidden";

    });


    // CLOSE BUTTON
    aboutClose.addEventListener("click", () => {

        aboutOverlay.classList.remove("active");

        document.body.style.overflow = "";

    });


    // CLICK OUTSIDE
    aboutOverlay.addEventListener("click", (event) => {

        if (event.target === aboutOverlay) {

            aboutOverlay.classList.remove("active");

            document.body.style.overflow = "";

        }

    });


    // ESC
    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            aboutOverlay.classList.contains("active")
        ) {

            aboutOverlay.classList.remove("active");

            document.body.style.overflow = "";

        }

    });

});
