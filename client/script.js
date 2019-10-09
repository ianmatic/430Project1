let nextIndex = 0;

// toggle ability to type in other field in add
document.querySelector("#typeField").addEventListener('change', () => {
    const otherField = document.querySelector("#otherField");
    if (document.querySelector("#typeField").value === "other") {
        otherField.disabled = false;
    } else {
        otherField.disabled = true;
    }
});
// toggle ability to type in other field in get
document.querySelector("#getTypeField").addEventListener('change', () => {
    const getOtherField = document.querySelector("#getOtherField");
    if (document.querySelector("#getTypeField").value === "other") {
        getOtherField.disabled = false;
    } else {
        getOtherField.disabled = true;
    }
});

// enable clicking on headers to sort
document.querySelector("#statusHeader").addEventListener('click', () => {
    sortContent(0);
});
document.querySelector("#nameHeader").addEventListener('click', () => {
    sortContent(1);
});
document.querySelector("#typeHeader").addEventListener('click', () => {
    sortContent(2);
});
document.querySelector("#yearHeader").addEventListener('click', () => {
    sortContent(3);
});
document.querySelector("#imageHeader").addEventListener('click', () => {
    sortContent(4);
});

// change color of selects to selected status
document.querySelector("#statusField").addEventListener('change', () => {
    let select = document.querySelector("#statusField");
    select.style.backgroundColor = window.getComputedStyle(select.options[select.selectedIndex]).backgroundColor;
});
document.querySelector("#getStatusField").addEventListener('change', () => {
    let select = document.querySelector("#getStatusField");
    if (select.value === "All") {
        select.style.backgroundColor = "#fff";
    } else {
        select.style.backgroundColor = window.getComputedStyle(select.options[select.selectedIndex]).backgroundColor;
    }
});

// enable editing / update database
document.querySelector("#editTableButton").addEventListener('click', () => {
    let button = document.querySelector("#editTableButton");
    let table = document.querySelector("#contentTable");
    const submitButton = document.querySelector("#addSubmitButton");

    // enable editing of table
    if (button.innerHTML === "Edit Table") {
        // skip header
        for (let i = 1; i < table.rows.length; i++) {
            table.rows[i].setAttribute("contenteditable", true);
        }
        // show delete buttons
        document.querySelectorAll(".deleteButtonContainer").forEach(function (element) {
            element.style.visibility = "visible";
            element.style.opacity = "1";
        });

        button.innerHTML = "Save Changes";
        submitButton.style.color = "black";
        submitButton.className = "btn btn-secondary";
    }
    else {
        // remove any undesired rows
        let rows = table.querySelector("tbody").querySelectorAll("tr");
        rows.forEach(function (row) {
            if (row.querySelector(".deleteButton").className.includes("marked")) {
                table.querySelector('tbody').removeChild(row);
                deleteRow(row.getAttribute("id"));
            }
        });

        // send data back to server 
        // skip header
        for (let i = 1; i < table.rows.length; i++) {
            let newData = {};
            let cells = table.rows[i].children;
            // temporarily remove status dropDown
            let statusBlock = table.rows[i].querySelector(".rowDropDownWrapper");
            table.rows[i].children[0].removeChild(table.rows[i].querySelector(".rowDropDownWrapper"));

            // setup new data
            newData.status = statusBlock.querySelector("ul").getAttribute("value");
            newData.name = cells[1].innerText;
            newData.type = cells[2].innerText;
            newData.year = cells[3].innerText;
            // allow both image copying and url
            newData.image = cells[4].querySelector("img") === null
                ? cells[4].innerText : cells[4].querySelector("img").src;
            newData.uniqueid = table.rows[i].id;

            // re-attach dropDown
            table.rows[i].appendChild(statusBlock);

            updateRow(newData);

            table.rows[i].setAttribute("contenteditable", false);
        }

        // hide delete buttons
        document.querySelectorAll(".deleteButtonContainer").forEach(function (element) {
            element.style.visibility = "hidden";
            element.style.opacity = "0";
        });

        button.innerHTML = "Edit Table";
        submitButton.className = "btn btn-outline-primary";
        submitButton.style.color = null;
    }
});

function updateRow(newData) {
    // create Ajax
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/updateContent');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');

    // Handle response once we receive it by updating the row
    xhr.onload = () => handleResponse(xhr, false, true, false);

    const data = `name=${newData.name.trim()}
                      &type=${newData.type.trim()}
                      &year=${newData.year.trim()}
                      &image=${newData.image.trim()}
                      &status=${newData.status.trim()}
                      &uniqueid=${newData.uniqueid}`;
    // Send Request
    xhr.send(data);

    // prevent default browser behavior
    return false;
}

