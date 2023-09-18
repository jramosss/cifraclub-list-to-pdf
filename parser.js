import { launch } from 'puppeteer'
import axios from 'axios'
import { load } from 'cheerio'

const YOUR_MUSICIAN_ID = 551928421
const CIFRACLUB_URL = 'https://www.cifraclub.com'
const SONGS_LIST = `${CIFRACLUB_URL}/musico/${YOUR_MUSICIAN_ID}/repertorio/favoritas/`

async function getSongLinks() {
  const response = await axios.get(SONGS_LIST)
  const $ = load(response.data)
  const links = []

  $('#js-mod-read-list a').each((index, element) => {
    links.push($(element).attr('href'))
  })

  return links
}

function getArtistAndName(songLink) {
  const pieces = songLink.split('/').filter(piece => piece !== '' && piece !== 'simplificada.html')
  return pieces
}

function getPrintLink(songLink) {
  return `${CIFRACLUB_URL}${songLink}imprimir.html#tabs=false&footerChords=false`.replace('simplificada.html', '')
}

function songDict(songLink) {
  const [artist, name] = getArtistAndName(songLink)
  return {
    'artist': artist,
    'name': name,
    'print_link': getPrintLink(songLink)
  }
}

async function getHTMLContent(links) {
  const browser = await launch({ headless: 'new' })
  const page = await browser.newPage()

  const htmlContentArray = []

  for (const url of links) {
      await page.goto(url, { waitUntil: 'networkidle0' })
      const html = await page.content()
      htmlContentArray.push(html)
  }

  await browser.close()

  return htmlContentArray.join('\n\n')
}

async function htmlToPdf (links) {
    const combinedHtml = await getHTMLContent(links)
    const pdfPath = 'cancionero.pdf'
    const browser2 = await launch({ headless: 'new' })
    const page2 = await browser2.newPage()
    await page2.setContent(combinedHtml)
    const pdfOptions = {
        path: pdfPath,
        format: 'A5',
    }
    await page2.pdf(pdfOptions)
    await browser2.close()
}

async function main() {
  try {
    const songsLinks = await getSongLinks()
    const songDicts = songsLinks.map(songLink => songDict(songLink))
    songDicts.sort((a, b) => a.name.localeCompare(b.name))
    const printLinks = songDicts.map(song => song.print_link)
    await htmlToPdf(printLinks)
  } catch (error) {
    console.error(error)
  }
}

main()
