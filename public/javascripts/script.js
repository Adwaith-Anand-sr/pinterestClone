// const socket = io("http://localhost:4000")

// socket.emit("join", username);

function goBack() {
   window.history.back();
}

function openChat(userId) {
   fetch("/message/chat/" + userId)
   .then((response)=>{
      if(response.ok) window.location.href = `/message/chat/${userId}`
   })
}

function scrollToBottom() {
   const chatList = document.querySelector('.chatSection');
   chatList.scrollTop = chatList.scrollHeight;
}
window.onload = scrollToBottom;

function bubbleNotify(value) {
   (value<=10) ? document.getElementById("bubbleNotify").textContent = value : document.getElementById("bubbleNotify").textContent = "10+"
   notify.classList.add("bg-green-400")
}

// Add an event listener to the form submission
document.getElementById('uploadForm').addEventListener('submit', async (event) => {
   event.preventDefault(); 
   
   const formData = new FormData(event.target);
   
   try {
     const response = await fetch('/upload', {
         method: 'POST',
         body: formData
     });
     
     if (response.ok) {
         console.log('Post uploaded successfully');
         window.location.href = '/profile'; 
     } else {
         console.error('Error uploading image:', response.statusText);
     }
   } catch (error) {
      console.error('Error uploading image:', error);
      // You can display an error message to the user here
   }
});
