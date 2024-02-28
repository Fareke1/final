const token = localStorage.getItem('token');
if (token) {
    console.log('Token:', token);
} else {
    console.error('Token not found in cookie');
}


document.querySelector(".submit").addEventListener("click",  async function() {
    const user = await getEmailFromToken(token)
    const id = user.userInfo._id
    await postTask(id)
    });

document.getElementById('logout').addEventListener('click', function() {
    logout();
});

function logout() {
    localStorage.removeItem('token');
    alert('You have been signed out.');
    window.location.href = '/login/login.html';
}

document.addEventListener('DOMContentLoaded', async function() {
   
   await login()
});

async function login(){
    const user = await getEmailFromToken(token)
    const id = user.userInfo._id
    await getTasks(id);


    await getCompletedTasks(id);

}

document.querySelector(".addBtn").addEventListener("click", function() {
    addBtn();
});



document.querySelector("#cancel").addEventListener("click", function() {
    cancelBtn();
});



var mainElement = document.querySelector("main");
var myNodelist = mainElement.querySelectorAll("li");

for (var i = 0; i < myNodelist.length; i++) {
    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    myNodelist[i].appendChild(span);
}







function addBtn() {
    $('.dialog').attr('close', false);
    $('.dialog').attr('open', true);

}
async function Post (){
    const user = await getEmailFromToken(token)
    const id = user.userInfo._id
    postTask(id);
    $('.dialog').attr('close', true);
 }

function cancelBtn() {
    $('.dialog').attr('open', false)
    $('.dialog').attr('close', true)

}

async function postTask(userId) {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked');
    const isCompleted = false;

    let difficulty;
    if (selectedDifficulty) {
        difficulty = selectedDifficulty.value;
    } else {
        console.error('No difficulty selected!');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/postTask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content, difficulty, isCompleted,userId })
        });
        const data = await response.json();
        document.getElementById('postResponse').innerText = JSON.stringify(data);

        await getTasks(userId);


        await getCompletedTasks(userId);

        cancelBtn();

    } catch (error) {
        console.error('Error:', error);
    }
}

async function getTasks(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/getTask/${userId}`);
        const data = await response.json();

        const taskList = document.getElementById('myUL');
        taskList.innerHTML = '';

        const incompleteTasks = data.filter(task => !task.isCompleted);

        incompleteTasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.textContent = `Title:${task.title},  Content:${task.content},  Difficulty:${task.difficulty}`;
            const completeButton = document.createElement('button')
            completeButton.className = 'complete-button'
            completeButton.innerHTML = '<i class="fas fa-check"></i>'
            completeButton.addEventListener('click', async() => {
                await patchTask(task._id);
                await getTasks(userId);
                await getCompletedTasks(userId);
            })
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', async() => {
                await deleteTask(task._id);
                await getTasks(userId);
            });

            listItem.appendChild(deleteButton);
            listItem.appendChild(completeButton);

            taskList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function getCompletedTasks(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/getCompletedTask/${userId}`);
        const completedTasks = await response.json();

        const taskList = document.getElementById('completedUL');
        taskList.innerHTML = '';

        completedTasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.textContent = `Title: ${task.title}, Content: ${task.content}, Difficulty: ${task.difficulty}`;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', async() => {
                await deleteTask(task._id);
                await getCompletedTasks(userId);
            });

            listItem.appendChild(deleteButton);

            taskList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}




async function deleteTask(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/deleteTask/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function patchTask(id, isCompleted) {
    try {
        const response = await fetch(`http://localhost:3000/api/patchTask/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isCompleted })
        });

    } catch (error) {
        console.error('Error updating task:', error);
    }
}

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