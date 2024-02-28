const token = localStorage.getItem('token');
if (token) {
   // console.log('Token:', token);
} else {
    console.error('Token not found in cookie');
}

document.getElementById('logout').addEventListener('click', function() {
    logout();
});

function logout() {
    localStorage.removeItem('token');
    alert('You have been signed out.');
    window.location.href = '/login/login.html';
}

async function getCarouselItems() {
    try {
        const response = await fetch(`http://localhost:3000/api/images`);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error('Error:', err);
    }
}

function generateCarouselHTML(items) {
    let html = '';
    items.forEach((item, index) => {
        const activeClass = index === 0 ? 'active' : '';
        html += /*html*/`
        <div class="carousel-item ${activeClass}">
            <img src="${item.url}" class="d-block w-100" alt="Slide ${index + 1}">
            <div class="carousel-caption">
                <h5>${item.title}</h5>
                <p>${item.description}</p>
                <button class="btn btn-info btn-sm update-btn" data-id="${item._id}">Update</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${item._id}">Delete</button>
            </div>
        </div>
      `;
    });
    return html;
}



async function handleUpdateButtonClick(event) {
    const user = await getEmailFromToken(token)
    const isAdmin = user.userInfo.isAdmin
    if (isAdmin) {
        const itemId = event.target.dataset.id;
        console.log(itemId)
        openUpdateDialog(itemId); 
    } else {
        alert('You do not have permission to update carousel items.');
    }
}

async function handleDeleteButtonClick(event) {
    const user = await getEmailFromToken(token)
    const isAdmin = user.userInfo.isAdmin
    if (isAdmin) {
        const id = event.target.dataset.id;
        deleteItem(id)
    } else {
        alert('You do not have permission to update carousel items.');
    }
}


const updateImageDialog = document.getElementById('updateImageDialog');
const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');
const sendUpdateForm = document.getElementById('sendUpdateForm');





function openUpdateDialog(itemId) {

    updateImageDialog.dataset.id = itemId;

 
    updateImageDialog.showModal();
}


cancelUpdateBtn.addEventListener('click', () => {
    updateImageDialog.close();
});

sendUpdateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = updateImageDialog.dataset.id; 
    const title = document.getElementById('updateTitle').value;
    const description = document.getElementById('updateDescription').value;
    const url = document.getElementById('updateUrl').value;
    console.log(title,description,url)
    await updateItem(id, title, description, url);
});



async function deleteItem(id) {
    console.log(id)
    try {
        const response = await fetch(`http://localhost:3000/api/deleteImage/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        console.log(data.message);
      
        initializeCarousel();
    } catch (err) {
        console.error('Error: ', err);
    }
}   

async function updateItem(id, title, description, url) {
    try {
        const response = await fetch(`http://localhost:3000/api/updateImage/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id, title, description, url })
        });
      
        initializeCarousel();
    } catch (err) {
        console.error('Error: ', err);
    }
}

document.querySelector('.carousel-inner').addEventListener('click', (event) => {
    if (event.target.classList.contains('update-btn')) {
        handleUpdateButtonClick(event);
    } else if (event.target.classList.contains('delete-btn')) {
        handleDeleteButtonClick(event);
    }
});

async function initializeCarousel() {
    const carousel = document.getElementById('myCarousel');
    const carouselInner = carousel.querySelector('.carousel-inner');

    const items = await getCarouselItems();
    //console.log(items);

    const carouselHTML = generateCarouselHTML(items);
    //console.log(carouselHTML);

    carouselInner.innerHTML = carouselHTML;
}



async function createCarouselItem(title, description, url) {
    try {
        const response = await fetch(`http://localhost:3000/api/image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, url })
        });
        const data = await response.json();
        createImage.close();
        //console.log(data);
    } catch (err) {
        console.error('Error: ', err);
    }
}

const openDialogBtn = document.getElementById('openDialogButton');
const createImage = document.getElementById('createImageDialog');
const cancelSendBtn = document.getElementById('cancelSendBtn');
const sendEmailForm = document.getElementById('sendEmailForm');

openDialogBtn.addEventListener('click', () => {
    openDialog();
});

async function openDialog() {
    const user = await getEmailFromToken(token)
    const isAdmin = user.userInfo.isAdmin
    if (isAdmin) {
        createImage.showModal();
    } else {
        alert('You do not have permission to update carousel items.');
    }
}

cancelSendBtn.addEventListener('click', () => {
    createImage.close();
});

sendEmailForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const url = document.getElementById('url').value;
    await createCarouselItem(title, description, url);
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
initializeCarousel();
