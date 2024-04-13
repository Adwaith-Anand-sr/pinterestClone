let likeCount = document.querySelectorAll(".like-count span");
document.querySelectorAll(".like-btn").forEach((item,i)=>{
   let index = i;
   item.addEventListener('click', function() {
      event.preventDefault();
      const postId = this.id;
      fetch(`/likes/post/${postId}`)
      .then(response => {
         if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data=>{
         console.log(data);
         if (likeCount.length > index) {
           const elementAtIndex = likeCount[index];
           elementAtIndex.textContent= data.value
           
         }
      })
      .catch(error => {
         console.error('Error liking the post:', error);
      });
      
      if (this.classList.contains("liked")) {
            this.querySelector("i").style.color="white";
            this.querySelector("i").classList.remove("bi-heart-fill");
            this.querySelector("i").classList.add("bi-heart");
            this.classList.remove("liked");
         }else{
            this.querySelector("i").style.color="red";
            this.querySelector("i").classList.remove("bi-heart");
            this.querySelector("i").classList.add("bi-heart-fill");
            this.classList.add("liked");
      }
   });
});

