const {
  listDosen,
  defaultResponse,
  login,
  getResponseQuestion,
  postResponseQuestion,
  getDosenHomeCourses,
  getDosenDetailCourses
} = require('./handler')

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: defaultResponse,
    options: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/login',
    options: {
      auth: false
    },
    handler: login
  },
  {
    method: 'POST',
    path: '/mahasiswa/dosen',
    handler: listDosen
  },
  {
    method: 'GET',
    path: '/mahasiswa/response',
    handler: getResponseQuestion
  },
  {
    method: 'POST',
    path: '/mahasiswa/response',
    handler: postResponseQuestion
  },
  {
    method: 'GET',
    path: '/dosen/courses',
    handler: getDosenHomeCourses
  },
  {
    method: 'GET',
    path: '/dosen/courses/details',
    handler: getDosenDetailCourses
  }
  // {
  //   method: 'POST',
  //   path: '/responses',
  //   handler: addBookHandler
  // },
  // {
  //   method: 'GET',
  //   path: '/books/{id}',
  //   handler: getBookByIdHandler
  // },
  // {
  //   method: 'PUT',
  //   path: '/books/{id}',
  //   handler: editBookByIdHandler
  // },
  // {
  //   method: 'DELETE',
  //   path: '/books/{id}',
  //   handler: deleteBookByIdHandler
  // }
]

module.exports = routes