function deleteRow(uniqueid) {
    // create Ajax
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/removeContent');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');

    // Handle response once we receive it by removing the row
    xhr.onload = () => handleResponse(xhr, false, false, true);

    const data = `uniqueid=${uniqueid}`;
    // Send Request
    xhr.send(data);

    // prevent default browser behavior
    return false;
}

// used W3 for reference algo https://www.w3schools.com/howto/howto_js_sort_table.asp
// column is number
function sortContent(column) {
    const table = document.querySelector("#contentTable");
    // sort only if multiple rows (not including header row)
    if (table.rows.length > 2) {
        let rows, i, switchRows;

        let switchCount = 0;
        let sorting = true;
        let direction = "ascending";

        // loop until no more sorting
        while (sorting) {
            sorting = false;
            rows = table.rows;

            // check each row (0 is undefined for prev and 1 is header for prev)
            for (i = 2; i < rows.length; i++) {

                switchRows = false;
                let previousRow = rows[i - 1].querySelectorAll("td")[column];
                let currentRow = rows[i].querySelectorAll("td")[column];

                // sort by number
                if (column == 3) {
                    // ascending order
                    if (direction === "ascending" && Number(previousRow.innerHTML) > Number(currentRow.innerHTML)) {
                        switchRows = true;
                        break;
                        //descending order
                    }
                    else if (direction === "descending" && Number(previousRow.innerHTML) < Number(currentRow.innerHTML)) {
                        switchRows = true;
                        break;
                    }
                }
                // sort by status
                else if (column == 0) {
                    // ascending order
                    if (direction === "ascending" && previousRow.getAttribute("serverData")
                        > currentRow.getAttribute("serverData")) {
                        switchRows = true;
                        break;
                        //descending order
                    }
                    else if (direction === "descending" && previousRow.getAttribute("serverData")
                        < currentRow.getAttribute("serverData")) {
                        switchRows = true;
                        break;
                    }
                }
                // sort by string
                else {
                    // ascending order
                    if (direction === "ascending" && previousRow.innerHTML.toLowerCase() > currentRow.innerHTML.toLowerCase()) {
                        switchRows = true;
                        break;
                        //descending order
                    }
                    else if (direction === "descending" && previousRow.innerHTML.toLowerCase() < currentRow.innerHTML.toLowerCase()) {
                        switchRows = true;
                        break;
                    }
                }
            }

            // prev is bigger, so move curr to before prev (swap spots)
            if (switchRows) {
                rows[i - 1].parentNode.insertBefore(rows[i], rows[i - 1]);
                // haven't finished sorting, so keep looping
                sorting = true;
                switchCount++;
            } else if (switchCount === 0 && direction == "ascending") { // nothing to sort in ascending order, so try descending order
                direction = "descending";
                sorting = true;
            }
        }
    }
}

