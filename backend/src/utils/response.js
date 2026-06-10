const success = (res, data = null, message = '操作成功', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const error = (res, message = '操作失败', statusCode = 400, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

const paginate = (res, data, pagination, message = '获取成功') => {
  res.status(200).json({
    success: true,
    message,
    data: data,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
      totalPages: pagination.totalPages
    }
  });
};

module.exports = { success, error, paginate };
