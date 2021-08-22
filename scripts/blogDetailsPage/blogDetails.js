// const blogReff = db.collection("blogs");
// const blogList = document.querySelector("#blog-list");
const id = localStorage.getItem("id");
console.log(id);


function toggleTimeCreated() {
  event.target.previousElementSibling.classList.toggle("timeCreated");
}


const getComments = (id) => {
  commentRef.doc(id).collection("thisBlogComments").orderBy("created_at", "desc").limit(20).onSnapshot(snapshot => {
    console.log(snapshot);
    const mojUl = document.getElementById(id);
    const commentSection = document.querySelector(".commentSection")
    const forma = commentSection.querySelector(".commentForm");
    addCommentFormListener(forma, id);
    console.log(snapshot.docs);

    const listaKomentara = commentSection.querySelector(".commentsDisplay");

    let changes = snapshot.docChanges().reverse();
    changes.forEach(document => {
      if (document.doc.data() == undefined) {
        return;
      }
      if (document.type == "added") {
        userRef.doc(document.doc.data().created_by_id).get().then(doc => {

          const data = doc.data();
          listaKomentara.insertAdjacentHTML('afterbegin', `<li class="commentElement grid"><img src="${(data && data.slika) ? data.slika : "cat.jpg"}" alt="#" class="pictureOnComment"><r>${data ? `${data.ime} ${data.prezime}` : "unknown"}</r><z>${document.doc.data().comment}</z></li>`);
          // main.innerHTML += template;
        });
      }

    })
  })
}


///dohvati blog
blogRef.doc(id).get().then(document => {
  console.log(document.data());
  const data = document.data();
  const created_at = data.created_at.toDate();
  const now = new Date().getTime();
  const timeAgo = dateFns.distanceInWords(now, created_at.getTime(), { addSuffix: true });
  let njegova;
  const ownerOfTheBlog = auth.currentUser ? (data.created_by_id == auth.currentUser.uid) : false;
  const ownerOfTheBlogOrAdmin = auth.currentUser ? ((data.created_by_id == auth.currentUser.uid) || (auth.currentUser.uid == idToCheck.id)) : false;
  ///ovo je privremeno tu, promjeni to tako da svaki user mora imati sliku cim se registrira, tj uvalis mu defaultnu. Takodjer obrisi sve stare postove i usere
  //tako da svi imaju id itd... ovo njegova ces isto obrisati i izmjeniti tako sto ce uzeti userovu sliku, posto ju mora imati i ubacit ces ju
  userRef.doc(data.created_by_id).get().then(user => {
    const userData = user.data();

    if ((userData != undefined)) {
      if (userData.slika != undefined) {
        njegova = userData.slika;
      }
      else {
        njegova = "cat.jpg";
      }
    }
    else {
      njegova = "cat.jpg";
    }
    {/* <button class="like">Like</button>
      <button class="dislike">Dislike</button> */}
    const deleteTemplate = `<div class='delete' >X</div>`;
    const blogTemplate = ` <li class="blog-list-element" id=${document.id}> 
  <img src="${ownerOfTheBlog ? (auth.currentUser.photoURL != null ? auth.currentUser.photoURL : "cat.jpg") : njegova}" alt="#" class="profilna">
    <p class ="author">Written by: ${ownerOfTheBlog ? "You" : data.created_by}</p>
    <span>${data.title}</span>
    <img src="${data.picture != null ? data.picture : cat}" alt="#" class="blogPicture">
      <span class="dataBody">${data.body}</span> 
      <div class = "tooltip"> ${created_at.toLocaleDateString()} at ${created_at.toLocaleTimeString()} </div>
      <p class="createdAt" onmouseover="toggleTimeCreated()" onmouseleave="toggleTimeCreated()"> ${timeAgo} </p> 
      ${ownerOfTheBlogOrAdmin ? deleteTemplate : ""}
      
      </li> 
      <div class="reactionContainer grid">
      <div class="likeContainer">
      <p class="like-number"></p>
      <i class="fas fa-thumbs-up  fa-lg like"></i>
      </div>
      <div class="dislikeContainer">
      <p class="dislike-number"></p>
      <i class="fas fa-thumbs-down fa-lg dislike"></i>
      </div>
      </div>
      
      <div class ="commentSection details showComment" >
      <form class="commentForm">
        <input type="text" name="comment" placeholder="Your comment..." class="comment">
      </form>
      <ul class="commentsDisplay"> </ul>
      </div> `
    blogList.insertAdjacentHTML('afterbegin', blogTemplate);
    getComments(document.id);
    getLikes();
  })
  //////






});

function getLikes() {
  const likeRef2 = db.collection("likes").doc(id).collection("likedBy");
  const dislikeRef = db.collection("dislikes").doc(id).collection("dislikedBy");

  likeRef2.get().then((doc) => {
    ///kako dobiti broj lajkova
    console.log("liked", doc.size);
    const likeNumber = document.querySelector(".like-number");
    likeNumber.innerHTML = doc.size;

  }).catch((error) => {
    console.log("Error getting document", error);
  });

  dislikeRef.get().then((doc) => {
    ///kako dobiti broj lajkova
    console.log("disliked", doc.size);
    const dislikeNumber = document.querySelector(".dislike-number");
    dislikeNumber.innerHTML = doc.size;

  }).catch((error) => {
    console.log("Error getting document", error);
  });
}

const link = document.querySelector(".myProfile");

link.addEventListener("click", e => {
  console.log(e.target);
  localStorage.setItem("id", auth.currentUser.uid);
  window.location.href = "myProfile.html";
});


////lajkovi

const handleLikesAndDislikes = (path) => {
  path.get().then((doc) => {

    if (doc.exists) {
      console.log("Document data:", doc.data());
      path.delete();
    }
  })
};





//deleting
blogList.addEventListener("click", e => {
  e.preventDefault();
  if (e.target.classList.contains("delete")) {
    const id = e.target.parentElement.getAttribute("id");
    const target = document.getElementById(id);
    target.nextElementSibling.remove();
    target.remove();
    blogRef.doc(id).delete();
    //like logic
  } else if (e.target.classList.contains("like")) {
    const likeRef = db.collection("likes");
    const dislikeRef = db.collection("dislikes").doc(id).collection("dislikedBy").doc(auth.currentUser.uid);
    handleLikesAndDislikes(dislikeRef);

    likeRef.doc(id).collection("likedBy").doc(auth.currentUser.uid).set({
      likedby: auth.currentUser.uid
    })

    //dislike logic
  } else if (e.target.classList.contains("dislike")) {
    const dislikeRef = db.collection("dislikes");
    console.log(id, auth.currentUser.uid);
    const likeRef = db.collection("likes").doc(id).collection("likedBy").doc(auth.currentUser.uid);;
    handleLikesAndDislikes(likeRef);

    dislikeRef.doc(id).collection("dislikedBy").doc(auth.currentUser.uid).set({
      dislikedby: auth.currentUser.uid
    })
  }
})

////reporting
const reportButton = document.querySelector(".report");
const reportsRef = db.collection("reports");

reportButton.addEventListener("click", e => {

  reportsRef.doc(id).get().then((doc) => {

    if (doc.exists) {
      console.log("Document data:", doc.data());
      reportsRef.doc(id).set({
        reportedId: id,
        reportedTimes: (doc.data().reportedTimes ? doc.data().reportedTimes + 1 : 0)
      });

    } else {
      reportsRef.doc(id).set({
        reportedId: id,
        reportedTimes: 1
      });
    }

  }).catch((error) => {
    console.log("Error getting document");
  });


})
