const loginContainer = document.querySelector('#loginForm');
const registrationContainer = document.querySelector('#registrationForm');
document.querySelector('#loginBtn').addEventListener("click", login);
document.querySelector('#registerBtn').addEventListener("click", registration);


async function login() {
    const loginEmail = document.getElementById('loginEmail').value;
    const loginPassword = document.getElementById('loginPassword').value;

    try {
        const token = await getToken(loginEmail, loginPassword);
        //console.log(token)

            if (token) {
                setLocalStorage('token', token, 30); 
                alert('Login successful');
            window.location.href='/main/index.html'
            } else {
            alert('Incorrect email or password');
        }
    } catch (error) {
        console.error('Error logging in', error);
    }

    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

async function registration() {
    const nameInput = document.getElementById('regName');
    const emailInput = document.getElementById('regEmail');
    const passwordInput = document.getElementById('regPassword');
    const ageInput = document.getElementById('regAge');
    const countryInput = document.getElementById('regCountry');
    const genderInput = document.querySelector('input[name="gender"]:checked');

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const age = ageInput.value;
    const country = countryInput.value;
    const gender = genderInput ? genderInput.value : '';
    const isAdmin=false

    try {
        const token = await registerUser(name, email, password, age, country, gender, isAdmin);
        console.log(token);

        if (token) {
            setLocalStorage('token', token, 30);
            alert('Registration successful');
        } else {
            alert('Registration failed');
        }
    } catch (error) {
        console.error('Error registering user', error);
    }

    // Clear input fields after registration
    nameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    ageInput.value = '';
    countryInput.value = '';
    genderRadios.forEach(radio => {
        radio.checked = false;
    });
}

async function getToken(email, password) {
    try {
        const response = await fetch(`http://localhost:3000/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            return data.token;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting token', error);
        return null;
    }
}



async function registerUser(name, email, password, age, country, gender , isAdmin) {
    try {
        const response = await fetch(`http://localhost:3000/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, age, country, gender, isAdmin })
        });

        if (response.ok) {
            const data = await response.json();
           // console.log(data)
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error registering user', error);
        return null;
    }
}

function toggleForm() {
    var loginForm = document.getElementById('loginForm');
    var registrationForm = document.getElementById('registrationForm');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registrationForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registrationForm.style.display = 'block';
    }
}


async function getUserInfo(email){
    try {
        const response = await fetch(`http://localhost:3000/api/getUser/${email}`);
        const data = await response.json();
       // console.log(data);
        return data.userInfo;
    } catch (error) {
        console.error('error:', error);
    }
}


function setLocalStorage(name, value, days) {
    localStorage.setItem(name, value);
    //console.log("Local storage set:", localStorage.getItem(name)); 
}





fetch('https://restcountries.com/v3.1/all')
  .then(response => response.json())
  .then(data => {
   
    populateDropdown(data);
  })
  .catch(error => {
    console.error('Error fetching countries:', error);
  });

  function populateDropdown(countries) {
    const selectElement = document.getElementById('regCountry');
  
   
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.name.common;
      option.textContent = country.name.common;
      selectElement.appendChild(option);
    });
  }
  
  const genderRadios = document.querySelectorAll('input[name="gender"]');
genderRadios.forEach(radio => {
    radio.addEventListener('change', () => {
       // console.log('Selected gender:', radio.value);
    });
});