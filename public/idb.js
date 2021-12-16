let db;

//create new db request for the db called 'budget'
//set version to 1
const request = indexedDB.open('budget_tracker', 1);

// event triggers when the db version changes and saves a reference to the db
request.onupgradeneeded = function(event) {
    
    const db = event.target.result;
      // create object store 'pending' and set  to autoIncrement
    db.createObjectStore('pending', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
      checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(event.target.error.message);
};

//function executed when submitting new transaction with no inernet connentivity
function saveRecord(record) {
    
    const db = request.result;
    
    // new transaction with read/write access
    const transaction = db.transaction(["pending"], "readwrite");
    
    // access to pending object store
    const store = transaction.objectStore("pending");

    // add record to store
    store.add(record);
};

function checkDatabase() {
    
    const db = request.result;

    // open a transaction on pending db
    const transaction = db.transaction(["pending"], "readwrite");

    // access your pending object store
    const store = transaction.objectStore("pending");

    // get all records and set to variable 
    const getAll = store.getAll();
    
    getAll.onsuccess = function () {
        // look for data in indexedDb store and send it to the api server
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
            .then((response) => response.json())
            .then(() => {
         
                const db = request.result;

                const transaction = db.transaction(["pending"], "readwrite");
           
                const store = transaction.objectStore("pending");
                
                // clear all items
                store.clear();
            });
        }
    };
}
  // listen for app to come back online
  window.addEventListener("online", checkDatabase);