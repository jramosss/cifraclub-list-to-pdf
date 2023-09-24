import express from 'express'
import bodyParser from 'body-parser'

import generatePDF from './parser.mjs'
import upload from './uploader.mjs'

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'))

app.post('/generate-pdf', async (req, res) => {
    const { musician_id } = req.body

    if (!musician_id) return res.status(400).json({error: 'Missing musician_id'})
    
    
    try {
        const pdfBlob = await generatePDF(musician_id)
        const { Location } = await upload(pdfBlob)
        res.status(200).json({ url: Location })
    } catch (error) {
        res.status(500).json({
            error: error.message,
            trace: error.stack,
        })
        throw error
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
