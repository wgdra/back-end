const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const tokenControl = require('../controller/tokenController')

//Checking the crypto module
const crypto = require('crypto')
// const algorithm = 'aes-256-cbc'; //Using AES encryption
// const key = crypto.randomBytes(32);
// const iv = crypto.randomBytes(16);

const roleUser = null

//Encrypting text
function encrypt(text) {
  // let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  // let encrypted = cipher.update(text);
  // encrypted = Buffer.concat([encrypted, cipher.final()]);
  console.log(crypto.createHash('md5').update(text).digest('hex'))
  return crypto.createHash('md5').update(text).digest('hex')
}

function validateUser(data) {
  console.log('Data----')
  console.log(data)
  const username = data.username.trim()
  const password = data.password
  const full_name = data.full_name.trim()
  const role = data.role
  const subject_id = data.subject_id
  const phone = data.phone.trim()
  const email = data.email.trim()

  if (!username) {
    return 'Bạn cần điền username'
  }
  if (!password) {
    return 'Bạn cần nhập password'
  }
  if (!full_name) {
    return 'Bạn cần điền tên đầy đủ'
  }
  if (!phone) {
    return 'Bạn cần nhập số điện thoại'
  }
  if (!email) {
    return 'Bạn cần nhập vào email'
  }
  if (role == tokenControl.ROLE.Teacher) {
    if (!subject_id) {
      return 'Bạn cần nhập chọn môn học cho giáo viên'
    }
  }

  return null
}

// Get all
router.get('/', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request)
    if (checkToken.status == true) {
      const { data, error } = await request.supabase.from('user').select('*')
      if (error) {
        return response.status(400).json({ status: false, data: '', msg: error.message })
      }
      response.status(200).json({ status: true, data: data, msg: '' })
    } else {
      response.status(400).json({ status: false, data: '', msg: checkToken.message })
      return
    }
  } catch (error) {
    return response.status(400).json({ status: false, data: '', msg: error.message })
  }
})

// Get one
router.get('/:id', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request)
    if (checkToken.status == true) {
      const { data, error } = await request.supabase
        .from('user')
        .select('*')
        .eq('id', request.params.id)
        .maybeSingle()
      if (error) {
        return response.status(400).json({ status: false, data: '', msg: error.message })
      }
      response.status(200).json({ status: true, data: data, msg: '' })
    } else {
      response.status(400).json({ status: false, data: '', msg: checkToken.message })
      return
    }
  } catch (error) {
    return response.status(400).json({ status: false, data: '', msg: error.message })
  }
})

// Login
router.post('/login', async (request, response) => {
  try {
    var dataRequest = request.body
    if (dataRequest.username == '' || dataRequest.password == '') {
      return response
        .status(400)
        .json({ status: false, data: '', msg: 'Bạn cần nhập đủ cả tài khoản và mật khẩu' })
    }
    if (dataRequest.username != '' && dataRequest.password != '') {
      const { data, error } = await request.supabase
        .from('user')
        .select('id,username,password,role')
        .eq('username', dataRequest.username)
        .maybeSingle()

      if (data == null) {
        response.status(400).json({ status: false, data: '', msg: 'Username không tồn tại' })
        return
      }

      if (data.password != dataRequest.password) {
        console.log('dât pass', data.password)
        console.log('dât req', dataRequest.password)

        return response.status(400).json({ status: false, data: '', msg: 'Sai mật khẩu!' })
      } else {
        var id = data.id
        var username = data.username
        var role = data.role

        const token = jwt.sign({ id, username, role }, process.env.DATABASE_KEY_SECRET, {
          expiresIn: '1h',
        })
        // const refreshToken = jwt.sign(user, process.env.REFRESH_SECRET_KEY, { expiresIn: '3h' });
        return response
          .status(200)
          .json({ status: true, data: { id, username, role, token }, msg: 'Đăng nhập thành công' })
      }
    }
  } catch (error) {
    response.status(400).json({ status: false, data: '', msg: error.message })
  }
})