// filter the displayed rows based on type and status
function filterRows(type, status) {

    let tableBody = document.querySelector("#contentTable").querySelector("tbody");
    for (let i = 0; i < tableBody.rows.length; i++) {
        const rowType = tableBody.rows[i].cells[2].getAttribute("serverData").trim().toLowerCase();
        const rowStatus = tableBody.rows[i].cells[0].getAttribute("serverData").trim().toLowerCase();
        // all visible
        if (type == "all" && status == "all") {
            tableBody.rows[i].style.display = "table-row";
        } // enable rows of type with corresponding status
        else if (rowType === type && (rowStatus === status || status == "all")) {
            tableBody.rows[i].style.display = "table-row";
        } // enable rows of status with corresponding type
        else if (rowStatus === status && (rowType === type || type == "all")) {
            tableBody.rows[i].style.display = "table-row";
        } // don't show
        else {
            tableBody.rows[i].style.display = "none";
        }
    }
}
// Function that handles response sent back from server
const handleResponse = (xhr, add, update, remove) => {
    const content = document.querySelector("#content");
    let table = document.querySelector("#contentTable");
    console.log(xhr.status);

    // add content
    if (add) {
        // Note - empty for 204
        const obj = JSON.parse(xhr.response);

        // display message
        let tableRows = [];
        // create response # of rows
        Object.keys(obj).forEach((element) => {
            let tr = document.createElement("tr");
            tr.id = element;
            // fill each row with 5 columns of parsed data
            for (let j = 0; j < 5; j++) {
                // build a cell
                let tableData = document.createElement("td");
                tableData.className = "dataCell";
                // only change color
                if (j === 0) {
                    tableData.className = Object.values(obj[element])[j];
                    tableData.className += " statusColumn";

                    // also add a dropdown
                    let div = document.createElement('div');
                    div.className = "rowDropDownWrapper dropdown";
                    let dropdown = document.createElement("button");
                    dropdown.className = "rowDropDown btn btn-secondary dropdown-toggle " + Object.values(obj[element])[j];
                    dropdown.setAttribute("type", "button");
                    dropdown.setAttribute("data-toggle", "dropdown");
                    dropdown.id = "";

                    // create ul with li for dropdown
                    let options = document.createElement("ul");
                    options.setAttribute("value", Object.values(obj[element])[j]);
                    options.className += " dropdown-menu";

                    let wishList = document.createElement("li");
                    wishList.innerText = "Wish List";
                    wishList.className += " wishList dropdown-item";
                    wishList.setAttribute("value", "wishList");
                    options.appendChild(wishList);

                    let inProgress = document.createElement("li");
                    inProgress.innerText = "In Progress";
                    inProgress.className += " inProgress dropdown-item";
                    inProgress.setAttribute("value", "inProgress");
                    options.appendChild(inProgress);

                    let complete = document.createElement("li");
                    complete.innerText = "Complete";
                    complete.className += " complete dropdown-item";
                    complete.setAttribute("value", "complete");
                    options.appendChild(complete);

                    // update table when changing status
                    options.querySelectorAll("li").forEach(function (option) {
                        option.addEventListener('click', function () {
                            // update button parent visuals
                            this.parentElement.setAttribute("value", this.getAttribute("value"));
                            this.parentElement.parentElement.querySelector("button").className = "rowDropDown btn btn-secondary dropdown-toggle " + this.getAttribute("value");
                            // don't fire if editing table
                            if (document.querySelector("#editTableButton").innerHTML === "Edit Table") {
                                let newData = {};
                                let row = document.getElementById(`${element}`);
                                let cells = row.children;

                                newData.status = this.getAttribute("value");
                                newData.name = cells[1].getAttribute("serverData");
                                newData.type = cells[2].getAttribute("serverData");
                                newData.year = cells[3].getAttribute("serverData");
                                newData.image = cells[4].getAttribute("serverData");
                                newData.uniqueid = row.id;

                                updateRow(newData);
                            }
                        });
                    });
                    div.appendChild(dropdown);
                    div.appendChild(options);

                    tableData.appendChild(div);
                }
                else if (j === 4) { // handle image
                    tableData.innerHTML = Object.values(obj[element])[j].trim() === ""
                        && Object.values(obj[element])[j]
                        || `<img src="${Object.values(obj[element])[j]}" alt="${Object.values(obj[element])[1]}" class="tableImg">`;
                } else { // handle text
                    tableData.innerHTML = Object.values(obj[element])[j];
                }
                tableData.setAttribute("serverData", Object.values(obj[element])[j]);
                tr.appendChild(tableData);
            }
            let container = document.createElement("div");
            container.className = "deleteButtonContainer";

            // create temp to attach text based icon element to
            let temp = document.createElement("div");
            temp.innerHTML = `<i class="fas fa-trash"></i>`;

            // create trashcan/delete button
            let deleteButton = temp.firstChild;
            deleteButton.className += " deleteButton";
            deleteButton.addEventListener('click', function () {
                // unmark row
                if (this.className.includes("marked")) {
                    this.classList.remove("marked");
                } // mark row
                else {
                    this.className += " marked";
                }
            });
            container.appendChild(deleteButton);
            tr.appendChild(container);

            //attach each row to the table
            table.querySelector("tbody").appendChild(tr);

            // since we added a new element, update nextIndex
            if (element + 1 > nextIndex) {
                nextIndex = element + 1;
            }
        });
        const getTypeField = document.querySelector('#getTypeField');
        const getTypeValue = getTypeField.value === "other" && document.querySelector("#getOtherField").value || getTypeField.value;
        filterRows(getTypeValue.toLowerCase(), document.querySelector('#getStatusField').value.toLowerCase());
    } else if (update) {
        const obj = JSON.parse(xhr.response);
        let tr = document.getElementById(`${obj.uniqueid}`);
        const dropDown = tr.querySelector(".rowDropDownWrapper");
        tr.innerHTML = "";

        // fill each row with columns of parsed data
        for (let j = 0; j < Object.keys(obj).length - 1; j++) {
            // build a cell
            let tableData = document.createElement("td");
            tableData.className = "dataCell";
            // only change color
            if (j === 0) {
                tableData.className = " " + Object.values(obj)[j];
                tableData.className += " statusColumn";

                // also add a dropdown
                dropDown.querySelector("button").className = "rowDropDown btn btn-secondary dropdown-toggle " + Object.values(obj)[j];
                tableData.appendChild(dropDown);
            }
            else if (j === 4) { // handle img
                tableData.innerHTML = Object.values(obj)[j].trim() === ""
                    && Object.values(obj)[j]
                    || `<img src="${Object.values(obj)[j]}" alt="${Object.values(obj)[1]}" class="tableImg">`;
            } else { // handle text
                tableData.innerHTML = Object.values(obj)[j];
            }
            tableData.setAttribute("serverData", Object.values(obj)[j]);
            tr.appendChild(tableData);

        }
        let container = document.createElement("div");
        container.className = "deleteButtonContainer";

        // create temp to attach text based icon element to
        let temp = document.createElement("div");
        temp.innerHTML = `<i class="fas fa-trash"></i>`;

        // create trashcan/delete button
        let deleteButton = temp.firstChild;
        deleteButton.className += " deleteButton";
        deleteButton.addEventListener('click', function () {
            // unmark row
            if (this.className.includes("marked")) {
                this.classList.remove("marked");
            } // mark row
            else {
                this.className += " marked";
            }
        });

        container.appendChild(deleteButton);
        tr.appendChild(container);

    } else if (remove) { // remove row from table
        const obj = JSON.parse(xhr.response);
        // removed if it hasn't already been removed in updating 
        if (document.getElementById(`${obj.uniqueid}`)) {
            table.querySelector("tbody").removeChild(document.getElementById(`${obj.uniqueid}`));
        }
    }
};
// Send Request function for adding a form
const sendPOST = (e, form) => {
    // only send if not editing
    if (document.querySelector("#editTableButton").innerHTML === "Edit Table") {
        // create Ajax
        const xhr = new XMLHttpRequest();
        xhr.open(form.getAttribute('method'), form.getAttribute('action'));
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('Accept', 'application/json');

        // Handle response once we receive it, and parse it
        //xhr.onload = () => handleResponse(xhr, false, false, false);
        xhr.onload = (e) => requestUpdate(e);

        const typeField = form.querySelector('#typeField');

        // if other is selected, use other, otherwise use type
        const typeValue = typeField.value === "other" && form.querySelector("#otherField").value || typeField.value;
        const data = `name=${form.querySelector('#nameField').value.trim()}
                  &type=${typeValue.trim()}
                  &year=${form.querySelector('#yearField').value.trim()}
                  &image=${form.querySelector('#imageField').value.trim()}
                  &status=${form.querySelector('#statusField').value.trim()}`;
        // Send Request
        xhr.send(data);
    } else {
        alert("Please save your changes before adding more media");
    }
    // prevent default browser behavior
    e.preventDefault();
    return false;
};
//Send request function for getUsers
const requestUpdate = (e) => {
    const xhr = new XMLHttpRequest();
    const method = 'get';
    const url = '/getContent?index=' + nextIndex;
    xhr.open(method, url);
    xhr.setRequestHeader('Accept', 'application/json');

    if (method == 'get') {
        xhr.onload = () => handleResponse(xhr, true, false, false);
    } else { // don't display head method
        xhr.onload = () => handleResponse(xhr, false, false, false);
    }

    xhr.send();

    if (e) {
        e.preventDefault();
    }
    return false;
};


// Get Forms and setup listeners
const init = () => {
    // set color of status select on startup
    let select = document.querySelector("#statusField");
    select.style.backgroundColor = window.getComputedStyle(select.options[select.selectedIndex]).backgroundColor;


    // Get DOM elements
    const addContentForm = document.querySelector('#addForm');
    const getContentForm = document.querySelector('#getForm');

    // Set DOM on submit functions
    const addListener = (e) => sendPOST(e, addContentForm);
    const getListener = (e) => requestUpdate(e);

    // Set DOM listeners
    addContentForm.addEventListener('submit', addListener);
    getContentForm.addEventListener('submit', getListener);

    requestUpdate();
};
window.onload = init;