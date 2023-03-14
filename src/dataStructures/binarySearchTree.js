class Node {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

module.exports = class BinarySearchTree {
  constructor() {
    this.root = null;
    this.size = 0;
  }

  insert(data) {
    const newNode = new Node(data);

    if (this.root === null) {
      this.root = newNode;
      this.size = this.size + 1;
    } else {
      this.insertNode(this.root, newNode);
      this.size = this.size + 1;
    }
  }

  insertNode(node, newNode) {
    if (newNode.data._id < node.data._id) {
      if (node.left === null) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (node.right === null) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }

  find(data, node) {
    console.log(`Id: ${data}`);
    console.log(`Node: ${node}`);

    if (this.root === null) {
      return null;
    } else if (data < node.data._id) {
      return this.find(data, node.left);
    } else if (data > node.data._id) {
      return this.find(data, node.right);
    } else if (data == node.data._id) {
      return node.data;
    } else return null;
  }

  getRoot() {
    return this.root;
  }

  // Performs inorder traversal of a tree
  inorder(node) {
    if (node !== null) {
      this.inorder(node.left, array);
      // inorder action should be here
      this.inorder(node.right, array);
    }
  }

  // getInorderArray() {
  //   const inorderArray = [];
  //   this.inorder;
  // }

  // Performs preorder traversal of a tree
  preorder(node = this.root) {
    const preorderArray = [];
    if (node !== null) {
      preorderArray.push(node.data);
      this.preorder(node.left);
      this.preorder(node.right);
    }
    return preorderArray;
  }
};
