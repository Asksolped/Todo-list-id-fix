const form = document.querySelector("#task-form");
const nameInput = document.querySelector("#task-input");
const listContainer = document.querySelector("#list-container");
const showFinished = document.querySelector("#show-finished");
const sort = document.querySelector("#sort");

let mediaArr = [];
let idNum = 0;

// loads items from storage on page load
const storedArr = localStorage.getItem("mediaArr");
if (storedArr) {
  showFinished.checked = localStorage.getItem("showFinished") === "true";
  sort.value = localStorage.getItem("sort");
  mediaArr = JSON.parse(storedArr);
  idNum = parseInt(localStorage.getItem("mediaId"));
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

  //adds one to priority to all existing media so new media is always displayed on top unless ordering specifices otherwise
  mediaArr.forEach((media) => media.priority++);
  //adds a new media to the array
  mediaArr.push({
    name: userInput,
    //sets a timestamp for each input in isos which is required for a further down step in order to neatly display it
    timeStamp: new Date().toISOString(),
    //unique id that matches the entry's index to keep track of the tasks entry
    id: idNum++,
    finished: false,
  });
  //clears the input after you submit
  nameInput.value = "";
  saveAndRender(mediaArr);
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
  if (mediaArr.length > 0) {
    localStorage.setItem("showFinished", showFinished.checked);
    localStorage.setItem("sort", sort.value);
    localStorage.setItem("mediaArr", JSON.stringify(mediaArr));
    localStorage.setItem("mediaId", idNum);
  } else {
    localStorage.removeItem("showFinished");
    localStorage.removeItem("sort");
    localStorage.removeItem("mediaArr");
    localStorage.removeItem("mediaId");
  }
  generateList(sortAndFilter(mediaArr));
}

function sortAndFilter(arr) {
  return arr
    .filter((e) => (showFinished.checked ? true : !e.finished))
    .sort((a, b) => {
      switch (sort.value) {
        case "asc": // Sort by name ascending
          return a.name.localeCompare(b.name);
        case "desc": // Sort by name descending
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
  arr.forEach((media) => {
    //main container
    const mediaContainer = document.createElement("div");
    mediaContainer.classList.add("media-container");

    //div for styling
    const leftContainer = document.createElement("div");
    leftContainer.classList.add("container");

    //creates checkbox
    const mediaFinished = document.createElement("input");
    mediaFinished.type = "checkbox";
    mediaFinished.checked = media.finished;
    mediaFinished.classList.add("pointer");
    mediaFinished.classList.add("finished-box");
    if (media.finished) mediaContainer.classList.add("finished");
    //eventlistener for the checkbox for when the media is finished
    mediaFinished.addEventListener("change", () => {
      media.finished = mediaFinished.checked;
      saveAndRender();
    });

    //name of entry
    const mediaName = document.createElement("input");
    mediaName.value = media.name;
    mediaName.type = "text";
    mediaName.readOnly = true;
    mediaName.classList.add("text");

    //edit button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-button");

    editButton.addEventListener("click", () => {
      mediaName.readOnly = !mediaName.readOnly;
      editButton.textContent = mediaName.readOnly ? "Edit" : "Save";

      if (mediaName.readOnly) {
        media.name = mediaName.value;
        saveAndRender();
      } else {
        mediaName.focus();
      }
    });

    //div for styling
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("container");

    //delete button
    const mediaDelete = document.createElement("button");
    mediaDelete.textContent = "Delete";
    mediaDelete.classList.add("pointer");
    mediaDelete.addEventListener("click", () => {
      //removes the the entry from the original array
      const index = mediaArr.findIndex((item) => item.id === media.id);
      if (index !== -1) {
        mediaArr.splice(index, 1);
        saveAndRender();
      }
    });
    ("");

    // setting time in a pretty format, reason for isos format earlier. Not using isos gave wrong output
    const mediaTimestamp = document.createElement("p");
    mediaTimestamp.textContent = new Date(media.timeStamp).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
    mediaTimestamp.classList.add("timestamp");

    //appends
    rightContainer.append(mediaTimestamp, mediaDelete, editButton);
    leftContainer.append(mediaFinished);
    mediaContainer.append(leftContainer, mediaName, rightContainer);
    listContainer.prepend(mediaContainer);
  });
}
