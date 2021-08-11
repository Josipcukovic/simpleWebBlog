const blogRef = db.collection("blogs");
const commentRef = db.collection("comments");
let linkSlike;

const blogForm = document.querySelector(".addNewBlogForm");
const cat = "cat.jpg"

const blogList = document.querySelector("#blog-list");
const addBlogPictureButton = document.getElementById("blogPhoto");


const uid = function () {
    return Date.now().toString(36) + Math.random().toString(36).substr(1) + Math.random().toString(36).substr(1);
}

addBlogPictureButton.addEventListener("change", e => {
    const file = e.target.files[0];
    const name = file.name;
    const metadata = {
        contentType: file.type,
    };
    const Storageref = storageDb.ref("Blog pictures/" + uid());

    Storageref.child(name).put(file, metadata).then((snapshot) => snapshot.ref.getDownloadURL()).then((link) => {
        linkSlike = link;
    });


});
///dodavanje novog bloga
blogForm.addEventListener("submit", e => {
    e.preventDefault();
    const now = new Date();
    const titleValue = blogForm["title"].value;
    const bodyValue = blogForm["body"].value;
    blogRef.add({
        title: titleValue,
        body: bodyValue,
        created_at: firebase.firestore.Timestamp.fromDate(now),
        created_by: auth.currentUser.displayName,
        picture: linkSlike
    })
    blogForm.reset();

})

function toggleTimeCreated() {
    event.target.previousElementSibling.classList.toggle("timeCreated");
}

const addCommentFormListener = (forma, id) => {
    forma.addEventListener("submit", e => {
        e.preventDefault();
        const comment = forma.querySelector(".comment").value;
        const now = new Date();
        if (comment.trim() == "") {
            forma.reset();
            return;
        }
        commentRef.doc(id).collection("thisBlogComments").add({
            comment,
            created_at: firebase.firestore.Timestamp.fromDate(now)
        })
        forma.reset();
    })
}


let removeListener;
const addComentListener = (commentShow, commentSection) => {
    commentShow.addEventListener("click", e => {

        if (commentSection.classList.contains("showComment")) {
            commentSection.classList.remove("showComment");
            const commentList = event.target.parentElement.nextElementSibling.querySelector(".commentsDisplay");
            commentList.innerHTML = "";
            removeListener();
        } else {
            commentSection.classList.add("showComment");
            const id = event.target.parentElement.getAttribute("id");


            var unsub = commentRef.doc(id).collection("thisBlogComments").orderBy("created_at", "desc").limit(20).onSnapshot(snapshot => {
                const mojUl = document.getElementById(id);
                const commentSection = mojUl.nextElementSibling;

                const listaKomentara = commentSection.querySelector(".commentsDisplay");
                console.log(listaKomentara);


                let changes = snapshot.docChanges().reverse();
                changes.forEach(document => {
                    if (document.doc.data() == undefined) {
                        return;
                    }
                    console.log(document.doc.data());
                    if (document.type == "added") {
                        listaKomentara.insertAdjacentHTML('afterbegin', `<li>${document.doc.data().comment}</li>`);
                    } else if (document.type == "removed") {
                        ///do nothing for now
                    }
                })
            })
            removeListener = unsub;

        }
    })
}

function dohvatiKomentare(id) {

    const mojUl = document.getElementById(id);
    const forma = mojUl.nextElementSibling.querySelector(".commentForm");
    const commentSection = mojUl.nextElementSibling;
    const commentShow = mojUl.querySelector(".commentPost");

    const listaKomentara = commentSection.querySelector(".commentsDisplay");
    console.log(listaKomentara);
    addCommentFormListener(forma, id);
    addComentListener(commentShow, commentSection);
}



//// moduli
const button = document.querySelector("#newBlog");
const wrapper = document.querySelector(".wrapper");
const popup = document.querySelectorAll(".popUp");

const buttonLogin = document.querySelector("#login");
const buttonRegister = document.querySelector("#register");


button.addEventListener("click", (e) => {
    wrapper.style.display = "block";
    //declared in auth.js
    wrapperLogin.style.display = "none";
    wrapperRegister.style.display = "none";

});

wrapper.addEventListener("click", (e) => {
    if (e.target.className != "content") {
        wrapper.style.display = "none";

    }
});

popup.forEach(popup => {
    popup.addEventListener("click", (e) => {
        e.stopPropagation();
    });
})

//login
buttonLogin.addEventListener("click", (e) => {
    wrapperLogin.style.display = "block";
    wrapper.style.display = "none";
    wrapperRegister.style.display = "none";
});

wrapperLogin.addEventListener("click", (e) => {
    if (e.target.className != "content") {
        wrapperLogin.style.display = "none";
    }
});

//register

buttonRegister.addEventListener("click", (e) => {
    wrapperRegister.style.display = "block";
    wrapperLogin.style.display = "none";
    wrapper.style.display = "none";
});

wrapperRegister.addEventListener("click", (e) => {
    if (e.target.className != "content") {
        wrapperRegister.style.display = "none";
    }
});