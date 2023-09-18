const express = require('express')
const router = express.Router()
const tokenControl = require('../controller/tokenController')

function validateSession(data) {
  const session_name =  data.session_name.trim();
  const time_start = data.time_start.trim();
  const time_end = data.time_end.trim();

  if (!session_name ) {
    return 'Bạn cần điền tên phiên học';
  }
  if (!time_start) {
    return 'Bạn cần điền thời gian bắt đầu phiên';
  }
  if (!time_end) {
    return 'Bạn cần điền thời gian kết thúc phiên';
  }
  return null
}

// Get all
router.get('/', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      const { data, error } = await request.supabase
      .from('session')
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
      .from('session')
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
    const validationError = validateSession(dataRequest )
    if (validationError) {
      return response.status(400).json({status: false, data: "", msg:validationError})
    }
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      if(checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data, error } = await request.supabase.from('session').insert({
          session_name: dataRequest.session_name.trim(),
          time_start: dataRequest.time_start.trim(),
          time_end: dataRequest.time_end.trim(),
        })
        if (error) {
          return response.status(400).json({status: false, data: "", msg:error.message})
        }
        response.status(200).json({status: true, data: data, msg:"Thêm phiên thành công"})
      } else {
        return response.status(400).json({status: false, data: "", msg:"Bạn không có quyền tạo phiên"})
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
    const validationError = validateSession(dataRequest )
    if (validationError) {
      return response.status(400).json({status: false, data: "", msg:validationError})
    }

    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      if(checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data, error } = await request.supabase
        .from('session')
        .update({  
          session_name: data.session_name.trim(),
          time_start: data.time_start.trim(),
          time_end: data.time_end.trim() 
        })
        .eq('id', request.params.id )

        if (error) {
          return response.status(400).json({status: false, data: "", msg:error.message})
        }

        response.status(200).json({status: true, data: data, msg:"Sửa phiên thành công"})
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền sửa phiên"});
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
        .from('session')
        .delete()
        .eq('id', request.params.id )
        if (error) {
          return response.status(400).json({status: false, data: "", msg:error.message})
        }
        response.status(200).json({status: true, data: data, msg:"Xóa phiên thành công"})
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền xóa phiên"});
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
