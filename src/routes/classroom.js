const express = require('express')
const tokenControl = require('../controller/tokenController')
const router = express.Router()

function validateClassroom(data) {
  const classroom_name = data.classroom_name && data.classroom_name.trim()

  if (!classroom_name) {
    return 'Bạn cần điền tên lớp'
  }

  if (classroom_name.length < 3) {
    return 'Tên lớp phải có ít nhất 3 ký tự'
  }

  return null
}

// Get all
router.get('/', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      const { data, error } = await request.supabase.from('classroom').select('*')
      if (error) {
        return response.status(400).json({status: false, data: "", msg:error.message})
      }
      response.status(200).json({status: true, data: data, msg: ""})
    } else {
      response.status(400).json({status: false, data: "", msg:checkToken.message});
      return ;
    }
  } catch (error) {
    return response.status(400).json({status: false, data: "", msg:error.message})
  }
})

// Get one
router.get('/:id', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      const { data, error } = await request.supabase
        .from('classroom')
        .select('*')
        .eq('id', request.params.id)
        .maybeSingle()

      if (error) {
        return response.status(400).json({status: false, data: "", msg:error.message})
      }
      response.status(200).json({status: true, data: data, msg: ""})
    } else {
      response.status(400).json({status: false, data: "", msg:checkToken.message});
      return ;
    }
  } catch (error) {
    return response.status(400).json({status: false, data: "", msg:error.message})
  }
})

// Create
router.post('/', async (request, response) => {
  try {
    const { classroom_name, note } = request.body

    const validationError = validateClassroom({ classroom_name })
    if (validationError) {
      return response.status(400).json({status: false, data: "", msg:validationError})
    }
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      if(checkToken.data.role == tokenControl.ROLE.Admin) {
        const {data, error } = await request.supabase.from('classroom').insert({
          classroom_name: classroom_name.trim(),
          note: note ? note.trim() : null,
        })

        if (error) {
          return response.status(400).json({status: false, data: "", msg:error.message.message})
        }
        response.status(200).json({status: true, data: data, msg:"Thêm lớp thành công"})
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền tạo lớp"});
        return ;
      }
    } else {
      response.status(400).json({status: false, data: "", msg:checkToken.message});
      return ;
  }

    
  } catch (error) {
    response.status(500).json({status: false, data: "", msg:error.message.message})
  }
})

// Update
router.post('/:id', async (request, response) => {
  try {
    const { classroom_name, note } = request.body

    const validationError = validateClassroom({ classroom_name })
    if (validationError) {
      return response.status(400).json({status: false, data: "", msg:validationError})
    }
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      if(checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data, error } = await request.supabase
          .from('classroom')
          .update({
            classroom_name: classroom_name.trim(),
            note: note ? note.trim() : null,
          })
          .eq('id', request.params.id)
          .select()

        if (error) {
          return response.status(400).json({status: false, data: "", msg:error.message.message})
        }

        response.status(200).json({status: true, data: data, msg:"Sửa lớp thành công"})
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền sửa lớp"});
        return ;
      }
    } else {
      response.status(400).json({status: false, data: "", msg:checkToken.message});
      return ;
  }
  } catch (error) {
    response.status(500).json({status: false, data: "", msg:error.message.message})
  }
})

// Delete
router.delete('/:id', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      if(checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data, error } = await request.supabase.from('classroom').delete().eq('id', request.params.id)
        if (error) {
          return response.status(400).json({status: false, data: "", msg:error.message.message})
        }
        response.status(200).json({status: true, data: data, msg:"Xóa lớp thành công"})
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền xóa lớp"});
        return ;
      }
    } else {
      response.status(400).json({status: false, data: "", msg:checkToken.message});
      return ;
    }
  } catch (error) {
    response.status(500).json({status: false, data: "", msg:error.message.message})
  }
})

module.exports = router
