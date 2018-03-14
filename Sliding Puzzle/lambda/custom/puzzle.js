const original_puzzle = [
  [8, null, 5],
  [3, 6, 4],
  [2, 7, 1]
];

exports.moveLeft = () =>{
  var moved = false;
  for (row=0; row<3;row++){
    // only inspect 2nd and 3rd col
    for (col=1; col<3; col++){
      if (original_puzzle[row][col-1] == null) {
        original_puzzle[row][col-1] = original_puzzle[row][col];
        original_puzzle[row][col] = null;
        moved = true;
        break;
      }
    }
  }
  if (!moved) {
    console.log("Invalid move!");
  }
}
exports.moveRight = () =>{
  var moved = false;
  for (row=0; row<3;row++){
    // only inspect 1st and 2nd col
    for (col=0; col<2; col++){
      if (original_puzzle[row][col+1] == null) {
        original_puzzle[row][col+1] = original_puzzle[row][col];
        original_puzzle[row][col] = null;
        break;
      }
    }
  }
  if (!moved) {
    console.log("Invalid move!");
  }
}
exports.moveUp = () =>{
  var moved = false;
  // only inspect the 2nd and 3rd row
  for (row=1; row<3;row++){
    for (col=0; col<3; col++){
      if (original_puzzle[row-1][col] == null) {
        original_puzzle[row-1][col] = original_puzzle[row][col];
        original_puzzle[row][col] = null;
        break;
      }
    }
  }
  if (!moved) {
    console.log("Invalid move!");
  }
}
exports.moveDown = () =>{
  var moved = false;
  // only inspect the 1st and 2nd row
  for (row=0; row<2;row++){
    for (col=0; col<3; col++){
      if (original_puzzle[row+1][col] == null) {
        original_puzzle[row+1][col] = original_puzzle[row][col];
        original_puzzle[row][col] = null;
        break;
      }
    }
  }
  if (!moved) {
    console.log("Invalid move!");
  }
}
this.moveDown();
console.log(original_puzzle);
