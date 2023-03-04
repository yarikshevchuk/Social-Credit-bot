const BinarySearchTree = require("../dataStructures/binarySearchTree");

let chatsTree;

async function createChatsTree(chats) {
  let BST = new BinarySearchTree();

  for (let i = 0; i < chats.length; i++) {
    BST.insert(chats[i]);
  }

  return BST;
}

module.exports = {
  get: async () => chatsTree,
  set: async (newChats) => {
    return (chatsTree = createChatsTree(newChats));
  },
};
