export const adminSite = {
  batch: {
    title: '批量创建文章',
    backToArticles: '返回文章',
    keywordsCard: {
      title: '输入关键词',
      label: '关键词（一行一个）',
      placeholder: '输入关键词，一行一个'
    },
    publishImmediately: '立即发布',
    buttons: {
      generating: '正在生成...',
      generateArticles: '生成文章',
      saving: '正在保存...',
      saveSelected: '保存所选文章'
    },
    generatedArticles: {
      title: '生成文章',
      selectAll: '全选'
    },
    saveResults: {
      title: '保存结果'
    },
    status: {
      generated: '✓ 已生成',
      saved: '✓ 已保存',
      failed: '✗ 失败'
    },
    errors: {
      emptyKeywords: '请输入至少一个关键词',
      noValidKeywords: '请输入至少一个有效的关键词',
      generateFailed: '生成文章失败，请重试',
      noArticlesToSave: '没有文章可保存',
      noSelectedArticles: '未选择任何文章进行保存',
      saveFailed: '保存文章失败，请重试'
    },
    success: {
      generated: '成功生成 {successCount} 篇文章{errorMessage}',
      saved: '{successCount} 篇文章 {publishStatus}{errorMessage}',
      withErrors: ', {errorCount} 篇失败'
    },
    publishStatus: {
      published: '已发布',
      draft: '保存为草稿'
    }
  },
  new: {
    title: '创建新文章',
    keywordSection: {
      label: '关键词',
      placeholder: '输入文章关键词'
    },
    articleForm: {
      titleLabel: '标题',
      excerptLabel: '摘要',
      contentLabel: '内容',
      publishImmediately: '立即发布',
      slugLabel: 'slug'
    },
    buttons: {
      generating: '生成中...',
      generateArticle: '生成文章',
      saving: '保存中...',
      saveArticle: '保存文章',
      cancel: '取消'
    },
    errors: {
      emptyKeyword: '请输入关键词',
      generateFailed: '文章生成失败，请重试',
      saveFailed: '保存文章失败，请重试'
    },
    success: {
      generated: '文章生成成功',
      published: '文章已发布',
      savedAsDraft: '文章已保存为草稿'
    },
    backToArticles: '返回文章'
  },
  edit: {
    title: '编辑文章',
    loading: '加载中...',
    articleForm: {
      titleLabel: '标题',
      excerptLabel: '摘要',
      contentLabel: '内容',
      publishArticle: '发布文章'
    },
    deleteDialog: {
      title: '确认删除',
      description: '您确定要删除这篇文章吗？此操作无法撤销。'
    },
    buttons: {
      saving: '正在保存...',
      saveArticle: '保存文章',
      deleting: '正在删除...',
      deleteArticle: '删除文章',
      delete: '删除',
      cancel: '取消'
    },
    errors: {
      articleNotFound: '找不到文章',
      fetchFailed: '获取文章失败',
      updateFailed: '更新文章失败',
      deleteFailed: '删除文章失败'
    },
    success: {
      updated: '文章更新成功',
      deleted: '文章删除成功'
    }
  },
  list: {
    title: '文章管理',
    buttons: {
      createNew: '创建新文章',
      batchCreate: '批量创建'
    },
    table: {
      headers: {
        title: '标题',
        createdDate: '创建日期',
        status: '状态',
        actions: '操作',
        language: '语言'
      },
      noArticles: '未找到文章'
    },
    status: {
      published: '已发布',
      draft: '草稿'
    },
    actions: {
      edit: '编辑',
      view: '查看'
    }
  }
}
