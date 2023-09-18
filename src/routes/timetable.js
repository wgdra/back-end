const express = require('express')
const router = express.Router()
const tokenControl = require('../controller/tokenController')

function validateTimeTb(data) {

  const session_id =  data.session_id;
  const subject_id = data.subject_id;
  const classroom_id = data.classroom_id;
  const date = data.date.trim();

  if (!session_id ) {
    return 'Bạn cần chọn phiên đăng ký phòng';
  }
  if (!classroom_id) {
    return 'Bạn cần chọn lớp đăng ký';
  }
  if (!date) {
    return 'Bạn cần chọn ngày đăng ký';
  }
  if (!subject_id) {
    return 'Bạn cần chọn môn học bạn dạy';
  }
  
  return null
}

// Get all
router.get('/', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      const { data, error } = await request.supabase
      .from('school_timetable')
      .select(`
        id, 
        date, 
        status,
        classroom ( id, classroom_name ),
        session ( id, session_name, time_start, time_end ),
        subject ( id, subject_name ),
        user( id, full_name)

      `)
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


// Get data table
router.get('/', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      const { data, error } = await request.supabase
      .from('school_timetable')
      .select(`
        id, 
        date,
        key, 
        status,
        classroom ( id, classroom_name ),
        session ( id, session_name, time_start, time_end ),
        subject ( id, subject_name ),
        user( id, full_name)

      `).neq('status', tokenControl.STATUS.Reject)
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
      .from('school_timetable')
      .select(`
        date, 
        status,
        classroom ( id, classroom_name ),
        session ( id, session_name, time_start, time_end ),
        subject ( id, subject_name ),
        user( id, full_name)
      `)
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
    var dataRequest  = request.body
    const validationError = validateTimeTb(dataRequest)
    if (validationError) {
      return response.status(400).json({status: false, data: "", msg:validationError})
    }
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      const { data, error } = await request.supabase.from('school_timetable').insert({
        session_id: dataRequest.session_id,
        subject_id: dataRequest.subject_id,
        classroom_id: dataRequest.classroom_id,
        date: dataRequest.date,
        teacher_id: dataRequest.teacher_id,
        status: tokenControl.STATUS.Watting,
        key : dataRequest.key
      })
      if (error) {
        return response.status(400).json({status: false, data: "", msg:error.message})
      }
      response.status(200).json({status: true, data: data, msg: ""})
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
    var dataRequest  = request.body
    const validationError = validateTimeTb(dataRequest )
    if (validationError) {
      return response.status(400).json({status: false, data: "", msg:validationError})
    }
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      const {data, error } = await request.supabase
      .from('school_timetable')
      .update({ 
        session_id: dataRequest.session_id,
        subject_id: dataRequest.subject_id,
        classroom_id: dataRequest.classroom_id,
        date: dataRequest.date,
        status: tokenControl.STATUS.Watting,
        teacher_id: dataRequest.teacher_id
      })
      .eq('id', request.params.id )

      if (error) {
        return response.status(400).json({status: false, data: "", msg:error.message})
      }

      response.status(200).json({status: true, data: data, msg: ""})
    } else {
      response.status(400).json({status: false, data: "", msg:checkToken.message});
      return ;
    }
  } catch (error) {
    response.status(400).json({status: false, data: "", msg:error.message });
  }
})


// Duyệt đăng ký phòng học
router.post('/accept/:id', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      if(checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data: checkData } = await request.supabase
        .from('school_timetable')
        .select('status').eq('id', request.params.id );

        if(checkData[0].status == tokenControl.STATUS.Watting) {
          const { data: acceptData, error } = await request.supabase
          .from('school_timetable')
          .update({ 
            status: tokenControl.STATUS.Accept,
          })
          .eq('id', request.params.id )

          if (error) {
            return response.status(400).json({status: false, data: "", msg:error.message})
          }
          response.status(200).json({status: true, data: acceptData, msg:"Duyệt thành công"});
        } else {
          return response.status(400).json({status: false, data: "", msg:"Phiếu đăng ký phải ở trạng thái đang chờ mới được phép thao tác"})
        }
        
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền duyệt"});
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

// Từ chối đăng ký phòng học
router.post('/reject/:id', async (request, response) => {
  try {
    const checkToken = await tokenControl.checkToken(request);
    if(checkToken.status == true) {
      if(checkToken.data.role == tokenControl.ROLE.Admin) {
        const { data: checkData } = await request.supabase
        .from('school_timetable')
        .select('status').eq('id', request.params.id );

        if(checkData[0].status == tokenControl.STATUS.Watting) {
          const { data: rejectData, error } = await request.supabase
          .from('school_timetable')
          .update({ 
            status: tokenControl.STATUS.Reject,
          })
          .eq('id', request.params.id )

          if (error) {
            return response.status(400).json({status: false, data: "", msg:error.message})
          }
          response.status(200).json({status: true, data: rejectData, msg:"Thao tác thành công"});
        } else {
            return response.status(400).json({status: false, data: "", msg:"Phiếu đăng ký phải ở trạng thái đang chờ mới được phép thao tác"})
        }
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền từ chối đăng ký phòng học"});
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
        .from('school_timetable')
        .delete()
        .eq('id', request.params.id )
        if (error) {
          return response.status(400).json({status: false, data: "", msg:error.message})
        }
        response.status(200).json({status: true, data: "", msg:"Thao tác thành công"})
      } else {
        response.status(400).json({status: false, data: "", msg:"Bạn không có quyền xóa đăng ký phòng học"});
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
