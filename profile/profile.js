const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async () => {
    if (token) {
        try {
            const userInfoData = await getEmailFromToken(token);
            if (userInfoData) {
                displayUserInfoAndFetchUserInfo(userInfoData);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        window.location.href = '/login/login.html';
    }
});

const informationUser = document.querySelector('.information');
const avatarUser = document.querySelector('.avatar');

async function displayUserInfoAndFetchUserInfo(userInfoData) {
    console.log(userInfoData)
    if (userInfoData) {
        const gravatarUrl = `https://www.gravatar.com/avatar/${md5(userInfoData.userInfo.email)}?s=300&d=identicon`;
        const avatar = document.createElement('div')
        avatar.classList.add = ('container')
        avatar.innerHTML = `
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Name</h6>
            </div>
            <div class="col-sm-9 text-secondary" id="fullName">${userInfoData.userInfo.name}</div>
        </div>
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Email</h6>
            </div>
            <div class="col-sm-9 text-secondary" id="email">${userInfoData.userInfo.email}</div>
        </div>
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Age</h6>
            </div>
            <div class="col-sm-9 text-secondary" id="age">${userInfoData.userInfo.age}</div>
        </div>
        <div class="row">
            <img src="${gravatarUrl}" alt="Avatar">
        </div>
        <div class="row">
            <div class="col-sm-12">
                <h6 class="mb-0">Chuck Norris Joke</h6>
            </div>
            <div class="col-sm-12 text-secondary" id="chuckNorrisJoke"></div>
        </div>
        `;
        const infoContainer = document.createElement('div');
        infoContainer.classList.add('container');
        infoContainer.innerHTML = `
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Name</h6>
            </div>
            <div class="col-sm-9 text-secondary" id="fullName">${userInfoData.userInfo.name}</div>
        </div>
        <br> 
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Email</h6>
            </div>
            <div class="col-sm-9 text-secondary" id="email">${userInfoData.userInfo.email}</div>
        </div>
        <br> 
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Age</h6>
            </div>
            <div class="col-sm-9 text-secondary" id="age">${userInfoData.userInfo.age}</div>
        </div>
        <br> 
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Country</h6>
            </div>
            <div class="col-sm-9 text-secondary" id="country">${userInfoData.userInfo.country}</div>
        </div>
        <br> 
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Gender</h6>
            </div>
            <div class="col-sm-9 text-secondary" id="gender">${userInfoData.userInfo.gender}</div>
        </div>
        <br> 
        <div class="row">
            <div class="col-sm-3">
                <h6 class="mb-0">Admin</h6>
            </div>
            <div class="col-sm-9 text-secondary" id="isAdmin">${userInfoData.userInfo.isAdmin}</div>
        </div>
        <br> 
        <div class="row">
                  <div class="col-sm-12">
                 <button type="button" id="editUser">Edit</button>
                  </div>
                </div>
                <br>
    `;

        informationUser.appendChild(infoContainer);
        avatarUser.appendChild(avatar);
    }
    const editUserButton = document.getElementById('editUser');
    editUserButton.addEventListener('click', async function () {
        addBtn();
    });
}
fetch('https://api.chucknorris.io/jokes/random')
  .then(response => response.json())
  .then(data => {
    document.getElementById('chuckNorrisJoke').innerText = data.value;
  })
  .catch(error => {
    console.error('Error fetching Chuck Norris joke:', error);
  });

async function getEmailFromToken(token) {
    try {
        const tokenParts = token.split('.');
        const decodedBody = atob(tokenParts[1]);
        const tokenBody = JSON.parse(decodedBody);
        return await userInfo(tokenBody.email, token);
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function userInfo(email, token) {
    try {
        const response = await fetch(`http://localhost:3000/api/getUser/${email}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
}

document.getElementById('logout').addEventListener('click', function () {
    logout();
});

function logout() {
    localStorage.removeItem('token');
    alert('You have been signed out.');
    window.location.href = '/login/login.html';
}

function md5(string) {
    let hash = 0;
    if (string.length === 0) {
        return hash;
    }
    for (let i = 0; i < string.length; i++) {
        const char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

document.querySelector("#cancel").addEventListener("click", function() {
    cancelBtn();
});
function addBtn() {
    $('.dialog').attr('close', false);
    $('.dialog').attr('open', true);

}
function cancelBtn() {
    $('.dialog').attr('open', false)
    $('.dialog').attr('close', true)

}
document.getElementById('updateBtn').addEventListener('click',async function(){
    await Update()
})

async function Update(){
    const nameInput = document.getElementById('regName');
    const ageInput = document.getElementById('regAge');
    const countryInput = document.getElementById('regCountry');
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const user = await getEmailFromToken(token)
    console.log(user)
    const Admin = user.userInfo.isAdmin
    console.log(Admin)
    const id=user.userInfo._id
    const name = nameInput.value;
    const email = user.userInfo.email;
    const age = ageInput.value;
    const country = countryInput.value;
    const gender = genderInput ? genderInput.value : '';
    const isAdmin=Admin

    await updateUserInfo(id, name,email,age,country,gender,isAdmin)
    cancelBtn()
}
async function updateUserInfo(id, name,email,age,country,gender,isAdmin) {
    try {
        const response = await fetch(`http://localhost:3000/api/patchUser/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name,email,age,country,gender,isAdmin })
        });

    } catch (error) {
        console.error('Error updating task:', error);
    }
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