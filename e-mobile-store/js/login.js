const loginButton=document.getElementById('loginbutton')
if(localStorage.getItem("buttonvalue"))
{
    // loginButton.innerHTML=localStorage.getItem("buttonvalue")
    const firstElement=document.getElementById('firstelement')
   let a= document.createElement('a')
//    a.href = 'login.html';
   let button=document.createElement('button')
   button.innerHTML=localStorage.getItem("buttonvalue")
   button.className='login'
   button.onclick=async ()=>{
    if (confirm("Do you REALLY want this?")){
      //your AJAX CALL HERE
      localStorage.removeItem('buttonvalue')
      localStorage.removeItem('user')
      await fetch("http://localhost:3000/logout")
      window.location.replace("/login.html")
   }
   }

   a.appendChild(button)
   firstElement.appendChild(a)
}
else{
    const firstElement=document.getElementById('firstelement')
   let a= document.createElement('a')
   a.href = 'login.html';
   let button=document.createElement('button')
   button.innerHTML='LOGIN'
   button.className='login'
   a.appendChild(button)
   firstElement.appendChild(a)
}

const username = document.getElementById("username")
if(localStorage.getItem('user')){
   let user =JSON.parse(localStorage.getItem('user'))
   document.getElementById("username").innerText = `Welcome ${user.username}`
}