let posts = JSON.parse(localStorage.getItem("forumPosts")) || [];

function saveData() {
    localStorage.setItem("forumPosts", JSON.stringify(posts));
}

function addPost() {
    let title = document.getElementById("postTitle").value;
    let content = document.getElementById("postContent").value;

    if (title === "" || content === "") {
        alert("Judul dan isi postingan tidak boleh kosong!");
        return;
    }

    posts.push({
        title: title,
        content: content,
        comments: []
    });

    saveData();
    displayPosts();

    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
}

function addComment(index) {
    let commentInput = document.getElementById(`commentInput${index}`);
    let commentText = commentInput.value;

    if (commentText === "") return;

    posts[index].comments.push(commentText);
    saveData();
    displayPosts();
}

function deletePost(index) {
    if (confirm("Yakin ingin menghapus postingan ini?")) {
        posts.splice(index, 1);
        saveData();
        displayPosts();
    }
}

function displayPosts() {
    let postList = document.getElementById("postList");
    postList.innerHTML = "";

    posts.forEach((post, index) => {
        let postHTML = `
            <div class="post">
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                
                <button class="delete-btn" onclick="deletePost(${index})">Hapus</button>

                <div class="comments">
                    <strong>Komentar:</strong>
                    <ul>
                        ${post.comments.map(c => `<li>${c}</li>`).join("")}
                    </ul>

                    <div class="comment-box">
                        <input type="text" id="commentInput${index}" placeholder="Tambahkan komentar...">
                        <button onclick="addComment(${index})">Kirim</button>
                    </div>
                </div>
            </div>
        `;

        postList.innerHTML += postHTML;
    });
}

displayPosts();