// Create
router.post('/', async (request, response) => {
  try {
    var dataRequest = request.body

    const validationError = validateUser(dataRequest)
    if (validationError) {
      return response.status(400).json({ status: false, data: '', msg: validationError })
    }

    const checkToken = await tokenControl.checkToken(request)
    if (checkToken.status == true) {
      if (checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data: checkData, error: checkError } = await request.supabase
          .from('user')
          .select('username,password')
          .eq('username', dataRequest.username)
          .maybeSingle()

        if (checkError) {
          return response.status(400).json({ status: false, data: '', msg: checkError })
        }
        if (checkData == null) {
          const { data: insertData, error: insertError } = await request.supabase
            .from('user')
            .insert({
              username: dataRequest.username.trim(),
              password: dataRequest.password,
              full_name: dataRequest.full_name.trim().replace(/\s+/g, ' '),
              role: dataRequest.role,
              subject_id: dataRequest.subject_id != '' ? dataRequest.subject_id : null,
              phone: dataRequest.phone.trim(),
              email: dataRequest.email.trim(),
            })
          if (insertError) {
            return response.status(400).json({ status: false, data: '', msg: insertError })
          }
          response.status(200).json({ status: true, data: insertData, msg: 'Đăng kí thành công' })
          return
        } else {
          response.status(400).json({ status: false, data: '', msg: 'Username đã tồn tại' })
          return
        }
      } else {
        response.status(400).json({ status: false, data: '', msg: 'Bạn không có quyền tạo user' })
        return
      }
    } else {
      response.status(400).json({ status: false, data: '', msg: checkToken.message })
      return
    }
  } catch (error) {
    response.status(400).json({ status: false, data: '', msg: error.message })
  }
})

// Update
router.post('/:id', async (request, response) => {
  try {
    var dataRequest = request.body
    const validationError = validateUser(dataRequest)
    if (validationError) {
      return response.status(400).json({ status: false, data: '', msg: validationError })
    }
    const checkToken = await tokenControl.checkToken(request)

    if (checkToken.status == true) {
      if (checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data, error } = await request.supabase
          .from('user')
          .update({
            username: dataRequest.username.trim(),
            password: dataRequest.password,
            full_name: dataRequest.full_name.trim().replace(/\s+/g, ' '),
            role: dataRequest.role,
            subject_id: dataRequest.subject_id != '' ? dataRequest.subject_id : null,
            phone: dataRequest.phone.trim(),
            email: dataRequest.email.trim(),
          })
          .eq('id', request.params.id)

        if (error) {
          return response.status(400).json({ status: false, data: '', msg: error.message })
        }
        return response.status(200).json({ status: true, data: data, msg: 'Sửa thành công' })
      } else {
        const { data, error } = await request.supabase
          .from('user')
          .update({
            password: encrypt(dataRequest.password),
            full_name: dataRequest.full_name.trim().replace(/\s+/g, ' '),
            phone: dataRequest.phone.trim(),
            email: dataRequest.email.trim(),
          })
          .eq('id', request.params.id)

        if (error) {
          return response.status(400).json({ status: false, data: '', msg: error.message })
        }
        response.status(200).json({ status: true, data: data, msg: 'Sửa thành công' })
      }
    } else {
      response.status(400).json({ status: false, data: '', msg: checkToken.message })
      return
    }
  } catch (error) {
    response.status(400).json({ status: false, data: '', msg: error.message })
  }
})

// Delete
router.delete('/:id', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request)

    if (checkToken.status == true) {
      if (checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data, error } = await request.supabase
          .from('user')
          .delete()
          .eq('id', request.params.id)
        if (error) {
          return response.status(400).json({ status: false, data: '', msg: error.message })
        }
      } else {
        response.status(400).json({ status: false, data: '', msg: 'Bạn không có quyền xóa user' })
        return
      }
    } else {
      response.status(400).json({ status: false, data: '', msg: checkToken.message })
      return
    }
    response.status(200).json({ status: true, data: '', msg: 'Xóa thành công user' })
  } catch (error) {
    response.status(400).json({ status: false, data: '', msg: error.message })
  }
})

module.exports = router
