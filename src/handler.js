const Boom = require('@hapi/boom')
const db = require('./database')

const defaultResponse = (request, h) => {
  return h.response({
    name: 'ti-questioner-backend',
    version: '1.0.0',
    description: 'Survey nilai backend TI Polnep'
  })
}

const login = async (request, h) => {
  const data = request.payload
  if (!data.username || !data.password) {
    return Boom.badRequest('Gagal Login. Username atau password Salah')
  }
  let validateData
  try {
    validateData = await db.validate(request, data.username, data.password)
  } catch (e) {
    console.log(e)
  }
  if (validateData.isValid) {
    return h.response(validateData)
  } else {
    return validateData
  }
}

const listDosen = async (request) => {
  const userId = request.auth.credentials.id

  const listDosenData = await db.getListDosen(userId)
  return {
    status: 'success',
    data: {
      list_dosen: listDosenData
    }
  }
}

const getResponseQuestion = async (request) => {
  const {
    userId,
    coursesId
  } = request.query

  const questions = await db.getResponseIsi(userId, coursesId)
  return {
    status: 'success',
    data: {
      questions: questions
    }
  }
}

const checkResponseIfExist = async (request) => {

}

const postResponseQuestion = async (request, h) => {
  const {
    targetId, coursesId, questionsGroup
  } = request.payload

  if (!request.auth.isAuthenticated) {
    return h.response({
      status: 'error',
      message: 'User tidak teridentifikasi.'
    }).code(401)
  }
  if (targetId === undefined || coursesId === undefined || questionsGroup === undefined) {
    return h.response({
      status: 'error',
      message: 'Gagal mengisi form. Terdapat data yang kosong.'
    }).code(400)
  }

  const userId = request.auth.credentials.id
  const timestamp = new Date().toISOString()

  // INSERTING DATA
  let insertDataResponse
  try {
    insertDataResponse = await db.insertQuestionsResponse(targetId, userId, coursesId, questionsGroup, timestamp)
  } catch (e) {
    return Boom.badData('Harap masukkan data dengan benar.')
  }

  if (insertDataResponse[0]) {
    return insertDataResponse[1][0]
  } else {
    return Boom.badRequest('Response sudah ada.')
  }
}

const getDosenHomeCourses = async (request) => {
  const userId = request.auth.credentials.id

  let listDosenData
  try {
    listDosenData = await db.getDosenHomeCourses(userId)
  } catch (e) {
    console.log(e)
    return {
      status: 'error',
      message: 'Maaf proses pengambilan data Gagal.',
      error: e.message
    }
  }
  return {
    status: 'success',
    data: {
      listDosenData
    }
  }
}

const getDosenDetailCourses = async (request) => {
  const userId = request.auth.credentials.id
  const { coursesId } = request.query

  let detailQuestionerCourses
  let questions
  let responseQuestions
  let dataKelas = {}
  const listSaran = []
  const listQuestions = []
  let listRataRata = []
  let sum
  if (coursesId == null || userId == null) {
    return Boom.badRequest('Parameter yang dimasukkan salah.')
  }

  try {
    detailQuestionerCourses = await db.getDosenDetailCourses(userId, coursesId)

    questions = detailQuestionerCourses[0]
    responseQuestions = detailQuestionerCourses[1]
    listRataRata = Array(questions.length).fill(0)
    dataKelas.makulName = questions.courses_name

    for (const question of questions) {
      listQuestions.push(question.question)
    }

    for (let i = 0; i < responseQuestions.length; i++) {
      const listAnswerKey = responseQuestions[i]
      const answerListObject = Object.values(JSON.parse(listAnswerKey.questions_group))
      listSaran.push(answerListObject[answerListObject.length - 1])

      for (let j = 0; j < answerListObject.length - 1; j++) {
        listRataRata[j] += parseInt(answerListObject[j]) / responseQuestions.length
      }
    }

    // eslint-disable-next-line camelcase
    const { class_id, class_name, year, semester, courses_name } = questions[0]
    dataKelas = { class_id, class_name, year, semester, courses_name }

    sum = 0
    for (const jumlah of listRataRata) {
      sum += jumlah
    }
  } catch (e) {
    console.log(e)
    return {
      status: 'error',
      message: 'Maaf proses pengambilan data Gagal.',
      error: e.message
    }
  }
  return {
    status: 'success',

    data: {
      listQuestions,
      listRataRata,
      rataRataSeluruh: sum / listQuestions.length,
      listSaran,
      dataKelas
    }
  }
}

