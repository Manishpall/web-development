
function setFormMessage(formElement, type, message) {
    const messageElement = formElement.querySelector(".form__message");

    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
}

function setInputError(inputElement, message) {
    inputElement.classList.add("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = message;
}

function clearInputError(inputElement) {
    inputElement.classList.remove("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
    });

    document.querySelector("#linkLogin").addEventListener("click", e => {
        e.preventDefault();
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
    });

    createAccountForm.addEventListener("submit",async e => {
        e.preventDefault();
        const email=document.getElementById("RegisterEmail").value
        const password=document.getElementById("RegisterPassword").value
        const UserName=document.getElementById("UserName").value
        const RegisterPasswordConf=document.getElementById("RegisterPasswordConf").value
        let data ={
           email: email,
            password:password,
            username:UserName,
            passwordConf:RegisterPasswordConf

        }
        // Perform your AJAX/Fetch login
        const response=await fetch("http://localhost:3000/register",{
            method: 'POST', // or 'PUT'
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers:{
              'Content-Type': 'application/json'
            }
          })
          let res =await response.json()
          if(res.Success){
            setFormMessage(createAccountForm, "success", res.Success);
            setTimeout(()=>{
                e.preventDefault();
                createAccountForm.classList.add("form--hidden");
                loginForm.classList.remove("form--hidden");
                console.log("run")
            },500)
          }else{
            setFormMessage(createAccountForm, "error", res.Error);
          }
        
    });
    loginForm.addEventListener("submit",async e => {
        e.preventDefault();
        const email=document.getElementById("loginEmail").value
        const password=document.getElementById("loginPassword").value
        let data ={
            email,
            password
        }
        // Perform your AJAX/Fetch login
        const response=await fetch("http://localhost:3000/login",{
            method: 'POST', // or 'PUT'
            body: JSON.stringify(data), // data can be `string` or {object}!
            headers:{
              'Content-Type': 'application/json'
            }
          })
          let res =await response.json()
          if(res.Success){
            setFormMessage(loginForm, "success", res.message);
            localStorage.setItem("buttonvalue","Logout")
            localStorage.setItem("user",JSON.stringify(res.userInfo))
            setTimeout(()=>{
                window.location.replace("/index.html")
            },1000)
          }else{
            setFormMessage(loginForm, "error", res.message);
          }
        
    });

    document.querySelectorAll(".form__input").forEach(inputElement => {
        inputElement.addEventListener("blur", e => {
            if (e.target.id === "signupUsername" && e.target.value.length > 0 && e.target.value.length < 10) {
                setInputError(inputElement, "Username must be at least 10 characters in length");
            }
        });

        inputElement.addEventListener("input", e => {
            clearInputError(inputElement);
        });
    });
});