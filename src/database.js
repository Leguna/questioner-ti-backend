const Boom = require('@hapi/boom')
const Bcrypt = require('bcrypt')
const { Pool } = require('pg')

const client = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 18,
  connectionTimeoutMilllis: 5000,
  idleTimeoutMillis: 10000

})

const testConnection = async () => {
  const res = await client.query('SELECT NOW()')
  console.log(res)
  return res
}

const getUser = async (params) => {
  let query
  if (params.id) {
    query = `SELECT * from users WHERE id='${params.id}'`
  }
  if (params.email) {
    query = `SELECT * from users WHERE email='${params.email}'`
  }
  if (params.username) {
    query = `SELECT * from users WHERE username='${params.username}'`
  }

  let res
  try {
    res = await client.query(query)
  } catch (e) {
    res.rows[0] = ''
  }

  return res.rows[0]
}
const validate = async (request, username, password) => {
  let user
  try {
    user = await getUser({ username })
  } catch (e) {
    return Boom.badRequest('Gagal Login. Server Bermasalah.')
  }

  let isValid, credentials

  if (!user) {
    return Boom.badRequest('Gagal Login. Username atau password Salah')
  }

  try {
    isValid = await Bcrypt.compare(password, user.password)
    credentials = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      username: username,
      password: password
    }
  } catch (e) {
    return Boom.badRequest('Gagal Login. Username atau password Salah')
  }

  return { isValid, credentials }
}
const getListDosen = async (id) => {
//   const query = `
//   SELECT name,courses_name,timestamp,questions_group,class_name,c.response_id,c.dosen_id,c.q_group,c.course_id
// FROM classes,
//      (courses FULL JOIN users u ON u.id = courses.dosen_id FULL JOIN responses r on r.user_id='${id}' AND r.target_id=courses.dosen_id) as c
// WHERE c.class_id = classes.class_id;
// `
  const query = `
SELECT courses.course_id,
       courses_name,
       dosen_id,
       name,
       questions_group,
       timestamp,
       class_name,
       year,
       semester
FROM courses
         LEFT JOIN  users u ON courses.dosen_id = u.id
         LEFT JOIN responses on courses.course_id = responses.courses_id AND responses.user_id = $1
         LEFT JOIN classes c on c.class_id = courses.class_id,
     classes_user cu
WHERE cu.classes_id=c.class_id AND cu.user_id=
$2;
  `

  const res = await client.query(query, [id, id])
  return res.rows
}
const getResponseIsi = async (userID, coursesID) => {
  const query = `
  SELECT course_id,
       courses_name,
       dosen_id,
       class_name,
       year,
       semester,
       question,
       response_id,
       questions_group,
       u2.name
FROM courses c
         FULL JOIN classes c2 on c.class_id = c2.class_id
         FULL JOIN classes_user u ON u.classes_id = c2.class_id
         FULL JOIN questions q on c.q_group = q.group_id
         FULL JOIN responses r on u.user_id = r.user_id AND r.courses_id = c.course_id
        FULL JOIN users u2 on dosen_id = u2.id
WHERE c.course_id = $1
  AND u.user_id = $2;
  `
  const values = [coursesID, userID]
  const res = await client.query(query, values)
  return res.rows
}

// QUESTION RESPONSE
const checkResponseIsExists = async (targetId, userId, coursesId) => {
  const query = `
SELECT * FROM responses WHERE target_id='${targetId}' AND user_id='${userId}' AND courses_id='${coursesId}';
  `
  const res = await client.query(query)
  if (res.rows.length > 0) {
    return [true, res.rows]
  } else {
    return [false, res.rows]
  }
}
const insertQuestionsResponse = async (targetid, userId, coursesId, questionsGroup, timestamp) => {
  const data = await checkResponseIsExists(targetid, userId, coursesId)

  if (!data[0]) {
    try {
      const values = [targetid, userId, coursesId, questionsGroup, timestamp]
      const query = `
  INSERT INTO responses(target_id, user_id, courses_id, questions_group,timestamp) VALUES ($1,$2,$3,$4,$5) RETURNING *;
  `
      const res = await client.query(query, values)
      return [true, res.rows]
    } catch (err) {
      console.log(err.stack)
    }
  }
  return [false, data[1]]
}

// DOSEN
const getDosenHomeCourses = async (id) => {
  const query = `
SELECT *
FROM courses,
     classes
WHERE dosen_id = $1
  AND classes.class_id = courses.class_id
  `
  const res = await client.query(query, [id])
  return res.rows
}
const getDosenDetailCourses = async (userId, coursesId) => {
  const query = `
SELECT group_id, question, courses_name, courses.class_id, class_name,year,semester
FROM questions,courses,classes
WHERE questions.group_id=courses.q_group AND courses.course_id=$1 AND courses.class_id=classes.class_id;
  `
  const query2 = `
SELECT questions_group
FROM responses as r
WHERE target_id = $1 AND courses_id=$2;  
  `

  const res = await client.query(query, [coursesId])
  const res2 = await client.query(query2, [userId, coursesId])

  return [res.rows, res2.rows]
}

module.exports = {
  testConnection,
  validate,
  getUserById: getUser,
  getListDosen,
  getResponseIsi,
  checkResponseIsExists,
  insertQuestionsResponse,
  getDosenHomeCourses,
  getDosenDetailCourses
}
