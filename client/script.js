document.querySelector("#typeField").addEventListener('change', () => {
    if (document.querySelector("#typeField").value === "other") {
        document.querySelector("#otherContainer").style.display = "block";
    } else {
        document.querySelector("#otherContainer").style.display = "none";
    }
});

document.querySelector("#getTypeField").addEventListener('change', () => {
    if (document.querySelector("#getTypeField").value === "other") {
        document.querySelector("#getOtherContainer").style.display = "block";
    } else {
        document.querySelector("#getOtherContainer").style.display = "none";
    }
});

document.querySelector("#editTableButton").addEventListener('click', () => {
    let button = document.querySelector("#editTableButton");
    let table = document.querySelector("table");

    // enable editing of table
    if (button.innerHTML === "Edit Table") {
        // skip header
        for (let i = 1; i < table.rows.length; i++) {
            table.rows[i].setAttribute("contenteditable", true);
        }
        button.innerHTML = "Save Changes";
    }
    // send data back to server 
    else {
        // skip header
        for (let i = 1; i < table.rows.length; i++) {
            let newData = {};
            let cells = table.rows[i].children;
            // temporarily remove status dropDown
            let statusBlock = table.rows[i].querySelector(".rowDropDownWrapper");
            table.rows[i].children[0].removeChild(table.rows[i].querySelector(".rowDropDownWrapper"));

            newData.name = cells[0].innerText;
            newData.type = cells[1].innerText;
            newData.year = cells[2].innerText;
            // allow both image copying and url
            newData.image = cells[3].querySelector("img") === null
                && cells[3].innerText || cells[3].querySelector("img").src;
            newData.status = statusBlock.querySelector("select").value;
            newData.uniqueid = table.rows[i].id;

            // re-attach dropDown
            table.rows[i].appendChild(statusBlock);
            console.log(cells);
            console.log(newData);

            updateRow(newData);

            table.rows[i].setAttribute("contenteditable", false);
        }

        button.innerHTML = "Edit Table";
    }
});

document.querySelector("#nameHeader").addEventListener('click', () => {
    sortContent(0);
});
document.querySelector("#typeHeader").addEventListener('click', () => {
    sortContent(1);
});
document.querySelector("#yearHeader").addEventListener('click', () => {
    sortContent(2);
});
document.querySelector("#imageHeader").addEventListener('click', () => {
    sortContent(3);
});
document.querySelector("#statusHeader").addEventListener('click', () => {
    sortContent(4);
});

document.querySelector("#statusField").addEventListener('change', () => {
    let select = document.querySelector("#statusField");
    select.style.backgroundColor = window.getComputedStyle(select.options[select.selectedIndex]).backgroundColor;
});

function updateRow(newData) {
    // create Ajax
    const xhr = new XMLHttpRequest();
    xhr.open('post', '/updateContent');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');

    // Handle response once we receive it, and parse it
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

    // Handle response once we receive it, and parse it
    xhr.onload = () => handleResponse(xhr, false, false, true);

    const data = `uniqueid=${uniqueid}`;
    // Send Request
    xhr.send(data);

    // prevent default browser behavior
    return false;
}

