A | B | C

A区：
网站选择

B区:
入口点选择

C区：
任务列表
文章列表


当选中网站时，会从website_config中获取到以下内容

```json
"exceptions": [{
      "name": "首页: 认证失败",
      "code": "home_auth_failed"
    }, {
      "name": "列表页: 状态码异常",
      "code": "list_status_code_error"
    }, {
      "name": "列表页: 格式异常",
      "code": "list_format_error"
    }, {
      "name": "列表页: 容量异常",
      "code": "list_size_error"
    }, {
      "name": "文章页: 状态码异常",
      "code": "article_status_code_error"
    }, {
      "name": "文章页: 验证码异常",
      "code": "article_captcha_error"
    }, {
      "name": "文章页: 标题异常",
      "code": "article_title_error"
    }, {
      "name": "文章页: 内容体异常",
      "code": "article_body_error"
    }],
    "discards": [{
      "name": "标题重复",
      "code": "title_duplicated"
    }, {
      "name": "URL重复",
      "code": "request_duplicated"
    }, {
      "name": "有效内容不足",
      "code": "length_failed"
    }, {
      "name": "敏感词",
      "code": "sensitive_failed"
    }]
```

这里的 exceptions 对应的着 结果类型中的 failed， discards 对应的着结果类型中的 discarded,
要将结果分类由输入框变成下拉框，下拉列表就是 exceptions 或是 discards 中的内容，resultCategory的值就是选中项的code的值