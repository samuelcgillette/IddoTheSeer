import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { PDFParse } from 'pdf-parse';

export const getAbriviationTool = tool(
    async ({ bookTitle }) => {
        console.log(`\n[System] Executing tool for book: ${bookTitle}...`);
        const bookTitles = {
            Matthew: 'MAT',
            Mark: 'MRK',
            Luke: 'LUK',
            John: 'JHN',
            Acts: 'ACT',
            Romans: 'ROM',
            '1 Corinthians': '1CO',
            '2 Corinthians': '2CO',
            Galatians: 'GAL',
            Ephesians: 'EPH',
            Philippians: 'PHP',
            Colossians: 'COL',
            '1 Thessalonians': '1TH',
            '2 Thessalonians': '2TH',
            '1 Timothy': '1TI',
            '2 Timothy': '2TI',
            Titus: 'TIT',
            Philemon: 'PHM',
            Hebrews: 'HEB',
            James: 'JAS',
            '1 Peter': '1PE',
            '2 Peter': '2PE',
            '1 John': '1JN',
            '2 John': '2JN',
            '3 John': '3JN',
            Jude: 'JUD',
            Revelations: 'REV'
        }
        console.log(`\n[System] Found abbreviation: ${bookTitles[bookTitle]} for book: ${bookTitle}`);
        return bookTitles[bookTitle] ;
    },
    {
        name: "get_abriviation_tool",
        description: "Get the correct abreviation for a New Testament book title",
        schema: z.object({
            bookTitle: z.string().describe("The New Testament book title e.g., Matthew")
        }),
    }
);

export const getBookText = tool(
    async ({ bookAbriviation }) => {
        console.log(`getting ${bookAbriviation}`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_${bookAbriviation}.pdf` });
        return await parser.getText();
    },
    {
        name: "get_book_text",
        description: "Get the text of a new testament book using the abreviation from get_abriviation_tool. Do not insert a book abreviation that is not from the get_abriviation_tool.",
        schema: z.object({
            bookAbriviation: z.string().describe("The abreviation recived from get_abriviation_tool. It must be all caps and the correct abreviation for the book you are trying to get the text for. ex MAT for Matthew, JHN for John, etc. Exact abreviations are found in the get_abriviation_tool.")
        }),
    }
);
