const fs = require('fs');
const original_puzzle = [
  [8, null, 5],
  [3, 6, 4],
  [2, 7, 1]
];
exports.initializePuzzle = () => {
  fs.writeFileSync('puzzle_state.txt',JSON.stringify(original_puzzle), 'utf-8');
}
exports.moveLeft = () =>{
  var moved = false;
  var puzzle_state = JSON.parse(fs.readFileSync('puzzle_state.txt','utf-8'));
  loop1:
  for (row=0; row<3;row++){
    // only inspect 2nd and 3rd col
  loop2:
    for (col=1; col<3; col++){
      if (puzzle_state[row][col-1] == null) {
        puzzle_state[row][col-1] = puzzle_state[row][col];
        puzzle_state[row][col] = null;
        moved = true;
        break loop1;
      }
    }
  }
  if (!moved) {
    console.log("Invalid move!");
  } else {
    fs.writeFileSync('puzzle_state.txt',JSON.stringify(puzzle_state), 'utf-8');
  }
}
exports.moveRight = () =>{
  var moved = false;
  var puzzle_state = JSON.parse(fs.readFileSync('puzzle_state.txt','utf-8'));
  loop1:
  for (row=0; row<3;row++){
    // only inspect 1st and 2nd col
  loop2:
    for (col=0; col<2; col++){
      if (puzzle_state[row][col+1] == null) {
        puzzle_state[row][col+1] = puzzle_state[row][col];
        puzzle_state[row][col] = null;
        moved = true;
        break loop1;
      }
    }
  }
  if (!moved) {
    console.log("Invalid move!");
  } else {
    fs.writeFileSync('puzzle_state.txt',JSON.stringify(puzzle_state), 'utf-8');
  }
}
exports.moveUp = () =>{
  var moved = false;
  var puzzle_state = JSON.parse(fs.readFileSync('puzzle_state.txt','utf-8'));
  // only inspect the 2nd and 3rd row
  loop1:
  for (row=1; row<3;row++){
  loop2:
    for (col=0; col<3; col++){
      if (puzzle_state[row-1][col] == null) {
        puzzle_state[row-1][col] = puzzle_state[row][col];
        puzzle_state[row][col] = null;
        moved = true;
        break loop1;
      }
    }
  }
  if (!moved) {
    console.log("Invalid move!");
  } else {
    fs.writeFileSync('puzzle_state.txt',JSON.stringify(puzzle_state), 'utf-8');
  }
}
exports.moveDown = () =>{
  var moved = false;
  var puzzle_state = JSON.parse(fs.readFileSync('puzzle_state.txt','utf-8'));
  // only inspect the 1st and 2nd row
  loop1:
  for (row=0; row<2;row++){
  loop2:
    for (col=0; col<3; col++){
      if (puzzle_state[row+1][col] == null) {
        puzzle_state[row+1][col] = puzzle_state[row][col];
        puzzle_state[row][col] = null;
        moved = true;
        break loop1;
      }
    }
  }
  if (!moved) {
    console.log("Invalid move!");
  } else {
    fs.writeFileSync('puzzle_state.txt',JSON.stringify(puzzle_state), 'utf-8');
  }
}

exports.readStatus = () => {
  return JSON.parse(fs.readFileSync('puzzle_state.txt','utf-8'));
}

exports.checkSucess = () =>{
  var puzzle_state = JSON.parse(fs.readFileSync('puzzle_state.txt','utf-8'));
  loop1:
  for (row=0; row<3;row++){
  loop2:
    for (col=0; col<3; col++){
      if (row == 2 && col == 2){
        break loop1;
      } else {
        if (puzzle_state[row][col] != row*3+col+1) {
          console.log("puzzle not solved yet!");
          return false;
        }
      }
    }
  }
  console.log("puzzle solved!");
  return true;
}
// this.checkSucess();
// console.log(original_puzzle);
