module.exports = function postRoutes(app, { posts }) {
  // Get all Posts paged
  app.get('/api/posts', async (req, res) => {
    const { page = '1', pageSize = '10' } = req.query

    const pageInt = parseInt(page, 10)
    const pageSizeInt = parseInt(pageSize, 10)

    const count = await posts.countDocuments()

    const allPosts = await posts
      .find()
      .skip((pageInt - 1) * pageSizeInt)
      .limit(pageSizeInt)
      .toArray()

    res.send({
      success: true,
      data: {
        posts: allPosts,
        total: count,
        page: pageInt,
        pageSize: pageSizeInt,
      },
    })
  })

  // Get specific post by slug
  app.get('/api/posts/:slug', async (req, res) => {
    const { slug } = req.params
    const foundPost = await posts.findOne({ slug })
    res.send({
      success: !!foundPost?.slug,
      data: {
        post: foundPost,
      },
    })
  })

  // Create Post if allowed
  app.post('/api/posts/create', async (req, res) => {
    const { title, slug, content, author } = req.body

    const newPost = {
      title,
      slug,
      content,
      author,
      createdAt: Date.now(),
    }
    try {
      const insertResponse = await posts.insertOne(newPost)

      res.send({
        success: true,
        data: insertResponse,
      })
    } catch (e) {
      res.send({
        success: false,
        error: e,
      })
    }
  })

  // Delete Post if allowed
  app.delete('/api/posts/:slug', async (req, res) => {
    const { slug } = req.params
    const deleteResult = await posts.deleteOne({ slug })
    res.send({ success: deleteResult?.deletedCount > 0, data: deleteResult })
  })

  // Update Post if allowed
  app.put('/api/posts/:slug', async (req, res) => {
    const { slug } = req.params

    const { title, slug: newSlug, content } = req.body

    const updatePost = {
      title,
      slug: newSlug,
      content,
    }
    try {
      const updateResponse = await posts.updateOne(
        { slug },
        { $set: updatePost }
      )

      res.send({
        success: updateResponse?.modifiedCount > 0,
        data: updateResponse,
      })
    } catch (e) {
      res.send({
        success: false,
        error: e,
      })
    }
  })
}
