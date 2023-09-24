import { launch } from 'puppeteer'
import axios from 'axios'
import { load } from 'cheerio'

const CIFRACLUB_URL = 'https://www.cifraclub.com'

async function getSongLinks(songs_list) {
  const response = await axios.get(songs_list)
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
    const browser2 = await launch({ headless: 'new' })
    const page2 = await browser2.newPage()
    await page2.setContent(combinedHtml)
    const pdfBlob = await page2.pdf()
    await browser2.close()
    return pdfBlob
}

async function main(musician_id) {
  const songs_list = `${CIFRACLUB_URL}/musico/${musician_id}/repertorio/favoritas/`
  try {
    const songsLinks = await getSongLinks(songs_list)
    const songDicts = songsLinks.map(songLink => songDict(songLink))
    songDicts.sort((a, b) => a.name.localeCompare(b.name))
    const printLinks = songDicts.map(song => song.print_link)
    const blob = await htmlToPdf(printLinks)
    return blob
  } catch (error) {
    console.error(error)
  }
}

export default main