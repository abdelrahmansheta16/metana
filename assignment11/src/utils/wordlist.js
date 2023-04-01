// const fse = require('fs-extra');

// export default function getRandomWords() {

//     // Define the path to your text file
//     const filePath = 'wordlist.txt';

//     // Read the contents of the text file
//     fse.readFile(filePath, 'utf8')
//         .then(data => {
//             // Split the contents into an array of words
//             const wordArray = data.split('\n').map(word => word.trim());

//             return wordArray
//         })
//         .catch(err => {
//             console.error('Error reading the file:', err);
//         });
// }