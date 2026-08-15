import { tool } from "@langchain/core/tools";
import { z } from "zod";

const getAbriviationTool = tool(
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
            Revelation: 'REV'
        }
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