// used W3 for reference algo https://www.w3schools.com/howto/howto_js_sort_table.asp
// column is number, order is string
function sortContent(column) {
    const table = document.querySelector("table");
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
                if (column == 2) {
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
                else if (column == 4) {

                    // get the statuses
                    previousRow = rows[i - 1];
                    currentRow = rows[i];
                    let previousStatus = "";
                    if (previousRow.className.includes("wishList")) {
                        previousStatus = "wishList";
                    } else if (previousRow.className.includes("inProgress")) {
                        previousStatus = "inProgress";
                    } else if (previousRow.className.includes("complete")) {
                        previousStatus = "complete";
                    }
                    let currentStatus = "";
                    if (currentRow.className.includes("wishList")) {
                        currentStatus = "wishList";
                    } else if (currentRow.className.includes("inProgress")) {
                        currentStatus = "inProgress";
                    } else if (currentRow.className.includes("complete")) {
                        currentStatus = "complete";
                    }

                    // ascending order
                    if (direction === "ascending" && previousStatus > currentStatus) {
                        switchRows = true;
                        break;
                        //descending order
                    }
                    else if (direction === "descending" && previousStatus < currentStatus) {
                        switchRows = true;
                        break;
                    }
                }
                // sort by string
                else {
                    // ascending order
                    if (direction === "ascending" && previousRow.innerHTML.toLowerCase() > currentRow.innerHTML.toLowerCase()) {
                        console.log("sort ascending");
                        switchRows = true;
                        break;
                        //descending order
                    }
                    else if (direction === "descending" && previousRow.innerHTML.toLowerCase() < currentRow.innerHTML.toLowerCase()) {
                        console.log("sort descending");
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
            } else if (switchCount === 0 && direction == "ascending") {
                // nothing to sort in ascending order, so try descending order
                direction = "descending";
                sorting = true;
            }
        }
    }
}

function filterRows(type, status) {
    let table = document.querySelector("table");

    // skip header
    for (let i = 1; i < table.rows.length; i++) {
        console.log(type);
        const rowType = table.rows[i].cells[1].innerHTML.toLowerCase().trim();
        const rowStatus = table.rows[i].className.includes(status);
        // all visible
        if (type == "all" && status == "all") {
            table.rows[i].style.display = "table-row";
        } // enable rows of type with corresponding status
        else if (rowType === type.toLowerCase() && (rowStatus || status == "all")) {
            table.rows[i].style.display = "table-row";
        } // enable rows of status with corresponding type
        else if (rowStatus && (rowType === type.toLowerCase() || type == "all")) {
            table.rows[i].style.display = "table-row";
        } // don't show
        else {
            table.rows[i].style.display = "none";
        }
    }
}