// const addBookHandler = (request, h) => {
//   const {
//     name,
//     year,
//     author,
//     summary,
//     publisher,
//     pageCount,
//     readPage,
//     reading
//   } = request.payload
//
//   const id = nanoid(16)
//   const insertedAt = new Date().toISOString()
//   const updatedAt = insertedAt
//   const finished = pageCount === readPage
//
//   const book = {
//     id,
//     name,
//     year,
//     author,
//     summary,
//     publisher,
//     pageCount,
//     readPage,
//     finished,
//     reading,
//     insertedAt,
//     updatedAt
//   }
//   if (name === undefined) {
//     return h.response({
//       status: 'fail',
//       message: 'Gagal menambahkan buku. Mohon isi nama buku'
//     }).code(400)
//   } else if (readPage > pageCount) {
//     return h.response({
//       status: 'fail',
//       message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
//     }).code(400)
//   }
//
//   books.push(book)
//
//   const isSuccess = books.filter((book) => book.id === id).length > 0
//
//   if (isSuccess) {
//     return h.response({
//       status: 'success',
//       message: 'Buku berhasil ditambahkan',
//       data: {
//         bookId: id
//       }
//     }).code(201)
//   }
//
//   return h.response({
//     status: 'error',
//     message: 'Buku gagal ditambahkan'
//   }).code(500)
// }
//
// const getBookByIdHandler = (request, h) => {
//   const { id } = request.params
//   const book = books.filter((n) => n.id === id)[0]
//
//   if (book !== undefined) {
//     return h.response({
//       status: 'success',
//       data: {
//         book
//       }
//     }).code(200)
//   }
//
//   return h.response({
//     status: 'fail',
//     message: 'Buku tidak ditemukan'
//   }).code(404)
// }
//
// const editBookByIdHandler = (request, h) => {
//   const { id } = request.params
//
//   const {
//     name,
//     year,
//     author,
//     summary,
//     publisher,
//     pageCount,
//     readPage,
//     reading
//   } = request.payload
//
//   if (name === undefined) {
//     return h.response({
//       status: 'fail',
//       message: 'Gagal memperbarui buku. Mohon isi nama buku'
//     }).code(400)
//   } else if (readPage > pageCount) {
//     return h.response({
//       status: 'fail',
//       message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
//     }).code(400)
//   }
//
//   const updatedAt = new Date().toISOString()
//
//   const index = books.findIndex((book) => book.id === id)
//
//   if (index !== -1) {
//     books[index] = {
//       ...books[index],
//       name,
//       year,
//       author,
//       summary,
//       publisher,
//       pageCount,
//       readPage,
//       reading,
//       updatedAt
//     }
//
//     return h.response({
//       status: 'success',
//       message: 'Buku berhasil diperbarui'
//     }).code(200)
//   }
//
//   return h.response({
//     status: 'fail',
//     message: 'Gagal memperbarui buku. Id tidak ditemukan'
//   }).code(404)
// }
//
// const deleteBookByIdHandler = (request, h) => {
//   const { id } = request.params
//
//   const index = books.findIndex((book) => book.id === id)
//
//   if (index !== -1) {
//     books.splice(index, 1)
//     return h.response({
//       status: 'success',
//       message: 'Buku berhasil dihapus'
//     }).code(200)
//   }
//
//   return h.response({
//     status: 'fail',
//     message: 'Buku gagal dihapus. Id tidak ditemukan'
//   }).code(404)
// }

module.exports = {
  listDosen,
  defaultResponse,
  login,
  getResponseQuestion,
  postResponseQuestion,
  checkResponseIfExist,
  getDosenHomeCourses,
  getDosenDetailCourses
}
