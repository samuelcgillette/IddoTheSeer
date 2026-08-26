import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { PDFParse } from 'pdf-parse';

export const getAbriviationTool = tool(
    async ({ bookTitle }) => {
        console.log(`\n[System] Executing tool for book: ${bookTitle}...`);
        const bookTitles = {
            Genesis: 'GEN',
            Exodus: 'EXO',
            Leviticus: 'LEV',
            Numbers: 'NUM',
            Deuteronomy: 'DEU',
            Joshua: 'JOS',
            Judges: 'JDG',
            Ruth: 'RUT',
            '1 Samuel': '1SA',
            '2 Samuel': '2SA',
            '1 Kings': '1KI',
            '2 Kings': '2KI',
            '1 Chronicles': '1CH',
            '2 Chronicles': '2CH',
            Ezra: 'EZR',
            Nehemiah: 'NEH',
            Esther: 'EST',
            Job: 'JOB',
            Psalms: 'PSA',
            Proverbs: 'PRO',
            Ecclesiastes: 'ECC',
            'Song of Solomon': 'SNG',
            Isaiah: 'ISA',
            Jeremiah: 'JER',
            Lamentations: 'LAM',
            Ezekiel: 'EZK',
            Daniel: 'DAN',
            Hosea: 'HOS',
            Joel: 'JOL',
            Amos: 'AMO',
            Obadiah: 'OBA',
            Jonah: 'JON',
            Micah: 'MIC',
            Nahum: 'NAH',
            Habakkuk: 'HAB',
            Zephaniah: 'ZEP',
            Haggai: 'HAG',
            Zechariah: 'ZEC',
            Malachi: 'MAL',
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
        console.log(`\n[System] Found abbreviation: ${bookTitles[bookTitle]} for book: ${bookTitle}`);
        return bookTitles[bookTitle] ;
    },
    {
        name: "get_abriviation_tool",
        description: "Get the correct abreviation for a bible book title",
        schema: z.object({
            bookTitle: z.string().describe("The bible book title e.g., Matthew")
        }),
    }
);

export const getBookText = tool(
    async ({ bookAbriviation, pageNumber }) => {
        console.log(`getting ${bookAbriviation}`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_${bookAbriviation}.pdf` });
        const text = await parser.getText({partial: [Number(pageNumber)]});
        parser.destroy();
        return text;
    },
    {
        name: "get_book_text",
        description: "Get the text of a bible book using the abreviation from get_abriviation_tool. Do not insert a book abreviation that is not from the get_abriviation_tool.",
        schema: z.object({
            bookAbriviation: z.string().describe("The abreviation recived from get_abriviation_tool. It must be all caps and the correct abreviation for the book you are trying to get the text for. ex MAT for Matthew, JHN for John, etc. Exact abreviations are found in the get_abriviation_tool."),
            pageNumber: z.string().describe("The page number of the book you want to get the text for, provided as a numeric string (for example \"1\", \"2\", \"3\"). The page number is the page number in the PDF document. It is not the chapter or verse number. The page number is used to get a specific section of the book text. If you want to progress through the entire book text you can call this tool multiple times with incrementing page numbers until the desire result is found. Start at \"1\" and increment. This value can not be greater than the total number of pages in the book.")
        }),
    }
);

export const getNumberOfPages = tool(
    async ({ bookAbriviation }) => {
        console.log(`getting number of pages for ${bookAbriviation}`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_${bookAbriviation}.pdf` });
        const result = await parser.getInfo({ parsePageInfo: true }); 
        parser.destroy();
        return result.total
    },
    {
        name: "get_number_of_pages",
        description: "Get the number of pages in a bible book using the abreviation from get_abriviation_tool. Do not insert a book abreviation that is not from the get_abriviation_tool.",
        schema: z.object({
            bookAbriviation: z.string().describe("The abreviation recived from get_abriviation_tool. It must be all caps and the correct abreviation for the book you are trying to get the text for. ex MAT for Matthew, JHN for John, etc. Exact abreviations are only found in the get_abriviation_tool.")
        }),
    }
);

export const getAllNewTestament = tool(
    //479 pages
    async ({pageNumber}) => {
        const numericPageNumber = Number(pageNumber);
        if (numericPageNumber < 1 || numericPageNumber > 479) {
            throw new Error("Page number must be between 1 and 479 for the New Testament.");
        }
        console.log(`getting all new testament books`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_nt.pdf` });
        const page = await parser.getText({partial: [numericPageNumber]});
        parser.destroy();
        return page;
    },
    {
        name: "get_all_new_testament",
        description: "Get a page of text from all New Testament books in one document. This tool is not required if you already know the names of the specific books you want to reference. Its purpose is to provide the entire New Testament if the user needs a comprehensive view.",
        schema: z.object({
            pageNumber: z.string().describe("The page number of the New Testament you want to get the text for, provided as a numeric string (for example \"1\", \"2\", \"3\"). The page number is the page number in the PDF document. It is not the chapter or verse number. The page number is used to get a specific section of the New Testament text. If you want to progress through the entire New Testament text you can call this tool multiple times with incrementing page numbers until the desired result is found. Start at \"1\" and increment. This value cannot be greater than 479.")
        }),
    }
);

export const getOldTestament = tool(
    //1107 pages
    async ({pageNumber}) => {
        const numericPageNumber = Number(pageNumber);
        if (numericPageNumber < 1 || numericPageNumber > 1107) {
            throw new Error("Page number must be between 1 and 1107 for the Old Testament.");
        }
        console.log(`getting all old testament books`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_ot.pdf` });
        const page = await parser.getText({partial: [numericPageNumber]});
        parser.destroy();
        return page;
    },
    {
        name: "get_old_testament",
        description: "Get a page of text from all Old Testament books in one document. This tool is not required if you already know the names of the specific books you want to reference. Its purpose is to provide the entire Old Testament if the user needs a comprehensive view.",
        schema: z.object({
            pageNumber: z.string().describe("The page number of the Old Testament you want to get the text for, provided as a numeric string (for example \"1\", \"2\", \"3\"). The page number is the page number in the PDF document. It is not the chapter or verse number. The page number is used to get a specific section of the Old Testament text. If you want to progress through the entire Old Testament text you can call this tool multiple times with incrementing page numbers until the desired result is found. Start at \"1\" and increment. This value cannot be greater than 1107.")
        }),
    }
);

export const getAllBible = tool(
    //1473 bible
    async ({pageNumber}) => {
        const numericPageNumber = Number(pageNumber);
        if (numericPageNumber < 1 || numericPageNumber > 1473) {
            throw new Error("Page number must be between 1 and 1473 for the entire Bible.");
        }
        console.log(`getting all books in the bible`)
        const parser = new PDFParse({ url: `https://ebible.org/pdf/eng-kjv2006/eng-kjv2006_all.pdf` });
        const page = await parser.getText({partial: [numericPageNumber]});
        parser.destroy();
        return page;
    },
    {
        name: "get_all_bible",
        description: "Get a page of text from the entire Bible in one document. This tool is not required if you already know the names of the specific books you want to reference or if you know you need to reference the New Testament. Its purpose is to provide the entire Bible, including the Old Testament, if the user needs a comprehensive view.",
        schema: z.object({pageNumber: z.string().describe("The page number of the Bible you want to get the text for, provided as a numeric string (for example \"1\", \"2\", \"3\"). The page number is the page number in the PDF document. It is not the chapter or verse number. The page number is used to get a specific section of the Bible text. If you want to progress through the entire Bible text you can call this tool multiple times with incrementing page numbers until the desired result is found. Start at \"1\" and increment. This value cannot be greater than 1473.")}),
    }


);