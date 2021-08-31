const postId = localStorage.getItem("postId");
const reportButton = document.querySelector(".report");

const getComments = (postId) => {
  commentRef.doc(postId).collection("thisBlogComments").orderBy("created_at", "desc").onSnapshot(snapshot => {
    const commentSection = document.querySelector(".commentSection")
    const forma = commentSection.querySelector(".commentForm");
    addCommentFormListener(forma, postId);
    renderComments(commentSection, snapshot);
  })
}


///dohvati blog
blogRef.doc(postId).get().then(document => {
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
        njegova = "userPic.png";
      }
    }
    else {
      njegova = "userPic.png";
    }

    const deleteTemplate = `<div class='delete' >X</div>`;
    const blogTemplate = ` <li class="blog-list-element" id=${document.id}> 
  <img src="${ownerOfTheBlog ? (auth.currentUser.photoURL != null ? auth.currentUser.photoURL : "userPic.png") : njegova}" alt="#" class="profilna">
    <p class ="author">Written by: ${ownerOfTheBlog ? "You" : data.created_by}</p>
    <span class="titleOfPost">${data.title}</span>
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
      </div> 
      `
    blogList.insertAdjacentHTML('afterbegin', blogTemplate);
    getComments(document.id);
    getLikes();
    reportButton.classList.add("show");
  })

});

let unsubLikes = null;
let unsubDislikes = null;

const getDislikes = () => {
  const dislikeRef = db.collection("dislikes").doc(postId).collection("dislikedBy");
  unsubDislikes = dislikeRef.onSnapshot((doc) => {
    const dislikeNumber = document.querySelector(".dislike-number");
    dislikeNumber.innerHTML = doc.size;

  })
}

function getLikes() {

  const likeRef = db.collection("likes").doc(postId).collection("likedBy");
  unsubLikes = likeRef.onSnapshot((doc) => {
    const likeNumber = document.querySelector(".like-number");
    likeNumber.innerHTML = doc.size;

  })
  getDislikes();

}

const openUserProfile = () => {
  localStorage.setItem("userId", auth.currentUser.uid);
  window.location.href = "myProfile.html";
}

const link = document.querySelector(".myProfile");

link.addEventListener("click", e => {
  if (unsubLikes != null) {
    unsubLikes();
  }
  if (unsubDislikes != null) {
    unsubDislikes();
  }
  openUserProfile();
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
    const parent = target.parentElement;
    parent.nextElementSibling.remove();
    parent.remove();

    blogRef.doc(id).delete();
    //like logic
  } else if (e.target.classList.contains("like")) {
    if (!auth.currentUser) return alert("You must be logged in to like this post");
    const likeRef = db.collection("likes");
    const dislikeRef = db.collection("dislikes").doc(postId).collection("dislikedBy").doc(auth.currentUser.uid);
    handleLikesAndDislikes(dislikeRef);

    likeRef.doc(postId).collection("likedBy").doc(auth.currentUser.uid).set({
      likedby: auth.currentUser.uid
    })

    //dislike logic
  } else if (e.target.classList.contains("dislike")) {
    if (!auth.currentUser) return alert("You must be logged in to dislike this post");
    const dislikeRef = db.collection("dislikes");
    const likeRef = db.collection("likes").doc(postId).collection("likedBy").doc(auth.currentUser.uid);;
    handleLikesAndDislikes(likeRef);

    dislikeRef.doc(postId).collection("dislikedBy").doc(auth.currentUser.uid).set({
      dislikedby: auth.currentUser.uid
    })
  }
})

////reporting
const reportsRef = db.collection("reports");

reportButton.addEventListener("click", e => {
  console.log(postId);
  reportsRef.doc(postId).get().then((doc) => {
    console.log(doc);
    if (doc.exists) {
      console.log("Document data:", doc.data());
      // reportsRef.doc(id).set({
      //   reportedId: id,
      //   reportedTimes: (doc.data().reportedTimes ? doc.data().reportedTimes + 1 : 0)
      // });

    } else {
      reportsRef.doc(postId).set({
        reportedId: postId,
        reportedTimes: 1
      });
    }

  }).catch((error) => {
    console.log("Error getting document");
  });


})
