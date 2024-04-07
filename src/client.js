const socket = new WebSocket(`ws://${location.host}`);
const section = document.querySelector("section");

const name_ = /** @type {HTMLInputElement} */       (document.getElementById("name"));
const message_ = /** @type {HTMLInputElement} */ (document.getElementById("message"));
const file_ = /** @type {HTMLInputElement} */     (document.getElementById("file"));

function send() {
    if (name_.disabled && (message_.value.trim().length || file_.files.length)) {
        if (file_.files.length) {
            const fileReader = new FileReader();

            fileReader.addEventListener("load", () => {
                socket.send(JSON.stringify({
                    ip,
                    file: fileReader.result,
                    name: name_.value,
                    message: message_.value,
                }));
                file_.value = "";
            });

            fileReader.readAsDataURL(file_.files[0]);
        } else {
            socket.send(JSON.stringify({
                ip,
                message: message_.value,
                name: name_.value,
            }));
            message_.value = "";
        }
    } else {
        name_.disabled = true;
        file_.disabled = false;
        message_.disabled = false;
        message_.placeholder = "Zpráva...";
        message_.focus();  
    }
}

socket.addEventListener("message", (event) => {
    append(JSON.parse(event.data));
    section.scrollTo(0, section.scrollHeight);
});

async function load() {
    const response = await fetch("/chat/");
    const data = await response.json();
    data.forEach(append);
    section.scrollTo(0, section.scrollHeight);
}

function append(data) {
    const article = document.createElement("article");
    article.innerText = data.message;
    article.dataset.name = data.name;
    section.appendChild(article);

    if (data.ip === ip) {
        article.classList.add("self");
    } else {
        article.title = data.ip;
    }

    if (data.file) {
        const image = new Image();
        image.src = data.file;
        article.append(
            document.createElement("br"), 
            document.createElement("br"),
            image
        );
    }

    section.scrollTo(0, section.scrollHeight);
}