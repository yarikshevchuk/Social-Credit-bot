const UserModel = require("../models/userModel");
const ChatModel = require("../models/chatModel");
const BinarySearchTree = require("../dataStructures/binarySearchTree");

let usersTree;
let chatsTree;

async function setUsersTree() {
  const users = await UserModel.find({});
  let BST = new BinarySearchTree();

  for (let i = 0; i < users.length; i++) {
    BST.insert(users[i]);
  }

  usersTree = BST;
}

async function setChatsTree() {
  const chats = await ChatModel.find({});
  let BST = new BinarySearchTree();

  for (let i = 0; i < chats.length; i++) {
    BST.insert(chats[i]);
  }

  chatsTree = BST;
}

setUsersTree();
setChatsTree();

module.exports = {
  usersTree,
  chatsTree,
  setUsersTree,
  setChatsTree,
};
