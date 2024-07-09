const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog, createBlogPostByAnotherUser } = require('./helper')

describe('Bloglist app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http:localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    //creating atest postsanother user for tests
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Matti Luukkainen2',
        username: 'mluukkai2',
        password: 'salainen2'
      }
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
    await expect(page.getByTestId('username')).toBeVisible()
    await expect(page.getByTestId('password')).toBeVisible()
    await expect(page.getByRole('button', {name: 'Login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('username').fill('mluukkai')
      await page.getByTestId('password').fill('salainen')
      await page.getByRole('button', { name: 'Login' }).click() 
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('username').fill('mluuk')
      await page.getByTestId('password').fill('salainen')
      await page.getByRole('button', { name: 'Login' }).click() 
      await expect(page.getByText('Invalid username or password')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })
  
    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new blog' }).click()
      await page.getByTestId('blogTitle').fill('Testing with Playwright')
      await page.getByTestId('blogAuthor').fill('Playwright Tester')
      await page.getByTestId('blogUrl').fill('www.how-to-do-it.fi')
      await page.getByRole('button', { name: 'Create' }).click()
      await expect(page.getByText('A new blog Testing with Playwright by Playwright Tester added')).toBeVisible()
      await expect(page.getByText('Testing with Playwright Playwright Tester')).toBeVisible()
    })

    
  })
  describe('When blogs exist', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await createBlog(page, 'Testing with Playwright', 'Playwright Tester', 'www.how-to-do-it.fi')
    })

    test('a blog is liked', async({ page }) => {
      const blogDiv = await page.getByText('Testing with Playwright Playwright Tester')
      await blogDiv.getByRole('button', { name: 'view' }).click()
      await expect(blogDiv.getByText('likes 0')).toBeVisible()
      await blogDiv.getByRole('button', { name: 'like' }).click()
      await expect(blogDiv.getByText('likes 1')).toBeVisible()
    })

    test('user can delete their blog', async({ page }) => {
      const blogDiv = await page.getByText('Testing with Playwright Playwright Tester')
      await blogDiv.getByRole('button', { name: 'view' }).click()
      await expect(blogDiv.getByRole('button', { name: 'delete' })).toBeVisible()
      page.on('dialog', async dialog =>  {
        expect(dialog.message()).toEqual('Remove blog Testing with Playwright by Playwright Tester?')
        await dialog.accept()
      })
      await blogDiv.getByRole('button', { name: 'delete' }).click()
      await expect(page.getByText('Testing with Playwright Playwright Tester')).not.toBeVisible()
    })
    test('a blog is not deleted if cancel is clicked on the confirmation dialog', async({ page }) => {
      const blogDiv = await page.getByText('Testing with Playwright Playwright Tester')
      await blogDiv.getByRole('button', { name: 'view' }).click()
      await expect(blogDiv.getByRole('button', { name: 'delete' })).toBeVisible()
      page.on('dialog', async dialog =>  {
        expect(dialog.message()).toEqual('Remove blog Testing with Playwright by Playwright Tester?')
        await dialog.dismiss()
      })
      await blogDiv.getByRole('button', { name: 'delete' }).click()
      await expect(page.getByText('Testing with Playwright Playwright Tester')).toBeVisible()
    })

    test('a user only sees delete button of their own blog', async({ page }) => {
      await page.getByRole('button', { name: 'Logout' }).click()
      await loginWith(page, 'mluukkai2', 'salainen2')
      await expect(page.getByRole('button', { name: 'delete' })).not.toBeVisible()
      await createBlog(page, 'Testing E2E', 'Playwright Tester', 'www.how-to-do-it.fi')
      const blogDiv = await page.getByText('Testing E2E Playwright Tester')
      await expect(blogDiv.getByRole('button', { name: 'delete' })).toBeVisible()   
    })

    test('blog posts ordered ', async({ page }) => {
      await createBlog(page, 'Testing E2E', 'Playwright Tester', 'www.how-to-do-it.fi')
      await createBlog(page, 'I like testing', 'Playwright Tester', 'www.how-to-do-it.fi')
      await expect(page.locator('.blogPost').first()).toHaveText(/Testing with Playwright/)
      const blogDiv = page.getByText('I like testing')
      await blogDiv.getByRole('button', { name: 'view' }).click()
      await blogDiv.getByRole('button', { name: 'like' }).click()
      await expect(page.locator('.blogPost').first()).toHaveText(/I like testing/)      
    })
  })
})