let nextIndex = 0;
// Function that handles response sent back from server
const handleResponse = (xhr, shouldDisplay, update, remove) => {
    const content = document.querySelector("#content");
    let table = document.querySelector("table");
    console.log(xhr.status);

    if (shouldDisplay) {
        // Note - empty for 204
        const obj = JSON.parse(xhr.response);
        console.log(obj);

        // display message
        let tableRows = [];
        // create response # of rows
        Object.keys(obj).forEach((element) => {
            let tr = document.createElement("tr");
            tr.id = element;
            // fill each row with 4 columns of parsed data
            for (let j = 0; j < 5; j++) {
                // only change color
                if (j === 4) {
                    tr.className += " " + Object.values(obj[element])[j];
                }
                // build a cell
                else {
                    let tableData = document.createElement("td");
                    if (j === 3) {
                        tableData.innerHTML = Object.values(obj[element])[j] === "N/A"
                            && Object.values(obj[element])[j]
                            || `<img src="${Object.values(obj[element])[j]}" alt="${Object.values(obj[element])[0]}" class="tableImg">`;
                    } else {
                        tableData.innerHTML = Object.values(obj[element])[j];
                        // also add a dropdown
                        if (j === 0) {
                            let div = document.createElement('div');
                            div.className = "rowDropDownWrapper";

                            let select = document.querySelector("#statusField").cloneNode(true);
                            select.querySelectorAll("option").forEach(function (option) {
                                option.selected = option.value == Object.values(obj[element])[4] && true || false;
                            });
                            select.className = "rowDropDown";
                            select.id = "";
                            select.addEventListener('change', function () {
                                // don't fire if editing table
                                if (document.querySelector("#editTableButton").innerHTML === "Edit Table") {
                                    console.log('this: ' + this);
                                    let newData = {};
                                    let row = document.getElementById(`${element}`);
                                    let cells = row.children;

                                    newData.name = cells[0].getAttribute("serverData");
                                    newData.type = cells[1].getAttribute("serverData");
                                    newData.year = cells[2].getAttribute("serverData");
                                    newData.image = cells[3].getAttribute("serverData");
                                    newData.status = this.value;
                                    newData.uniqueid = row.id;

                                    console.log(cells);
                                    console.log(newData);

                                    updateRow(newData);
                                }

                            });

                            div.appendChild(select);

                            console.log(div);
                            tableData.appendChild(div);
                        }
                    }
                    tableData.setAttribute("serverData", Object.values(obj[element])[j]);
                    tr.appendChild(tableData);
                }
            }
            let container = document.createElement("div");
            container.className = "deleteButtonContainer";

            let deleteButton = document.createElement("button");
            deleteButton.innerText = "Delete Entry";
            deleteButton.className = "deleteButton";
            deleteButton.addEventListener('click', function () {
                deleteRow(this.parentElement.parentElement.getAttribute("id"));
            });
            container.appendChild(deleteButton);
            tr.appendChild(container);

            // attach edit and 
            //attach each row to the table
            table.appendChild(tr);

            if (element + 1 > nextIndex) {
                nextIndex = element + 1;
                console.log("updated next index");
            }
        });
        const getTypeField = document.querySelector('#getTypeField');
        const getTypeValue = getTypeField.value === "other" && document.querySelector("#getOtherField").value || getTypeField.value;
        filterRows(getTypeValue, document.querySelector('#getStatusField').value);
    } else if (update) {
        const obj = JSON.parse(xhr.response);
        let tr = document.getElementById(`${obj.uniqueid}`);
        const dropDown = tr.querySelector(".rowDropDown");
        tr.innerHTML = "";

        // fill each row with 4 columns of parsed data
        for (let j = 0; j < Object.keys(obj).length - 1; j++) {
            // only change color
            if (j === 4) {
                tr.className = " " + Object.values(obj)[j];
            }
            // build a cell
            else {
                let tableData = document.createElement("td");
                if (j === 3) {
                    tableData.innerHTML = Object.values(obj)[j] === "N/A"
                        && Object.values(obj)[j]
                        || `<img src="${Object.values(obj)[j]}" alt="${Object.values(obj)[0]}" class="tableImg">`;
                } else {
                    tableData.innerHTML = Object.values(obj)[j];
                    // also add a dropdown
                    if (j === 0) {
                        let div = document.createElement('div');
                        div.className = "rowDropDownWrapper";

                        div.appendChild(dropDown);

                        console.log(div);
                        tableData.appendChild(div);
                    }
                }
                tableData.setAttribute("serverData", Object.values(obj)[j]);
                tr.appendChild(tableData);
            }
        }
        let container = document.createElement("div");
        container.className = "deleteButtonContainer";

        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete Entry";
        deleteButton.className = "deleteButton";
        deleteButton.addEventListener('click', function () {
            deleteRow(this.parentElement.parentElement.getAttribute("id"));
        });

        container.appendChild(deleteButton);
        tr.appendChild(container);

    } else if (remove) {
        const obj = JSON.parse(xhr.response);
        table.removeChild(document.getElementById(`${obj.uniqueid}`));
    }
};
// Send Request function for adding a form
const sendPOST = (e, form) => {
    // create Ajax
    const xhr = new XMLHttpRequest();
    xhr.open(form.getAttribute('method'), form.getAttribute('action'));
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', 'application/json');

    // Handle response once we receive it, and parse it
    xhr.onload = () => handleResponse(xhr, false, false, false);

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

    // prevent default browser behavior
    e.preventDefault();
    return false;
};
//Send request function for getUsers
const requestUpdate = (e, form) => {
    const xhr = new XMLHttpRequest();
    const method = 'get';
    const url = '/getContent?index=' + nextIndex;
    console.log(url);
    xhr.open(method, url);
    xhr.setRequestHeader('Accept', 'application/json');

    if (method == 'get') {
        xhr.onload = () => handleResponse(xhr, true, false, false);
    } else {
        xhr.onload = () => handleResponse(xhr, false, false, false);
    }

    xhr.send();

    e.preventDefault();
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
    const getListener = (e) => requestUpdate(e, getContentForm);

    // Set DOM listeners
    addContentForm.addEventListener('submit', addListener);
    getContentForm.addEventListener('submit', getListener);
};
window.onload = init;