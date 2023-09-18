const express = require('express')
const router = express.Router()
const tokenControl = require('../controller/tokenController')


function validateSubject(data) {
  const subject_name =  data.subject_name.trim();

  if (!subject_name) {
    return 'Bạn cần điền tên môn học'
  }
  return null
}

// Get all
router.get('/', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      const { data, error } = await request.supabase
      .from('subject')
      .select('*')
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
      .from('subject')
      .select('*')
      .eq('id',request.params.id )
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
    var dataRequest = request.body
    const validationError = validateSubject( dataRequest)
    if (validationError) {
      return response.status(400).json({status: false, data: "", msg:validationError})
    }
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      if(checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data, error } = await request.supabase.from('subject').insert({
          subject_name: dataRequest.subject_name.trim(),
        })
        if (error) {
          return response.status(400).json({status: false, data: "", msg:error.message})
        }
        response.status(200).json({status: true, data: data, msg:"Thêm thành công môn học"})
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền tạo môn học"});
        return ;
      }
    } else {
      response.status(400).json({status: false, data: "", msg:checkToken.message});
      return ;
  }
  } catch (error) {
    response.status(400).json({status: false, data: "", msg:error.message });
  }
})

// Update
router.post('/:id', async (request, response) => {
  try {
    var dataRequest = request.body
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      if(checkToken.data.role == tokenControl.ROLE.Admin) {
        const validationError = validateSubject( dataRequest )
        if (validationError) {
          return response.status(400).json({status: false, data: "", msg:validationError})
        }
        const { data, error } = await request.supabase
        .from('subject')
        .update({  subject_name: dataRequest.subject_name,})
        .eq('id', request.params.id )

        if (error) {
          return response.status(400).json({status: false, data: "", msg:error.message})
        }

        response.status(200).json({status: true,data: data, msg:"Sửa thành công môn học"})
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền sửa môn học"});
        return ;
      }
    } else {
      response.status(400).json({status: false, data: "", msg:checkToken.message});
      return ;
  }
  } catch (error) {
    response.status(400).json({status: false, data: "", msg:error.message });
  }
})

// Delete
router.delete('/:id', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      if(checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data, error } = await request.supabase
        .from('subject')
        .delete()
        .eq('id', request.params.id )
        if (error) {
          return response.status(400).json({status: false, data: "", msg:error.message})
        }
        response.status(200).json({status: true, data: data, msg:"Xóa môn học thành công"})
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền xóa môn học"});
        return ;
      }
    } else {
      response.status(400).json({status: false, data: "", msg:checkToken.message});
      return ;
  }
  } catch (error) {
    response.status(400).json({status: false, data: "", msg:error.message });
  }
})

module.exports = router
