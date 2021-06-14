const socket=io();

const $messageForm=document.querySelector("#message-form");
const $messageInput=document.querySelector("input");
const $messageButton=document.querySelector("button");
const $messages=document.querySelector("#messages");
const $scriptMessages=document.querySelector("#message-template").innerHTML;
const $locationScriptMessages=document.querySelector("#location-message-template").innerHTML;
const $sidebarNames=document.querySelector("#sidebar-template").innerHTML;

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on("locationMessage",(locatate)=>{
  //console.log(locatate);
  const location=Mustache.render($locationScriptMessages,{
    username:locatate.username,
    linkLocation:locatate.url,
    createdAt: moment(locatate.createdAt).format('h:mm a')
  });
  $messages.insertAdjacentHTML('beforeend',location);
  autoscroll();
})

socket.on("message",(msg)=>{
  //console.log(msg);
  const html=Mustache.render($scriptMessages,{
    username:msg.username,
    text:msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a')
  });
  //console.log(html);
  $messages.insertAdjacentHTML('beforeend',html);
  autoscroll();
})
$messageForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  $messageButton.setAttribute('disabled','disabled');

  //const message=document.querySelector("input").value;
  const message=e.target.elements.message.value;
  $messageInput.value="";
  $messageInput.focus();
  socket.emit("sendMessage",message,(msg)=>{
    $messageButton.removeAttribute('disabled');
    //console.log("message send "+msg);

  });
})

document.querySelector("#sendLocation").addEventListener('click',(e)=>{
  e.preventDefault();
  navigator.geolocation.getCurrentPosition(position=>{
    socket.emit("sendlocation",{
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })
  })
})


socket.emit("join",{username,room},(error)=>{
  if(error){
    alert(error);
    location.href='/';
  }
});

socket.on("roomData",({room,users})=>{
  const html1=Mustache.render($sidebarNames,{
    room,
    users
  });
  document.querySelector("#sidebar").innerHTML=html1;
})
// socket.on('countUpdated',(count)=>{
//   console.log("count has been updated "+count);
// });
//
// document.querySelector("#increment").addEventListener('click',()=>{
//   console.log("clicked");
//   socket.emit("increment");
// })
