import express from 'express'
import bodyParser from 'body-parser'

import generatePDF from './parser.mjs'
import upload from './uploader.mjs'

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static('public'))

// API endpoint for PDF generation
app.post('/generate-pdf', async (req, res) => {
    const { musician_id } = req.body
    console.log('Received request', musician_id)

    if (!musician_id) return res.status(400).json({error: 'Missing musician_id'})
    
    
    try {
        // Use your Node.js logic to generate the PDF
        const pdfBlob = await generatePDF(musician_id)
        console.log('PDF generated')
        const { Location } = await upload(pdfBlob)
        console.log('PDF uploaded')
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
