const loginWith = async (page, username, password)  => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
}

const createBlog = async (page, title, author, url) => {
  await page.getByRole('button', { name: 'new blog' }).click()
  await page.getByTestId('blogTitle').fill(title)
  await page.getByTestId('blogAuthor').fill(author)
  await page.getByTestId('blogUrl').fill(url)
  await page.getByRole('button', { name: 'Create' }).click()
}

const createBlogPostByAnotherUser = async (page, username, password, title, author, url) => {
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'Login' }).click()
  await page.getByRole('button', { name: 'new blog' }).click()
  await page.getByTestId('blogTitle').fill(title)
  await page.getByTestId('blogAuthor').fill(author)
  await page.getByTestId('blogUrl').fill(url)
  await page.getByRole('button', { name: 'Create' }).click()
  await page.getByRole('button', { name: 'Logout' }).click()
}

export { loginWith, createBlog, createBlogPostByAnotherUser }