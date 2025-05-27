const form = document.querySelector("#task-form");
const nameInput = document.querySelector("#task-input");
const listContainer = document.querySelector("#list-container");
const showFinished = document.querySelector("#show-finished");
const sort = document.querySelector("#sort");
const header = document.querySelector("#secondary-header");

let taskArr = [];
let idNum = 0;

// loads items from storage on page load
const storedArr = localStorage.getItem("taskArr");
if (storedArr) {
  showFinished.checked = localStorage.getItem("showFinished") === "true";
  sort.value = localStorage.getItem("sort");
  taskArr = JSON.parse(storedArr);
  idNum = parseInt(localStorage.getItem("taskId")) || 0;
  saveAndRender();
}

//evenlistener for submit button
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formdata = new FormData(form);
  const userInput = formdata.get("task-input");
  //returns / gives error to prevent empty list items
  if (!userInput) {
    showError("you can't submit an empty task");
    return;
  }

  //adds a new task to the array
  taskArr.push({
    name: userInput,
    //sets a timestamp for each input in isos which is required for a further down step in order to neatly display it
    timeStamp: new Date().toISOString(),
    //unique id that matches the entry's index to keep track of the tasks entry
    id: idNum++,
    finished: false,
  });
  //clears the input after you submit
  nameInput.value = "";
  saveAndRender(taskArr);
});

function showError(message) {
  const modal = document.createElement("dialog");

  const errorMsg = document.createElement("p");
  errorMsg.textContent = message;
  const closeModal = document.createElement("button");
  closeModal.textContent = "Got it";
  modal.append(errorMsg, closeModal);
  document.body.append(modal);

  modal.showModal();
  window.addEventListener("click", () => {
    modal.close();
    window.removeEventListener("click", arguments.callee);
  });
}

//eventlistener to save and rerender the list if there ever is a change
showFinished.addEventListener("change", saveAndRender);
sort.addEventListener("change", saveAndRender);

function saveAndRender() {
  //saves the state of various elements if there are any items left in the array
  //if the are none all keys gets deleted
  if (taskArr.length > 0) {
    localStorage.setItem("showFinished", showFinished.checked);
    localStorage.setItem("sort", sort.value);
    localStorage.setItem("taskArr", JSON.stringify(taskArr));
    localStorage.setItem("taskId", idNum);
  } else {
    localStorage.removeItem("showFinished");
    localStorage.removeItem("sort");
    localStorage.removeItem("taskArr");
    localStorage.removeItem("taskId");
  }
  generateList(sortAndFilter(taskArr));
}

function sortAndFilter(arr) {
  return arr
    .filter((e) => (showFinished.checked ? true : !e.finished))
    .sort((a, b) => {
      switch (sort.value) {
        case "desc": // Sort by name ascending
          return a.name.localeCompare(b.name);
        case "asc": // Sort by name descending
          return b.name.localeCompare(a.name);
        case "oldest": // Sort by timestamp ascending
          return new Date(a.timeStamp) - new Date(b.timeStamp);
        case "newest": // Sort by timestamp descending
          return new Date(b.timeStamp) - new Date(a.timeStamp);
      }
    });
}

//generates the list
function generateList(arr) {
  //removes all previous entries
  while (listContainer.firstChild) listContainer.firstChild.remove();
  arr.forEach((task) => {
    //main container
    const taskContainer = document.createElement("div");
    taskContainer.classList.add("task-container");

    //div for styling
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("container");

    //creates finished task text
    const taskDone = document.createElement("p");
    taskDone.classList.add("done");
    taskDone.textContent = "Task complete";

    //creates checkbox
    const taskFinished = document.createElement("input");
    taskFinished.type = "checkbox";
    taskFinished.checked = task.finished;
    taskFinished.classList.add("pointer");
    taskFinished.classList.add("finished-box");
    if (task.finished) taskContainer.classList.add("finished");
    //eventlistener for the checkbox for when the task is finished
    taskFinished.addEventListener("change", () => {
      task.finished = taskFinished.checked;
      saveAndRender();
    });

    //name of entry
    const taskName = document.createElement("input");
    taskName.value = task.name;
    taskName.type = "text";
    taskName.readOnly = true;
    taskName.classList.add("text");

    //edit button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-button");

    editButton.addEventListener("click", () => {
      taskName.readOnly = !taskName.readOnly;
      editButton.textContent = taskName.readOnly ? "Edit" : "Save";

      if (taskName.readOnly) {
        task.name = taskName.value;
        saveAndRender();
      } else {
        taskName.focus();
      }
    });

    //div for styling
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("container");

    //delete button
    const taskDelete = document.createElement("button");
    taskDelete.textContent = "Delete";
    taskDelete.classList.add("pointer");
    taskDelete.setAttribute("id", "delete");
    taskDelete.addEventListener("click", () => {
      //removes the the entry from the original array
      const index = taskArr.findIndex((item) => item.id === task.id);
      if (index !== -1) {
        taskArr.splice(index, 1);
        saveAndRender();
      }
    });

    // setting time in a pretty format, reason for isos format earlier. Not using isos gave wrong output
    const taskTimestamp = document.createElement("p");
    taskTimestamp.textContent = new Date(task.timeStamp).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
    taskTimestamp.classList.add("timestamp");

    //appends
    rightContainer.append(taskTimestamp, editButton, taskDelete);
    leftContainer.append(taskFinished, taskDone);
    taskContainer.append(leftContainer, taskName, rightContainer);
    listContainer.prepend(taskContainer);
  });
}
const clearAllButton = () => {
  const buttonElemenet = document.createElement("button");
  buttonElemenet.classList.add("clear-all");
  buttonElemenet.textContent = "clear all tasks";

  buttonElemenet.addEventListener("click", () => {
    taskArr = [];
    saveAndRender();
  });
  return buttonElemenet;
};

const clearButton = clearAllButton();

header.append(clearButton);
