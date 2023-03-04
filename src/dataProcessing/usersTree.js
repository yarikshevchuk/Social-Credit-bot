const BinarySearchTree = require("../dataStructures/binarySearchTree");

let usersTree;

async function createUsersTree(users) {
  let BST = new BinarySearchTree();

  for (let i = 0; i < users.length; i++) {
    BST.insert(users[i]);
  }

  return BST;
}

module.exports = {
  get: async () => usersTree,
  set: async (newUsers) => {
    return (usersTree = createUsersTree(newUsers));
  },
};
