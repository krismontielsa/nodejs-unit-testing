// user.js
// const database = {
//     getUser: (id) => {
//         // In a real app, this would query a database
//         throw new Error('This should not be called in a test!');
//     }
// }

// const getUser = (id) => {
//     try {
//         const user = database.getUser(id);
//         return user;
//     } catch (error) {
//         return null;
//     }
// }

// module.exports = { getUser, database };

/* ---------------------------------------------------------------------------------*/

// // user.js -> The "Sealed Box"

// // This 'database' object is INSIDE the box
// // No one outside can see or touch it.

// const database = {
//   getUser: (id) => {
//       /*... does database stuff ... */
//   }
// }

// const getUser = (id) => {
//   try {
//     const user = database.getUser(id);
//     return user;
//   } catch (error) {
//     return null
//   }
// }

// // We only choose to export the getUser function.
// // This is only the window into the box
// module.exports = { getUser };

/* ---------------------------------------------------------------------------------*/

// // user.js (Refactored for Dependency Injection)

// // Now our function is pure. It depends only on its inputs.
// const createUserActions = (database) => {
//     return {
//         getUser: (id) => {
//             try {
//                 const user = database.getUser(id);
//                 return user;
//             } catch (error) {
//                 return null;
//             }
//         },
//         // you could add other user actions here, like deleteUser, etc.
//     };
// };

// module.exports = createUserActions;

/* ----------------------------------------------------------------------------- */

// user.js (Original form)
const database = require('./database');
const getUser = (id) => {
    const user = database.getUser(id);
    return user;
}

module.exports = { getUser };