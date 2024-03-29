import puppeteer from 'puppeteer'
import moment from 'moment'
import delay from 'delay'
import fs from 'fs-extra'
import path from 'path'

/**
 * Browser options
 */
const browserHide = false
const browserPageOpt = { waitUntil: 'networkidle0' }
const browserOptions = {
  // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: browserHide,
  args: [
    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"'
  ]
}

//kumpulan selector
const uploadButtonSelector = `/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div[1]/div/div/div/div/div/div[1]`
const nextButtonSelector = `//*[starts-with(@id, "mount")]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[3]/div[2]/div/div/div`
const nextButtonSelector2 = `//*[starts-with(@id, "mount")]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[3]/div[2]/div[2]/div[1]/div`
const nextButtonSelector3 = `/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[3]/div[2]/div[2]/div[1]/div`
const textAreaSelector = `//*[starts-with(@id, "mount")]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[1]/div[1]`
const publishButtonSelector = `//*[starts-with(@id, "mount")]/div/div[1]/div/div[3]/div/div/div[1]/form/div/div/div[1]/div/div[3]/div[2]/div[2]/div[1]`
const ended = `/html/body/div[1]/div/div[1]/div/div[5]/div/div/div[3]/div[2]/div/div/div[1]/div/div/div/div/div[2]/div[1]/div/div/div[2]/div[2]`

//fungsi cek sesi valid
function checkSession(filecookie) {
    return new Promise(async (resolve, reject) => {
      try {
        const fullPath = path.resolve(filecookie);
        const cookies = JSON.parse(await fs.readFile(fullPath))
        if (cookies.length !== 0) {
          resolve(true)
        } else {
          resolve(false)
        }
      } catch (err) {
        resolve(false)
      }
    })
  }

/**
 * Generate console log with timestamp
 */
function printLog(str) {
    const date = moment().format('HH:mm:ss')
    console.log(`[${date}] ${str}`)
}
  
/**
 * Run browser instance
 */
async function runBrowser(filecookie) {
    const browser = await puppeteer.launch(browserOptions)
    const browserPage = await browser.newPage()
    //await browserPage.setViewport({ width: 1920, height: 1080 })
    const resCheckSession = await checkSession(filecookie)
    if (resCheckSession) {
        printLog('INFO: Session ditemukan, mencoba akses Facebook...')
        const fullPath = path.resolve(filecookie);
        await browserPage.setCookie(...JSON.parse(await fs.readFile(fullPath)))
        return { browser, page: browserPage }
    } else {
        printLog('INFO: Session tidak ditemukan...')
    }
}

/**
 * Upload video to reels via browser
 */
export const ReelsUpload = async (namafile, caption, filecookie) => {
  const { browser, page } = await runBrowser(filecookie)
  try {
    await page.goto('https://www.facebook.com/reels/create', browserPageOpt)
    printLog("Berhasil membuka fb")
    const uploadElement = await page.$x(uploadButtonSelector);
        const [filechooser] = await Promise.all([
        page.waitForFileChooser(),
        await uploadElement[0].click()
        ])
        await delay(2000)
        const fullPath = path.resolve(namafile);
        filechooser.accept([fullPath])
        printLog(`sukses Upload video ${namafile}`)
        await delay(5000)
        const nextElement = await page.$x(nextButtonSelector);
        await nextElement[0].click()
        await delay(2000)
        const nextElement2 = await page.$x(nextButtonSelector2);
        await nextElement2[0].click()
        await delay(2000)
        const usernameElement = await page.$x(textAreaSelector);
        await usernameElement[0].click();
        const tanggalupload = moment().format('MMMM Do YYYY, HH:mm:ss')
        await usernameElement[0].type(`${caption}`);
        printLog("Menginput Caption...")
        const PostButton = await page.$x(publishButtonSelector);
        await PostButton[0].click()
        printLog("Post ke Reels", 'yellow')
        await page.waitForNavigation()
        await browser.close()
        printLog("Berhasil")
        
  } catch (err) {
      printLog("gagal")
      console.log(err)
      await browser.close()
  }
}