import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";
import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// element constants
const inputFieldEl = document.getElementById("input-field");
const addButtonEl = document.getElementById("add-button");
const lists = document.querySelector(".lists");
const formEl = document.getElementById("add-to-cart-form");

// event listeners
formEl.addEventListener("click", e => e.preventDefault());

addButtonEl.addEventListener("click", handleAddToCart);


// constants
const collectionRef = collection(db, "items");

// functions
function handleAddToCart() {
    let inputValue = inputFieldEl.value;
    if (inputValue === "") return;

    addItemsInDB(inputValue);
    inputFieldEl.value = '';
};

renderItemsFromDB();

// adding items to the server
async function addItemsInDB(itemName) {
    try {
        await addDoc(collectionRef, {
            itemName,
            createdAt: serverTimestamp(),
        });

    } catch (error) {
        console.error(error);
    }
};

// getting item from the server
function renderItemsFromDB() {
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    onSnapshot(q, querySnapShot => {
        lists.innerHTML = "";

        querySnapShot.forEach(doc => {
            createListItems(doc);
        });
    });
};

function createListItems(doc) {
    const data = doc.data(), id = doc.id;

    const list = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = data.itemName;
    span.addEventListener("click", function () {

        const newText = prompt("Update this item:", data.itemName);
        if (newText) updateItemInDB(id, newText);
    });

    list.appendChild(span);
    list.appendChild(deleteButton(id));

    lists.appendChild(list);
};

async function updateItemInDB(itemId, updateText) {
    const updateRef = doc(db, "items", itemId);
    await updateDoc(updateRef, { itemName: updateText })
};

async function deleteItemInDB(itemId) {
    const deleteRef = doc(db, "items", itemId);
    await deleteDoc(deleteRef);
}

function deleteButton(itemId) {
    const button = document.createElement("button");
    button.textContent = "X";
    button.className = "delete-item"
    button.addEventListener("click", function () {
        deleteItemInDB(itemId);
    });

    return button;
}