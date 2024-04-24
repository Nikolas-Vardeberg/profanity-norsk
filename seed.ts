import fs from "fs"
import csv from "csv-parser"
import { Index } from "@upstash/vector"


interface Row {
    text: string
}

const index = new Index({
    url: "https://light-goose-40616-us1-vector.upstash.io",
    token: "ABUFMGxpZ2h0LWdvb3NlLTQwNjE2LXVzMWFkbWluTkRNelltUmtNR0V0WWpReU9TMDBPRGRqTFdKaU1ETXRNek5oWW1FM01qWTFZV1pt",
  })
  

async function parseCSV(filePath: string): Promise<Row[]> {
    return new Promise((resolve, reject) => {
        const rows: Row[] = []

        fs.createReadStream(filePath)
            .pipe(csv({separator: ","}))
            .on("data", (row) => {
                rows.push(row)
            })
            .on("error", (err) => {
                reject(err)
            })
            .on("end", () => {
                resolve(rows)
            })
    })
}
const STEP = 30
const seed = async () => {
    const data = await parseCSV("training-dataset.csv")

    for (let i = 0; i < data.length; i += STEP){
        const chunk = data.slice(i, i + STEP)

        const formatted = data.map((row, batchIndex) => ({
            data: row.text,
            id: i + batchIndex,
            metadata: { text: row.text },
          }))
      
        await index.upsert(formatted)          
      
    }
}

seed()