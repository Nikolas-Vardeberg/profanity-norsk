import fs from "fs"
import csv from "csv-parser"
import { Index } from "@upstash/vector"


interface Row {
    text: string
}

const index = new Index({
  url: "https://fast-deer-83754-us1-vector.upstash.io",
  token: "ABMFMGZhc3QtZGVlci04Mzc1NC11czFhZG1pblpHUmtNak5sTmpjdE9UWmpOQzAwTURJeUxUZ3lPVFl0TXpNek9UUmhNREZqTVRRMw==",
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