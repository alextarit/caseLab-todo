// API маршруты jsonplaceholder
const apiRoute = {
    users: "https://jsonplaceholder.typicode.com/users",
    todos: "https://jsonplaceholder.typicode.com/todos",
};

//Получени доступа к отдельным элементам

const selectUserTodo = document.querySelector("#user-todo")
const ulTodoList = document.querySelector("#todo-list")
const newTodo = document.querySelector("#new-todo")

//Объекты в которых будем хранить полученные данные

let todosData = []
let usersData = []

window.onload = async () => {
    try {
        await getUsers();
        await getTodos();
    } catch (error) {
        alert(`Ошибка заагрузки данных: ${error.message}`);
    }
};


//Получение данных пользователей

async function getUsers() {
    if (!navigator.onLine) {
        alert("Вы оффлайн. Подключитесь к интернету, чтобы выполнить это действие.");
        return;
    }
    const response = await fetch(apiRoute.users)
    usersData = await response.json()
    usersData.forEach(user => {
        const option = document.createElement("option")
        option.value = user.id
        option.textContent = user.name
        selectUserTodo.appendChild(option)
    })
}

//Получение данных задач

async function getTodos() {
    if (!navigator.onLine) {
        alert("Вы оффлайн. Подключитесь к интернету, чтобы выполнить это действие.");
        return;
    }
    const response = await fetch(apiRoute.todos)
    todosData = await response.json()
    todosData.forEach(todo => ulTodoList.appendChild(createTodoItem(todo)))
}

//Логика создания сущности задачи

function createTodoItem(todo) {
    const li = document.createElement("li");
    li.classList.add("todo-item");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
        if (!navigator.onLine) {
            alert("Вы оффлайн. Подключитесь к интернету, чтобы выполнить это действие.");
            checkbox.checked = !checkbox.checked;
            return;
        }
        changeTodoStatus(todo.id, checkbox.checked)
            .then(() => {
                label.style.textDecoration = checkbox.checked ? "line-through" : "none";
            })
            .catch(error => {
                checkbox.checked = !checkbox.checked;
                alert(`Ошибка обновления статуса задачи: ${error.message}`);
            });
    });
    

    const label = document.createElement("label");
    label.innerText = todo.title;
    label.style.textDecoration = todo.completed ? "line-through" : "none";

    const user = usersData.find(user => user.id === todo.userId);
    const userSpan = document.createElement("span");
    userSpan.textContent = user ? ` ${user.name}` : "";
    userSpan.style.fontWeight = "bold";

    const buttonRemove = document.createElement("span");
    buttonRemove.textContent = "×";
    buttonRemove.classList.add("close");
    buttonRemove.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(userSpan);
    li.appendChild(buttonRemove);

    return li;
}

//Логика добавления задачи

async function addTodo() {
    if (!navigator.onLine) {
        alert("Вы оффлайн. Подключитесь к интернету, чтобы выполнить это действие.");
        return;
    }
    if (newTodo.value === '') {
        alert("Введите текст новой задачи");
        return;
    } else if (selectUserTodo.value === "select user") {
        alert("Выберите пользователя");
        return;
    }
    const response = await fetch(apiRoute.todos, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: newTodo.value,
            userId: Number(selectUserTodo.value),
            completed: false
        })
    })
    const todo = await response.json()
    todosData.push(todo)
    ulTodoList.insertBefore(createTodoItem(todo), ulTodoList.firstChild)
    selectUserTodo.value = "select user"
    newTodo.value = ""
}

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    addTodo().catch(error => alert(`Не получилось добавить задачу: ${error.message}`))
})

//Логика изменения статуса задачи

async function changeTodoStatus(id, completed) {
    const response = await fetch(`${apiRoute.todos}/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            completed: completed
        })
    });
    if (!response.ok) {
        throw new Error(`Ошибка обновления статуса у задачи ${id}`);
    }
}

//Логика удаления

async function deleteTodo(id) {
    if (!navigator.onLine) {
        alert("Вы оффлайн. Подключитесь к интернету, чтобы выполнить это действие.");
        return;
    }
    const response = await fetch(`${apiRoute.todos}/${id}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        const li = ulTodoList.querySelector(`li[data-id="${id}"]`);
        ulTodoList.removeChild(li);
    } else {
        throw new Error(`Ошибка удаления задачи с ${id}`);
    }
}